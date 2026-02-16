import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { initClient } from '@ts-rest/core'

import { operatorContract } from '@operator/contract'

type Props = {
    baseUrl: string
    schemaId: string
    text: string
}

const client = (baseUrl: string) =>
    initClient(operatorContract, {
        baseUrl,
        baseHeaders: {},
    })

const TsRestTextToProposalDemo = ({ baseUrl, schemaId, text }: Props) => {
    const [currentText, setCurrentText] = React.useState(text)
    const [result, setResult] = React.useState<any>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const run = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await client(baseUrl).proposals.fromText({
                body: {
                    recordData: {},
                    schemaId,
                    text: currentText,
                },
            })
            setResult(res)
        } catch (e: any) {
            setError(e?.message ?? String(e))
            setResult(null)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div style={{ padding: 16, maxWidth: 900 }}>
            <h3>ts-rest: /proposals/from-text</h3>
            <p style={{ marginTop: 0 }}>
                Requires the API running separately (default baseUrl: {baseUrl}).
            </p>

            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>
                Text blob
            </label>
            <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                rows={6}
                style={{ width: '100%', fontFamily: 'monospace' }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={run} disabled={isLoading || currentText.trim().length === 0}>
                    {isLoading ? 'Generating…' : 'Generate proposals'}
                </button>
                <div style={{ opacity: 0.7, alignSelf: 'center' }}>
                    schemaId: <code>{schemaId}</code>
                </div>
            </div>

            {error ? (
                <div style={{ marginTop: 12 }}>
                    <h4 style={{ marginBottom: 8 }}>Error</h4>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
                </div>
            ) : null}

            {result ? (
                <div style={{ marginTop: 12 }}>
                    <h4 style={{ marginBottom: 8 }}>Response</h4>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
                </div>
            ) : null}
        </div>
    )
}

const meta: Meta<typeof TsRestTextToProposalDemo> = {
    title: 'Playground/ts-rest Text → Proposals',
    component: TsRestTextToProposalDemo,
    args: {
        baseUrl: 'http://localhost:3001',
        schemaId: 'schema-1',
        text: 'This is about a model Eheim 2211',
    },
    argTypes: {
        text: { control: { type: 'text' } },
        baseUrl: { control: { type: 'text' } },
        schemaId: { control: { type: 'text' } },
    },
}

export default meta

export const Default: StoryObj<typeof TsRestTextToProposalDemo> = {}
