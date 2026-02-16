// packages/operator-api/src/routes/derive-whisper.ts
// Defines the audio transcription (Whisper) derivation endpoint. Accepts
// either an audio URL or base64‑encoded audio data and returns the
// transcribed text.

import { z } from 'zod'
import type { Services } from '../server.js'

export const deriveWhisperEndpoint = {
    handler: async ({ ctx, input }: { input: any; ctx: { services: Services } }) => {
        const text = await ctx.services.whisper(input)
        return { text }
    },
    input: z
        .object({
            audioUrl: z.url().optional(),
            base64: z.string().optional(),
        })
        .refine((data) => data.audioUrl || data.base64, {
            message: 'Provide either audioUrl or base64',
        }),
    output: z.object({ text: z.string() }),
} as const
