// packages/operator-api/src/routes/derive-ocr.ts
// Defines the OCR derivation endpoint. Accepts either an image URL or
// base64‑encoded image data and returns extracted text.

// Request structure: one of imageUrl or base64 must be provided.
import { defaultEndpointsFactory as endPointsFactory } from 'express-zod-api'
import { z } from 'zod'

export const helloWorldEndpoint = endPointsFactory.build({
    handler: async ({ ctx, input: { name }, logger }) => {
        await logger.debug('Context:', ctx) // middlewares provide ctx
        return { greetings: `Hello, ${name || 'World'}. Happy coding!` }
    },
    // method: "get" (default) or array ["get", "post", ...]
    input: z.object({
        name: z.string().default('World'),
        nickname: z
            .string()
            .min(1)
            .refine(
                (nick) => !/^\d.*$/.test(nick),
                'Nickname cannot start with a digit',
            ),
    }),
    method: ['get', 'post'],
    output: z.object({
        greetings: z.string(),
    }),
})
