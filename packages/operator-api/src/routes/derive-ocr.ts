// packages/operator-api/src/routes/derive-ocr.ts
// Defines the OCR derivation endpoint. Accepts either an image URL or
// base64‑encoded image data and returns extracted text.

import { z } from 'zod'
import type { Services } from '../server.js'

// Request structure: one of imageUrl or base64 must be provided.
export const deriveOcrEndpoint = {
    handler: async ({ ctx, input }: { input: any; ctx: { services: Services } }) => {
        const text = await ctx.services.ocr(input)
        return { text }
    },
    input: z
        .object({
            base64: z.string().optional(),
            imageUrl: z.string().url().optional(),
        })
        .refine((data) => data.imageUrl || data.base64, {
            message: 'Provide either imageUrl or base64',
        }),
    output: z.object({ text: z.string() }),
} as const
