// packages/operator-ui/src/components/VoiceRecordButton.tsx
//
// Click-to-start / click-to-stop voice recorder.
//
// Flow:
//   1. User clicks → MediaRecorder starts (mic indicator appears in browser)
//   2. User clicks again → recording stops
//   3. Audio blob → base64 → POST /derive/transcribe
//   4. Transcript → store.evidenceItems.create() → new evidence item
//   5. onCreated() fires so the parent can refresh its list
//
// The transcribeUrl prop is the base URL of the API server, e.g.
// "http://localhost:3001". Pass undefined to use a mock (for Storybook).

import type { EvidenceOwner } from '@operator/core'
import type { OperatorStore } from '@operator/store'
import { type ReactElement, useCallback, useState } from 'react'
import { useAudioRecorder } from '../hooks/useAudioRecorder.js'

export type VoiceRecordButtonProps = {
    /** Where the new evidence item will be created */
    groupId: string
    owner: EvidenceOwner
    store: OperatorStore
    /** Base URL of the api-server, e.g. "http://localhost:3001". Undefined = mock mode. */
    transcribeUrl?: string | undefined
    /** Called after the evidence item is created so the parent can refresh */
    onCreated?: () => void
}

type TranscribeState = 'idle' | 'recording' | 'transcribing' | 'error'

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise(
        (
            resolve: (value: string) => void,
            reject: (reason?: unknown) => void,
        ): void => {
            const reader = new FileReader()
            reader.onload = (): void => {
                resolve((reader.result as string).split(',')[1] ?? '')
            }
            reader.onerror = (): void => {
                reject(reader.error ?? new Error('Failed to read blob'))
            }
            reader.readAsDataURL(blob)
        },
    )
}

async function callTranscribeApi(
    apiBase: string,
    audioBase64: string,
    mimeType: string,
): Promise<string> {
    const response = await fetch(`${apiBase}/derive/transcribe`, {
        body: JSON.stringify({ audioBase64, mimeType }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
    })

    if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`)
    }

    const json = (await response.json()) as { text: string }
    return json.text
}

/** Mock transcription for Storybook / offline dev */
async function mockTranscribe(): Promise<string> {
    await new Promise((r) => setTimeout(r, 1200))
    return 'This is a mock transcription. Replace with a real transcribeUrl to use Whisper.'
}

export function VoiceRecordButton({
    groupId,
    onCreated,
    store,
    transcribeUrl,
}: VoiceRecordButtonProps): ReactElement {
    const [transcribeState, setTranscribeState] =
        useState<TranscribeState>('idle')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleAudioComplete = useCallback(
        ({ blob, mimeType }: { blob: Blob; mimeType: string }): void => {
            void (async (): Promise<void> => {
                setTranscribeState('transcribing')
                setErrorMessage(null)

                try {
                    const audioBase64 = await blobToBase64(blob)

                    const text = transcribeUrl
                        ? await callTranscribeApi(
                              transcribeUrl,
                              audioBase64,
                              mimeType,
                          )
                        : await mockTranscribe()

                    const now = new Date()
                    const label = now.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })

                    await store.evidenceItems.create({
                        groupId,
                        text,
                        title: `Voice note ${label}`,
                    })

                    setTranscribeState('idle')
                    onCreated?.()
                } catch (error) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : 'Transcription failed',
                    )
                    setTranscribeState('error')
                }
            })()
        },
        [groupId, store, transcribeUrl, onCreated],
    )

    const {
        errorMessage: micError,
        start,
        state: recorderState,
        stop,
    } = useAudioRecorder(handleAudioComplete)

    const isRecording = recorderState === 'recording'
    const isTranscribing = transcribeState === 'transcribing'
    const isBusy = isRecording || isTranscribing
    const displayError = errorMessage ?? micError

    const handleClick = (): void => {
        if (isRecording) {
            stop()
        } else if (!isBusy) {
            void start()
        }
    }

    return (
        <div className="voice-record">
            <button
                className={[
                    'voice-record__btn',
                    isRecording ? 'voice-record__btn--recording' : '',
                    isTranscribing ? 'voice-record__btn--transcribing' : '',
                ].join(' ')}
                disabled={isTranscribing}
                onClick={handleClick}
                title={isRecording ? 'Stop recording' : 'Record voice note'}
                type="button">
                {isTranscribing ? (
                    <>
                        <span className="voice-record__spinner" />
                        Transcribing…
                    </>
                ) : isRecording ? (
                    <>
                        <span className="voice-record__dot" />
                        Stop recording
                    </>
                ) : (
                    <>
                        <span className="voice-record__mic">🎙</span>
                        Voice note
                    </>
                )}
            </button>

            {displayError && (
                <p className="voice-record__error">{displayError}</p>
            )}
        </div>
    )
}
