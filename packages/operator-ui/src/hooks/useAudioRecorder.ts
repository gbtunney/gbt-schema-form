// packages/operator-ui/src/hooks/useAudioRecorder.ts
//
// Manages MediaRecorder lifecycle for click-to-start / click-to-stop recording.
//
// Returns:
//   state    — idle | recording | error
//   start()  — request mic permission + begin recording
//   stop()   — stop recording, fire onComplete with blob + mimeType
//
// Does NOT call the server — that's the caller's responsibility.

import { useCallback, useRef, useState } from 'react'

export type RecorderState = 'idle' | 'recording' | 'error'

export type AudioResult = {
    blob: Blob
    mimeType: string
}

export type UseAudioRecorderReturn = {
    errorMessage: string | null
    start: () => Promise<void>
    state: RecorderState
    stop: () => void
}

export function useAudioRecorder(
    onComplete: (result: AudioResult) => void,
): UseAudioRecorderReturn {
    const [state, setState] = useState<RecorderState>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const recorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Array<Blob>>([])

    const start = useCallback((): Promise<void> => {
        return (async (): Promise<void> => {
            setErrorMessage(null)

            let stream: MediaStream
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                })
            } catch {
                setErrorMessage('Microphone access denied')
                setState('error')
                return
            }

            // Prefer webm/opus (Chrome/Firefox), fall back to mp4 (Safari)
            const mimeType =
                [
                    'audio/webm;codecs=opus',
                    'audio/webm',
                    'audio/mp4',
                    'audio/ogg',
                ].find((type) => MediaRecorder.isTypeSupported(type)) ?? ''

            const recorder = new MediaRecorder(
                stream,
                mimeType ? { mimeType } : undefined,
            )
            recorderRef.current = recorder
            chunksRef.current = []

            recorder.ondataavailable = (event): void => {
                if (event.data.size > 0) chunksRef.current.push(event.data)
            }

            recorder.onstop = (): void => {
                stream.getTracks().forEach((track) => {
                    track.stop()
                })
                const blob = new Blob(chunksRef.current, {
                    type: recorder.mimeType || mimeType || 'audio/webm',
                })
                onComplete({ blob, mimeType: blob.type })
                setState('idle')
            }

            recorder.start()
            setState('recording')
        })()
    }, [onComplete])

    const stop = useCallback((): void => {
        if (recorderRef.current?.state === 'recording') {
            recorderRef.current.stop()
        }
    }, [])

    return { errorMessage, start, state, stop }
}
