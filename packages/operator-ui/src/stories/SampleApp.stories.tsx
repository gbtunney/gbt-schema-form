import { createInMemoryStore } from '@operator/adapter-local'
import type { RecordDoc } from '@operator/core'
import type { JsonSchema, SchemaResolver } from '@operator/store'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

import { OperatorEditor } from '../components/OperatorEditor.tsx'

const petSchema = {
    title: 'Pet Record',
    type: 'object',
    required: ['name', 'species'],
    properties: {
        name: { title: 'Name', type: 'string', minLength: 1 },
        species: { title: 'Species', type: 'string', enum: ['cat', 'dog', 'lizard', 'fish'] },
        birthday: { title: 'Birthday', type: 'string', format: 'date' },
        notes: { title: 'Notes', type: 'string' },
    },
} satisfies JsonSchema

const schemaResolver: SchemaResolver = async (schemaId: string) =>
    Promise.resolve({
        schemaId,
        jsonSchema: petSchema,
    })

function SampleApp(): ReactElement {
    const store = useMemo(
        () =>
            createInMemoryStore({
                recordsById: new Map<string, RecordDoc>([
                    [
                        'pet-001',
                        {
                            id: 'pet-001',
                            schemaId: 'pet.v1',
                            createdAt: '2026-02-01T12:00:00.000Z',
                            updatedAt: '2026-02-01T12:00:00.000Z',
                            data: { name: 'Pickles', species: 'fish', notes: '55g tank' },
                        },
                    ],
                    [
                        'pet-002',
                        {
                            id: 'pet-002',
                            schemaId: 'pet.v1',
                            createdAt: '2026-02-02T12:00:00.000Z',
                            updatedAt: '2026-02-02T12:00:00.000Z',
                            data: { name: 'Seafood', species: 'lizard', notes: 'Reptile room' },
                        },
                    ],
                ]),
            }),
        [],
    )

    const [records, setRecords] = useState<Array<RecordDoc>>([])
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
    const [isCreatingNew, setIsCreatingNew] = useState(false)

    const loadRecords = useCallback(async (): Promise<void> => {
        if (!store.records.list) return
        setRecords(await store.records.list())
    }, [store])

    useEffect(() => {
        void loadRecords()
    }, [loadRecords])

    if (isCreatingNew || selectedRecordId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div style={{ borderBottom: '1px solid #ddd', padding: 12 }}>
                    <button
                        onClick={() => {
                            setIsCreatingNew(false)
                            setSelectedRecordId(null)
                            void loadRecords()
                        }}
                        style={{ padding: '8px 12px' }}
                    >
                        ← Back
                    </button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <OperatorEditor
                        {...(selectedRecordId ? { recordId: selectedRecordId } : {})}
                        schemaId="pet.v1"
                        schemaResolver={schemaResolver}
                        store={store}
                    />
                </div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1 style={{ margin: 0 }}>Pets</h1>
                <button
                    onClick={() => {
                        setIsCreatingNew(true)
                        setSelectedRecordId(null)
                    }}
                    style={{ padding: '10px 14px' }}
                >
                    + New
                </button>
            </div>

            <div style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr style={{ background: '#f6f6f6', borderBottom: '1px solid #ddd' }}>
                            <th style={{ textAlign: 'left', padding: 12 }}>Name</th>
                            <th style={{ textAlign: 'left', padding: 12 }}>Species</th>
                            <th style={{ textAlign: 'left', padding: 12 }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r) => {
                            const d = r.data as Record<string, unknown>
                            return (
                                <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: 12 }}>{typeof d['name'] === 'string' ? d['name'] : '—'}</td>
                                    <td style={{ padding: 12 }}>
                                        {typeof d['species'] === 'string' ? d['species'] : '—'}
                                    </td>
                                    <td style={{ padding: 12 }}>
                                        <button
                                            onClick={() => setSelectedRecordId(r.id)}
                                            style={{ padding: '8px 12px' }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const meta: Meta<typeof SampleApp> = {
    title: 'Playground/SampleApp',
    component: SampleApp,
    parameters: {
        layout: 'fullscreen',
    },
}

export default meta

export const Default: StoryObj<typeof SampleApp> = {}
