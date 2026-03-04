// packages/operator-api-server/src/services/whisper-service.ts
//
// Transcribes audio blobs using OpenAI Whisper (whisper-1).
//
// Input:  base64-encoded audio + mime type (audio/webm, audio/mp4, audio/ogg)
// Output: transcript string
//
// Browser MediaRecorder outputs different formats per vendor:
//   Chrome/Firefox → audio/webm;codecs=opus
//   Safari         → audio/mp4
// Whisper accepts all of these — just pass the mime type through so the
// File object has the right extension hint.
//
// TODO: extract shared createDerivationEndpoint() factory once scrape/PDF land

import OpenAI from 'openai'
import { env } from '../config/env.js'

export type WhisperInput = {
    /** Base64-encoded audio blob from MediaRecorder */
    audioBase64: string
    /** Mime type reported by MediaRecorder, e.g. "audio/webm" */
    mimeType: string
    /** Optional BCP-47 language hint e.g. "en", improves accuracy */
    language?: string
}

export type WhisperService = (input: WhisperInput) => Promise<string>

/** Map mime type to a file extension Whisper recognises */
function extensionForMimeType(mimeType: string): string {
    if (mimeType.includes('mp4')) return 'mp4'
    if (mimeType.includes('ogg')) return 'ogg'
    if (mimeType.includes('wav')) return 'wav'
    if (mimeType.includes('flac')) return 'flac'
    // default — webm covers Chrome + Firefox
    return 'webm'
}

export function createWhisperService(): WhisperService {
    const client = new OpenAI({ apiKey: env.openAiApiKey })

    return async ({
        audioBase64,
        language,
        mimeType,
    }: WhisperInput): Promise<string> => {
        const buffer = Buffer.from(audioBase64, 'base64')
        const ext = extensionForMimeType(mimeType)

        // OpenAI SDK accepts a File object — name drives the format detection
        const file = new File([buffer], `recording.${ext}`, { type: mimeType })

        const result = await client.audio.transcriptions.create({
            file,
            model: 'whisper-1',
            // language hint is optional but speeds up transcription and reduces
            // hallucination on short clips
            ...(language ? { language } : {}),
        })

        return result.text
    }
}
