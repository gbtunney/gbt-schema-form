// packages/operator-api-server/src/services/scrape-service.ts
//
// Fetches a URL and returns readable plain text for use as an EvidenceItem.
//
// Uses node-html-parser for proper semantic conversion:
//   headings → markdown-style # prefix
//   lists    → bullet / numbered
//   tables   → tab-separated rows
//   links    → "text (url)" inline
//   breaks   → newlines
//
// This structured output gives the LLM much better signal than a flat
// string of collapsed whitespace — headings and lists survive as context.
import { htmlToText } from './../utilities/html-to-text.js'

export type ScrapeInput = {
    url: string
    timeoutMs?: number
    raw?: boolean
}

export type ScrapeService = (input: ScrapeInput) => Promise<string>

// ─── Service factory ──────────────────────────────────────────────────────────

export function createScrapeService(): ScrapeService {
    return async ({
        raw = true,
        timeoutMs = 10_000,
        url,
    }: ScrapeInput): Promise<string> => {
        const controller = new AbortController()
        const timeout = setTimeout(() => {
            controller.abort()
        }, timeoutMs)

        let response: Response
        try {
            response = await fetch(url, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (compatible; operator-scraper/1.0)',
                },
                signal: controller.signal,
            })
        } finally {
            clearTimeout(timeout)
        }

        if (!response.ok) {
            throw new Error(
                `Scrape failed: ${response.status.toString()} ${response.statusText} — ${url}`,
            )
        }

        const contentType = response.headers.get('content-type') ?? ''
        if (contentType.includes('text/plain')) {
            return (await response.text()).trim()
        }
        console.log('SCRAPE SERVICE', await response.text())
        return htmlToText(await response.text())
    }
}
