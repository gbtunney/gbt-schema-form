// packages/operator-api-client/src/index.test.ts
//
// Tests for createProposalClient and createApi.
// fetch is mocked — no server running, no API key needed.
// These run fine in CI with zero environment setup.

import { afterEach, describe, expect, test, vi } from 'vitest'
import { createProposalClient } from './adapters.js'
import { createApi } from './client/api.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3001'
const ctx = { baseUrl: BASE_URL }

function mockFetchJson(body: unknown, status = 200): void {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            headers: { get: () => 'application/json' },
            json: () => Promise.resolve(body),
            ok: status < 400,
            status,
            text: () => Promise.resolve(JSON.stringify(body)),
        }),
    )
}

const sampleEvidenceItem = {
    createdAt: '2025-01-01T00:00:00Z',
    groupId: 'grp-001',
    id: 'item-001',
    pinned: false,
    selected: false,
    text: 'Dell Latitude 7440, serial DLAT-001',
    title: 'Asset label',
    updatedAt: '2025-01-01T00:00:00Z',
}

const sampleProposal = {
    confidence: 'High',
    evidenceItemId: 'item-001',
    excerpt: 'Dell Latitude 7440',
    id: 'p-1',
    path: '/model',
    value: 'Latitude 7440',
}

// ─── createApi ────────────────────────────────────────────────────────────────

describe('createApi', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    test('exposes all expected route methods', () => {
        const api = createApi(ctx)
        expect(typeof api.v1.proposals.fromEvidence.post).toBe('function')
        expect(typeof api.derive.scrape.post).toBe('function')
        expect(typeof api.derive.transcribe.post).toBe('function')
        expect(typeof api.derive.ocr.get).toBe('function')
        expect(typeof api.hello.get).toBe('function')
    })

    test('POST /derive/scrape sends url in body', async () => {
        mockFetchJson({
            data: { text: 'scraped content', url: 'https://example.com' },
            status: 'success',
        })

        const api = createApi(ctx)
        await api.derive.scrape.post({ url: 'https://example.com' })

        const call = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit]
        expect(call[1].method).toBe('POST')
        expect(JSON.parse(call[1].body as string)).toMatchObject({
            url: 'https://example.com',
        })
    })

    test('POST /derive/transcribe sends audioBase64 and mimeType', async () => {
        mockFetchJson({ data: { text: 'hello world' }, status: 'success' })

        const api = createApi(ctx)
        await api.derive.transcribe.post({
            audioBase64: 'abc123',
            mimeType: 'audio/webm',
        })

        const call = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit]
        const body = JSON.parse(call[1].body as string) as Record<
            string,
            unknown
        >
        expect(body['audioBase64']).toBe('abc123')
        expect(body['mimeType']).toBe('audio/webm')
    })

    test('POST /v1/proposals/from-evidence sends full request', async () => {
        mockFetchJson({ data: { proposals: [] }, status: 'success' })

        const api = createApi(ctx)
        await api.v1.proposals.fromEvidence.post({
            evidenceItem: sampleEvidenceItem,
            recordData: {},
            schemaId: 'equipment.v1',
        })

        const call = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit]
        expect(call[0].toString()).toContain('/v1/proposals/from-evidence')
        const body = JSON.parse(call[1].body as string) as Record<
            string,
            unknown
        >
        expect(body['schemaId']).toBe('equipment.v1')
    })
})

// ─── createProposalClient ─────────────────────────────────────────────────────

describe('createProposalClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    test('returns proposals array on success', async () => {
        mockFetchJson({
            data: { proposals: [sampleProposal] },
            status: 'success',
        })

        const client = createProposalClient(ctx)
        const result = await client({
            evidenceItem: sampleEvidenceItem,
            recordData: {},
            schemaId: 'equipment.v1',
        })

        expect(result).toHaveLength(1)
        expect(result[0]?.path).toBe('/model')
        expect(result[0]?.value).toBe('Latitude 7440')
        expect(result[0]?.confidence).toBe('High')
    })

    test('returns empty array when proposals is empty', async () => {
        mockFetchJson({ data: { proposals: [] }, status: 'success' })

        const client = createProposalClient(ctx)
        const result = await client({
            evidenceItem: sampleEvidenceItem,
            recordData: {},
            schemaId: 'equipment.v1',
        })

        expect(result).toHaveLength(0)
    })

    test('throws on error response', async () => {
        mockFetchJson({
            error: { message: 'OpenAI unavailable' },
            status: 'error',
        })

        const client = createProposalClient(ctx)
        await expect(
            client({
                evidenceItem: sampleEvidenceItem,
                recordData: {},
                schemaId: 'equipment.v1',
            }),
        ).rejects.toThrow('OpenAI unavailable')
    })

    test('throws on undefined response', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                headers: { get: () => null },
                text: () => Promise.resolve(''),
            }),
        )

        const client = createProposalClient(ctx)
        await expect(
            client({
                evidenceItem: sampleEvidenceItem,
                recordData: {},
                schemaId: 'equipment.v1',
            }),
        ).rejects.toThrow('Proposal generation failed')
    })

    test('passes jsonSchema when provided', async () => {
        mockFetchJson({ data: { proposals: [] }, status: 'success' })

        const client = createProposalClient(ctx)
        await client({
            evidenceItem: sampleEvidenceItem,
            jsonSchema: { properties: { model: { type: 'string' } } },
            recordData: {},
            schemaId: 'equipment.v1',
        })

        const call = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit]
        const body = JSON.parse(call[1].body as string) as Record<
            string,
            unknown
        >
        expect(body['jsonSchema']).toBeDefined()
    })

    test('uses baseUrl from context', async () => {
        mockFetchJson({ data: { proposals: [] }, status: 'success' })

        const client = createProposalClient({
            baseUrl: 'https://api.myapp.com',
        })
        await client({
            evidenceItem: sampleEvidenceItem,
            recordData: {},
            schemaId: 'equipment.v1',
        })

        const call = vi.mocked(fetch).mock.calls[0] as [URL, RequestInit]
        expect(call[0].toString()).toContain('api.myapp.com')
    })
})
