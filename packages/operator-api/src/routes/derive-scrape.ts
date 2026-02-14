// packages/operator-api/src/routes/derive-scrape.ts
// Defines the web scraping derivation endpoint. Accepts a URL and
// returns extracted text from the page.

import { z } from 'zod'
import type { Services } from '../server.js'

export const deriveScrapeEndpoint = {
    handler: async ({ ctx, input }: { input: any; ctx: { services: Services } }) => {
        const text = await ctx.services.scrape(input)
        return { text }
    },
    input: z.object({ url: z.string().url() }),
    output: z.object({ text: z.string() }),
} as const
