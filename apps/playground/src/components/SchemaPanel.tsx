/**
 * SchemaPanel
 *
 * Left panel of the playground. Two tabs:
 *
 * - Zod: paste a z.object({...}) body, converted via z.toJSONSchema()
 * - JSON Schema: paste raw JSON Schema directly
 *
 * Calls onSchemaChange whenever the active schema is valid and parseable.
 */

import { type ReactElement, useCallback, useState } from 'react'
import { z } from 'zod'

export type SchemaTab = 'zod' | 'json'

type Props = {
    onSchemaChange: (jsonSchema: unknown, schemaId: string) => void
    onError: (msg: string | null) => void
}

const DEFAULT_ZOD_BODY = `{
    name: z.string().meta({ title: 'Name' }),
    species: z
        .enum(['cat', 'dog', 'lizard', 'fish'])
        .meta({ title: 'Species' }),
    birthday: z.iso.date().optional().meta({ title: 'Birthday' }),
    notes: z.string().optional().meta({ title: 'Notes' }),
}`

const DEFAULT_JSON_SCHEMA = JSON.stringify(
    {
        properties: {
            birthday: { format: 'date', title: 'Birthday', type: 'string' },
            name: { title: 'Name', type: 'string' },
            notes: { title: 'Notes', type: 'string' },
            species: {
                enum: ['cat', 'dog', 'lizard', 'fish'],
                title: 'Species',
                type: 'string',
            },
        },
        required: ['name', 'species'],
        title: 'Pet Record',
        type: 'object',
    },
    null,
    4,
)

const PANEL: React.CSSProperties = {
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
}

const TABS: React.CSSProperties = {
    background: '#f8f8f8',
    borderBottom: '1px solid #ddd',
    display: 'flex',
}

function tab(active: boolean): React.CSSProperties {
    return {
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid #0066cc' : '2px solid transparent',
        borderRadius: 0,
        color: active ? '#0066cc' : '#555',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: active ? 600 : 400,
        marginBottom: -1,
        padding: '8px 16px',
    }
}

const LABEL: React.CSSProperties = {
    color: '#888',
    fontSize: 11,
    letterSpacing: '0.05em',
    padding: '6px 12px 2px',
    textTransform: 'uppercase',
}

const TEXTAREA: React.CSSProperties = {
    background: '#fafafa',
    border: 'none',
    color: '#1a1a1a',
    flex: 1,
    fontFamily: 'ui-monospace, "Cascadia Code", Menlo, monospace',
    fontSize: 12,
    lineHeight: 1.6,
    outline: 'none',
    padding: '8px 12px',
    resize: 'none',
}

const APPLY_BTN: React.CSSProperties = {
    alignSelf: 'flex-start',
    background: '#0066cc',
    border: 'none',
    borderRadius: 4,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 12,
    margin: '8px 12px',
    padding: '6px 14px',
}

export function SchemaPanel({ onError, onSchemaChange }: Props): ReactElement {
    const [activeTab, setActiveTab] = useState<SchemaTab>('zod')
    const [zodBody, setZodBody] = useState(DEFAULT_ZOD_BODY)
    const [jsonText, setJsonText] = useState(DEFAULT_JSON_SCHEMA)

    const applyZod = useCallback(() => {
        try {
            const schema = (0, eval)(
                `(z => z.object(${zodBody}))(z)`,
            ) as z.ZodObject<z.ZodRawShape>
            const jsonSchema = z.toJSONSchema(schema)
            onError(null)
            onSchemaChange(jsonSchema, `playground-zod-${String(Date.now())}`)
        } catch (err) {
            onError(err instanceof Error ? err.message : String(err))
        }
    }, [zodBody, onSchemaChange, onError])

    const applyJson = useCallback(() => {
        try {
            const parsed: unknown = JSON.parse(jsonText)
            onError(null)
            onSchemaChange(parsed, `playground-json-${String(Date.now())}`)
        } catch (err) {
            onError(err instanceof Error ? err.message : String(err))
        }
    }, [jsonText, onSchemaChange, onError])

    return (
        <div style={PANEL}>
            <div style={TABS}>
                <button
                    style={tab(activeTab === 'zod')}
                    onClick={() => {
                        setActiveTab('zod')
                    }}>
                    Zod
                </button>
                <button
                    style={tab(activeTab === 'json')}
                    onClick={() => {
                        setActiveTab('json')
                    }}>
                    JSON Schema
                </button>
            </div>

            {activeTab === 'zod' && (
                <>
                    <div style={LABEL}>z.object( … )</div>
                    <textarea
                        style={TEXTAREA}
                        spellCheck={false}
                        value={zodBody}
                        onChange={(e) => {
                            setZodBody(e.target.value)
                        }}
                    />
                    <button style={APPLY_BTN} onClick={applyZod}>
                        Apply schema
                    </button>
                </>
            )}

            {activeTab === 'json' && (
                <>
                    <div style={LABEL}>JSON Schema</div>
                    <textarea
                        style={TEXTAREA}
                        spellCheck={false}
                        value={jsonText}
                        onChange={(e) => {
                            setJsonText(e.target.value)
                        }}
                    />
                    <button style={APPLY_BTN} onClick={applyJson}>
                        Apply schema
                    </button>
                </>
            )}
        </div>
    )
}
