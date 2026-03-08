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
import z from 'zod'
import { htmlToText } from './../utilities/html-to-text.js'

const MIME_TYPES = ['text/plain', 'text/html', 'application/json'] as const
type MimeType = (typeof MIME_TYPES)[number]

const mimeTypeSchema = z.enum(MIME_TYPES)

function normalizeMimeType(contentTypeHeader: string | null): MimeType | null {
    if (!contentTypeHeader) return null
    const mimeType = contentTypeHeader.split(';')[0]?.trim().toLowerCase()
    return MIME_TYPES.includes(mimeType as MimeType)
        ? (mimeType as MimeType)
        : null
}

export const scrapeInputSchema = z.object({
    /** Request timeout in milliseconds. Default: 10000. */
    timeoutMs: z.number().int().positive().default(10_000),
    /** URL to fetch and extract text from */
    url: z.url(),
})

export const scrapeOutputSchema = z.object({
    /** The content type (e.g., text/html, application/json) */
    content_type: mimeTypeSchema.nullable(),
    /** The raw content type (e.g., text/html, application/json) */
    content_type_raw: z.string().nullable(),
    /** The raw text extracted from the page */
    raw: z.string().trim().min(1, 'raw must contain non-whitespace content'),
    /** Readable plain text extracted from the page — ready to save as an EvidenceItem */
    /** Regexp requires at least one non-whitespace character: /\S/ */
    text: z.string().trim().min(1, 'text must contain non-whitespace content'),
    /** The resolved URL (may differ from input if redirected) */
    url: z.url(), // optional but useful
})

export type ScrapeInput = z.input<typeof scrapeInputSchema> /* {
    url: string
    timeoutMs?: number
}*/
export type ScrapeOutput = z.infer<typeof scrapeOutputSchema>

export type ScrapeService = (input: ScrapeInput) => Promise<ScrapeOutput>

// ─── Service factory ──────────────────────────────────────────────────────────

export function createScrapeService(): ScrapeService {
    return async ({
        timeoutMs = 10_000,
        url,
    }: ScrapeInput): Promise<ScrapeOutput> => {
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
        const responseText = await response.text()
        const contentTypeRaw = response.headers.get('content-type')
        const contentType = normalizeMimeType(contentTypeRaw)
        const unParsedResult: z.infer<typeof scrapeOutputSchema> = {
            content_type: contentType,
            content_type_raw: contentTypeRaw,
            raw: responseText,
            // todo: someday- maybe change json to yaml
            text:
                contentType === 'text/plain'
                    ? responseText.trim()
                    : htmlToText(responseText),
            url: response.url,
        }
        /*
content_type: contentType.includes('text/html')
    ? 'text/html'
    : contentType.includes('application/json')
      ? 'application/json'
      : 'text/plain',
})  */

        const zodResult = scrapeOutputSchema.parse(unParsedResult)
        return zodResult
    }
}
