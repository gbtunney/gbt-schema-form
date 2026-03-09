// Tests for scrape-service
// Uses vi.stubGlobal to mock fetch — no network calls made.

import { afterEach, describe, expect, test, vi } from 'vitest'
import { getEnv } from './../config/env.js'
import { createScrapeService } from './scrape-service.js'
// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(
    body: string,
    status = 200,
    contentType = 'text/html',
    resolvedUrl = 'https://example.com/resolved',
): void {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            headers: { get: () => contentType },
            ok: status >= 200 && status < 300,
            status,
            statusText: status === 200 ? 'OK' : 'Error',
            text: () => Promise.resolve(body),
            url: resolvedUrl,
        }),
    )
}

// ─── createScrapeService integration tests ────────────────────────────────────

describe('createScrapeService', () => {
    const scrape = createScrapeService()

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    test('returns structured scrape output from HTML page', async () => {
        mockFetch(
            '<h1>Title</h1><ul><li>Item</li></ul>',
            200,
            'text/html',
            'https://example.com/final',
        )
        const result = await scrape({ url: 'https://example.com' })

        expect(result.text).toContain('# Title')
        expect(result.text).toContain('• Item')
        expect(result.raw).toBe('<h1>Title</h1><ul><li>Item</li></ul>')
        expect(result.url).toBe('https://example.com/final')
        expect(result.content_type).toBe('text/html')
    })

    test('returns plain text directly without HTML parsing', async () => {
        mockFetch(
            'raw text content',
            200,
            'text/plain',
            'https://example.com/file.txt',
        )
        const result = await scrape({ url: 'https://example.com/file.txt' })

        expect(result.text).toBe('raw text content')
        expect(result.raw).toBe('raw text content')
        expect(result.url).toBe('https://example.com/file.txt')
        expect(result.content_type).toBe('text/plain')
    })

    test('throws on 404', async () => {
        mockFetch('Not Found', 404)
        await expect(
            scrape({ url: 'https://example.com/missing' }),
        ).rejects.toThrow('404')
    })

    test('throws on 500', async () => {
        mockFetch('Server Error', 500)
        await expect(scrape({ url: 'https://example.com' })).rejects.toThrow(
            '500',
        )
    })

    test('propagates network errors', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
        )
        await expect(
            scrape({ url: 'https://unreachable.local' }),
        ).rejects.toThrow('ECONNREFUSED')
    })

    test('sends correct user-agent header', async () => {
        mockFetch('<p>ok</p>')
        await scrape({ url: 'https://example.com' })
        const call = vi.mocked(fetch).mock.calls[0] as [string, RequestInit]
        expect(
            (call[1].headers as Record<string, string>)['User-Agent'],
        ).toContain('operator-scraper')
    })

    test('Scrape Test - wikipedia', async () => {
        const envs = getEnv()
        const result = await scrape({
            url: 'https://en.wikipedia.org/wiki/Blue-tongued_skink',
        })
        expect(result.text).toContain('Blue-tongued skinks')

        /** I am trying to understand mock fetch */
        mockFetch(
            '<h1>Title</h1><ul><li>Item</li></ul>',
            200,
            'text/html',
            'https://example.com/final',
        )
        const result_fetch = await scrape({
            url: 'https://en.wikipedia.org/wiki/Blue-tongued_skink',
        })
        expect(result_fetch.text).not.toContain('Blue-tongued skinks')
    })
})
