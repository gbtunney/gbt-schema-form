// Tests for scrape-service — uses vi.stubGlobal to mock fetch
// No network calls are made.

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
            statusText: status === 200 ? 'OK' : 'Not Found',
            text: () => Promise.resolve(html),
        }),
    )
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('scrape-service', () => {
    const scrape = createScrapeService()

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('HTML stripping', () => {
        test('strips tags and returns readable text', async () => {
            mockFetch('<html><body><h1>Hello</h1><p>World</p></body></html>')
            const text = await scrape({ url: 'https://example.com' })
            expect(text).toBe('Hello World')
        })

        test('removes script tags and their content', async () => {
            mockFetch('<body><script>alert("xss")</script><p>Clean</p></body>')
            const text = await scrape({ url: 'https://example.com' })
            expect(text).toBe('Clean')
        })

        test('removes style tags and their content', async () => {
            mockFetch(
                '<body><style>.foo { color: red }</style><p>Visible</p></body>',
            )
            const text = await scrape({ url: 'https://example.com' })
            expect(text).toBe('Visible')
        })

        test('decodes common HTML entities', async () => {
            mockFetch('<p>AT&amp;T &lt;3 &quot;quotes&quot;</p>')
            const text = await scrape({ url: 'https://example.com' })
            expect(text).toBe('AT&T <3 "quotes"')
        })

        test('collapses whitespace', async () => {
            mockFetch('<p>too   many    spaces</p>\n\n<p>and newlines</p>')
            const text = await scrape({ url: 'https://example.com' })
            expect(text).toBe('too many spaces and newlines')
        })
    })

    describe('content-type handling', () => {
        test('returns plain text directly without stripping', async () => {
            mockFetch('raw text content here', 200, 'text/plain')
            const text = await scrape({ url: 'https://example.com/file.txt' })
            expect(text).toBe('raw text content here')
        })
    })

    describe('error handling', () => {
        test('throws on non-2xx response', async () => {
            mockFetch('Not Found', 404)
            await expect(
                scrape({ url: 'https://example.com/missing' }),
            ).rejects.toThrow('404')
        })

        test('throws on 500 response', async () => {
            mockFetch('Server Error', 500)
            await expect(
                scrape({ url: 'https://example.com' }),
            ).rejects.toThrow('500')
        })

        test('propagates fetch network errors', async () => {
            vi.stubGlobal(
                'fetch',
                vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
            )
            await expect(
                scrape({ url: 'https://unreachable.local' }),
            ).rejects.toThrow('ECONNREFUSED')
        })
    })

    describe('real-world HTML shapes', () => {
        test('extracts readable text from a typical article page', async () => {
            mockFetch(`
                <html>
                <head>
                    <title>Article Title</title>
                    <style>body { font-size: 16px }</style>
                </head>
                <body>
                    <nav><a href="/">Home</a></nav>
                    <main>
                        <h1>Equipment Inventory Guide</h1>
                        <p>The Dell Latitude 7440 ships with a serial number on the base label.</p>
                        <p>Warranty expires 3 years from purchase date.</p>
                    </main>
                    <script>window.analytics = {}</script>
                </body>
                </html>
            `)
            const text = await scrape({ url: 'https://example.com/article' })
            expect(text).toContain('Equipment Inventory Guide')
            expect(text).toContain('Dell Latitude 7440')
            expect(text).not.toContain('window.analytics')
            expect(text).not.toContain('font-size')
        })
    })
})
