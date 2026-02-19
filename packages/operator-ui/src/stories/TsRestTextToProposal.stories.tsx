import { operatorContract } from '@operator/contract'
import type { Meta, StoryObj } from '@storybook/react'
import { initClient } from '@ts-rest/core'
import * as React from 'react'
import {type ReactElement} from 'react'


type Props = {
    baseUrl: string
    schemaId: string
    text: string
}
type ClientType = ReturnType<typeof initClient>
const client = (baseUrl: string) :ClientType =>
    initClient(operatorContract, {
        baseHeaders: {},
        baseUrl,
    })

const TsRestTextToProposalDemo = ({ baseUrl, schemaId, text }: Props):ReactElement => {
    const [currentText, setCurrentText] = React.useState(text)
    const [result, setResult] = React.useState<any>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)

    const run = async ():Promise<void  > => {
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
        <div style={{ maxWidth: 900, padding: 16 }}>
            <h3>ts-rest: /proposals/from-text</h3>
            <p style={{ marginTop: 0 }}>Requires the API running separately (default baseUrl: {baseUrl}).</p>

            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Text blob</label>
            <textarea
                value={currentText}
                onChange={(e) => {
                    setCurrentText(e.target.value)
                }}
                rows={6}
                style={{ fontFamily: 'monospace', width: '100%' }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={run} disabled={isLoading || currentText.trim().length === 0}>
                    {isLoading ? 'Generating…' : 'Generate proposals'}
                </button>
                <div style={{ alignSelf: 'center', opacity: 0.7 }}>
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
    args: {
        baseUrl: 'http://localhost:3001',
        schemaId: 'schema-1',
        text: 'This is about a model Eheim 2211',
    },
    argTypes: {
        baseUrl: { control: { type: 'text' } },
        schemaId: { control: { type: 'text' } },
        text: { control: { type: 'text' } },
    },
    component: TsRestTextToProposalDemo,
    title: 'Playground/ts-rest Text → Proposals',
}

export default meta

export const Default: StoryObj<typeof TsRestTextToProposalDemo> = {}
