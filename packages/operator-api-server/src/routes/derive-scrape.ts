// packages/operator-api-server/src/routes/derive-scrape.ts
//
// POST /derive/scrape
//
// Fetches a URL and returns the readable text content.
// Same output shape as derive-transcribe and derive-ocr: { text }.
//
// TODO: extract shared createDerivationEndpoint() factory once scrape/PDF land

import { defaultEndpointsFactory as endpointsFactory } from 'express-zod-api'
import { z } from 'zod'
import { createScrapeService } from '../services/scrape-service.js'

export const scrapeInputSchema = z.object({
    /** Request timeout in milliseconds. Default: 10000. */
    timeoutMs: z.number().int().positive().optional(),
    /** URL to fetch and extract text from */
    url: z.url(),
})

export const scrapeOutputSchema = z.object({
    /** Readable plain text extracted from the page — ready to save as an EvidenceItem */
    text: z.string(),
    /** The resolved URL (may differ from input if redirected) */
    url: z.string(),
})

export type ScrapeInput = z.infer<typeof scrapeInputSchema>
export type ScrapeOutput = z.infer<typeof scrapeOutputSchema>

const scrapeService = createScrapeService()

export const deriveScrapeEndpoint = endpointsFactory.build({
    description:
        'Fetch a URL and extract readable text. ' +
        'Returns plain text stripped of HTML, scripts, and styles. ' +
        'The caller creates the evidence item from the returned text.',
    handler: async ({ input, logger }) => {
        logger.info(`Scraping: ${input.url}`)

        const text = await scrapeService({
            timeoutMs: input.timeoutMs,
            url: input.url,
        })

        if (!text) {
            throw new Error(`Scrape returned empty content for: ${input.url}`)
        }

        logger.info(
            `Scrape complete: ${text.length.toString()} chars from ${input.url}`,
        )
        return { text, url: input.url }
    },
    input: scrapeInputSchema,
    method: 'post',
    output: scrapeOutputSchema,
})
