// packages/operator-api-server/src/services/scrape-service.ts
//
// Fetches a URL and returns the readable text content.
//
// No external dependencies — uses the built-in fetch API (Node 18+).
// HTML stripping is intentionally simple: strip tags, collapse whitespace.
// For more complex extraction (JS-rendered pages, pagination) swap this
// for a Playwright/Puppeteer implementation behind the same interface.
//
// TODO: extract shared createDerivationEndpoint() factory once scrape/PDF land

export type ScrapeInput = {
    /** URL to fetch */
    url: string
    /** Request timeout in ms (default: 10000) */
    timeoutMs?: number
}

export type ScrapeService = (input: ScrapeInput) => Promise<string>

/** Strip HTML tags and collapse whitespace to produce readable plain text */
function htmlToText(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
}

export function createScrapeService(): ScrapeService {
    return async ({
        timeoutMs = 10_000,
        url,
    }: ScrapeInput): Promise<string> => {
        const controller = new AbortController()
        const timeout = setTimeout(() => { controller.abort(); }, timeoutMs)

        let response: Response
        try {
            response = await fetch(url, {
                headers: {
                    // Identify politely — some sites block requests with no UA
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

        // If it's already plain text, return it directly
        if (contentType.includes('text/plain')) {
            return (await response.text()).trim()
        }

        const html = await response.text()
        return htmlToText(html)
    }
}
