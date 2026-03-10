/**
 * VoiceRecordButton stories
 *
 * No transcribeUrl → mock mode: simulates ~1.2s transcription delay and returns a placeholder transcript. Lets you test
 * the full UI flow (idle → recording → transcribing → new item appears) without a server.
 *
 * To test against real Whisper: pass transcribeUrl="http://localhost:3001" to the story args (or set it in the
 * Storybook controls panel).
 */

import { createInMemoryStore } from '@operator/adapter-local'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { VoiceRecordButton } from '../components/VoiceRecordButton.js'

const store = createInMemoryStore()

// Pre-create a group so the button has somewhere to put items
const GROUP_ID = 'grp-voice-demo'
void store.evidenceGroups
    .create({
        owner: { kind: 'draft' },
        title: 'Voice Demo Group',
    })
    .then((g) => {
        // Mutate the id so items land in the right group
        ;(g as { id: string }).id = GROUP_ID
    })

const meta = {
    args: {
        groupId: GROUP_ID,
        owner: { kind: 'draft' as const },
        store,
        // transcribeUrl omitted → mock mode
    },
    component: VoiceRecordButton,
    parameters: { layout: 'centered' },
    title: 'Evidence/VoiceRecordButton',
} satisfies Meta<typeof VoiceRecordButton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Mock mode — no server needed. Click to start recording, click again to stop. After ~1.2s a mock transcript appears as
 * a new evidence item.
 */
export const MockTranscription: Story = {}

/** Real Whisper — set transcribeUrl to your running api-server. Requires OPENAI_API_KEY in the server's .env. */
export const RealWhisper: Story = {
    args: {
        transcribeUrl: 'http://localhost:3001',
    },
}
