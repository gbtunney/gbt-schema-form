// packages/operator-api-server/src/routes/derive-transcribe.ts
//
// POST /derive/transcribe
//
// Accepts a base64 audio blob, transcribes it via Whisper, and returns
// the transcript text. The client is responsible for creating the evidence
// item — this route only derives the text.
//
// This mirrors derive-ocr.ts in shape. Both return { text } so the UI
// can treat them identically when creating a new evidence item.
//
// TODO: extract shared createDerivationEndpoint() factory once scrape/PDF land

import { defaultEndpointsFactory as endpointsFactory } from 'express-zod-api'
import { z } from 'zod'
import { createWhisperService } from '../services/whisper-service.js'

export const transcribeInputSchema = z.object({
    /** Base64-encoded audio from MediaRecorder */
    audioBase64: z.string().min(1),
    /**
     * BCP-47 language hint — optional but recommended for short clips. e.g. "en", "fr", "de". Whisper auto-detects if
     * omitted.
     */
    language: z.string().optional(),
    /** Mime type reported by MediaRecorder e.g. "audio/webm", "audio/mp4" */
    mimeType: z.string().min(1),
})

export const transcribeOutputSchema = z.object({
    /** Whisper transcript text — ready to save as an EvidenceItem */
    text: z.string(),
})

export type TranscribeInput = z.infer<typeof transcribeInputSchema>
export type TranscribeOutput = z.infer<typeof transcribeOutputSchema>

// Instantiate once — holds the OpenAI client
const whisperService = createWhisperService()

export const deriveTranscribeEndpoint = endpointsFactory.build({
    description:
        'Transcribe an audio recording using OpenAI Whisper. ' +
        'Send a base64-encoded audio blob and receive the transcript text. ' +
        'The caller creates the evidence item from the returned text.',
    handler: async ({ input, logger }) => {
        logger.info(
            `Transcribing audio (${input.mimeType}, lang: ${input.language ?? 'auto'})`,
        )

        const text = await whisperService({
            audioBase64: input.audioBase64,
            language: input.language,
            mimeType: input.mimeType,
        })

        if (!text) {
            throw new Error('Transcription failed: empty response from Whisper')
        }

        logger.info(`Transcription complete: ${text.length.toString()} chars`)
        return { text }
    },
    input: transcribeInputSchema,
    method: 'post',
    output: transcribeOutputSchema,
})
