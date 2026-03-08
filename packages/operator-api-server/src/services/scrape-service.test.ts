// Tests for scrape-service
// Uses vi.stubGlobal to mock fetch — no network calls made.

import { afterEach, describe, expect, test, vi } from 'vitest'
import { createScrapeService } from './scrape-service.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(
    html: string,
    status = 200,
    contentType = 'text/html',
): void {
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
            headers: { get: () => contentType },
            ok: status >= 200 && status < 300,
            status,
            statusText: status === 200 ? 'OK' : 'Error',
            text: () => Promise.resolve(html),
        }),
    )
}

// ─── createScrapeService integration tests ────────────────────────────────────

describe('createScrapeService', () => {
    const scrape = createScrapeService()

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    test('returns structured text from HTML page', async () => {
        mockFetch('<h1>Title</h1><ul><li>Item</li></ul>')
        const text = await scrape({ url: 'https://example.com' })
        expect(text).toContain('# Title')
        expect(text).toContain('• Item')
    })

    test('returns plain text directly without parsing', async () => {
        mockFetch('raw text content', 200, 'text/plain')
        const text = await scrape({ url: 'https://example.com/file.txt' })
        expect(text).toBe('raw text content')
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
})
