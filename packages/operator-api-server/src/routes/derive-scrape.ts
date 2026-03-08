// packages/operator-api-server/src/routes/derive-scrape.ts
//
// POST /derive/scrape
//
// Fetches a URL and returns the readable text content.
// Same output shape as derive-transcribe and derive-ocr: { text }.
//
// TODO: extract shared createDerivationEndpoint() factory once scrape/PDF land

import { defaultEndpointsFactory as endpointsFactory } from 'express-zod-api'
import {
    createScrapeService,
    scrapeInputSchema,
    ScrapeOutput,
    scrapeOutputSchema,
} from '../services/scrape-service.js'

const scrapeService = createScrapeService()

export const deriveScrapeEndpoint = endpointsFactory.build({
    description:
        'Fetch a URL and extract readable text. ' +
        'Returns plain text stripped of HTML, scripts, and styles. ' +
        'The caller creates the evidence item from the returned text.',
    handler: async ({ input, logger }) => {
        logger.info(`Scraping: ${input.url}`)

        const result: ScrapeOutput = await scrapeService(input)

        /*  if (!text) {
            throw new Error(`Scrape returned empty content for: ${input.url}`)
      */

        logger.info(
            `Scrape complete: ${result.text.length.toString()} chars from ${input.url} raw: ${result.raw.length.toString()} chars content_type: ${result.content_type ? result.content_type : 'unknown'} `,
        )
        return result
    },
    input: scrapeInputSchema,
    method: 'post',
    output: scrapeOutputSchema,
})
