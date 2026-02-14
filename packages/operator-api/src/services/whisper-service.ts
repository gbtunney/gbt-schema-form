// packages/operator-api/src/services/whisper-service.ts
// Mock Whisper (audio transcription) service. In a real implementation
// this would call an audio transcription API such as OpenAI Whisper.
// For now it simply echoes whichever input value is provided.

export type WhisperInput = { audioUrl?: string; base64?: string }
export type WhisperService = (input: WhisperInput) => Promise<string>

export function createWhisperService(): WhisperService {
    return (input: WhisperInput) => {
        if (input.base64) return Promise.resolve(input.base64)
        return Promise.resolve(input.audioUrl ?? '')
    }
}
