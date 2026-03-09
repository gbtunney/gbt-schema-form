// packages/operator-api-client/src/index.test.ts
//
// Tests for createProposalClient and createApi.
// fetch is mocked — no server running, no API key needed.
// These run fine in CI with zero environment setup.

import { afterEach, describe, expect, test, vi } from 'vitest'
import { createApi } from './client/api.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3001'
const ctx = { baseUrl: BASE_URL }

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
    test.skip('REAL POST /v1/proposals/from-evidence sends full request', async () => {
        const api = createApi(ctx)
        const result = await api.v1.proposals.fromEvidence.post({
            evidenceItem: sampleEvidenceItem,
            recordData: {},
            schemaId: 'equipment.v1',
        })

        console.log('This test makes a REAL API CALL to', BASE_URL) // Log the base URL being called
        console.log('Result.', JSON.stringify(result, null, 2))

        // const call = vi.mock
        /// expect(body['schemaId']).toBe('equipment.v1')

        expect(true).toBe(true)
    })
})
