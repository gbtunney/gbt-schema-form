import { createInMemoryStore } from '@operator/adapter-local'
import type { RecordDoc } from '@operator/core'
import type { JsonSchema, SchemaResolver } from '@operator/store'
import { type ReactElement, useCallback, useEffect, useState } from 'react'

import './App.css'
import { OperatorEditor } from './components/OperatorEditor.tsx'

/** Sample JSON Schema for equipment records */
const equipmentSchema = {
    properties: {
        category: {
            enum: ['Laptop', 'Monitor', 'Phone', 'Printer', 'Other'],
            title: 'Category',
            type: 'string',
        },
        location: { title: 'Location', type: 'string' },
        manufacturer: { title: 'Manufacturer', type: 'string' },
        model: { title: 'Model', type: 'string' },
        notes: { title: 'Notes', type: 'string' },
        purchaseDate: { format: 'date', title: 'Purchase Date', type: 'string' },
        serialNumber: { title: 'Serial Number', type: 'string' },
        status: {
            enum: ['Active', 'In Repair', 'Retired'],
            title: 'Status',
            type: 'string',
        },
    },
    required: ['serialNumber', 'category'],
    title: 'Equipment Record',
    type: 'object',
}

const mockSchemaResolver: SchemaResolver = async (schemaId: string) =>
    Promise.resolve({
        jsonSchema: equipmentSchema as JsonSchema,
        schemaId,
    })

/** Initialize store with sample records */
const store = createInMemoryStore({
    recordsById: new Map([
        [
            'rec-001',
            {
                createdAt: '2025-01-10T10:00:00.000Z',
                data: {
                    category: 'Laptop',
                    manufacturer: 'Dell',
                    model: 'XPS 15',
                    serialNumber: 'DL-2024-1001',
                    status: 'Active',
                },
                id: 'rec-001',
                schemaId: 'equipment.v1',
                updatedAt: '2025-01-10T10:00:00.000Z',
            },
        ],
        [
            'rec-002',
            {
                createdAt: '2025-01-11T14:30:00.000Z',
                data: {
                    category: 'Monitor',
                    manufacturer: 'LG',
                    model: 'UltraWide 34"',
                    serialNumber: 'LG-2024-2002',
                    status: 'Active',
                },
                id: 'rec-002',
                schemaId: 'equipment.v1',
                updatedAt: '2025-01-11T14:30:00.000Z',
            },
        ],
        [
            'rec-003',
            {
                createdAt: '2025-01-12T09:15:00.000Z',
                data: {
                    category: 'Printer',
                    location: 'Office Floor 3',
                    manufacturer: 'HP',
                    model: 'LaserJet Pro',
                    serialNumber: 'HP-2024-3003',
                    status: 'In Repair',
                },
                id: 'rec-003',
                schemaId: 'equipment.v1',
                updatedAt: '2025-01-12T09:15:00.000Z',
            },
        ],
    ]),
})

function App(): ReactElement {
    const [records, setRecords] = useState<Array<RecordDoc>>([])
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
    const [isCreatingNew, setIsCreatingNew] = useState(false)

    const loadRecords = useCallback(async (): Promise<void> => {
        if (store.records.list) {
            const recordsList = await store.records.list()
            setRecords(recordsList)
        }
    }, [])

    useEffect(() => {
        /** Load records on mount */
        void loadRecords()
    }, [loadRecords])

    const handleCreateNew = (): void => {
        setIsCreatingNew(true)
        setSelectedRecordId(null)
    }

    const handleCloseEditor = (): void => {
        setIsCreatingNew(false)
        setSelectedRecordId(null)
        /** Refresh records list after closing editor */
        void loadRecords()
    }

    if (isCreatingNew || selectedRecordId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div style={{ borderBottom: '1px solid #ccc', padding: '1rem' }}>
                    <button onClick={handleCloseEditor} style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}>
                        ← Back to Records List
                    </button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <OperatorEditor
                        {...(selectedRecordId ? { recordId: selectedRecordId } : {})}
                        schemaId="equipment.v1"
                        schemaResolver={mockSchemaResolver}
                        store={store}
                    />
                </div>
            </div>
        )
    }

    return (
        <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '2rem' }}>
            <div
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '2rem',
                }}
            >
                <h1>Equipment Records</h1>
                <button
                    onClick={handleCreateNew}
                    style={{
                        background: '#0066cc',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0.75rem 1.5rem',
                    }}
                >
                    + New Record
                </button>
            </div>

            <table style={{ border: '1px solid #ddd', borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '1rem', textAlign: 'left' }}>
                            Serial Number
                        </th>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '1rem', textAlign: 'left' }}>
                            Category
                        </th>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '1rem', textAlign: 'left' }}>
                            Manufacturer
                        </th>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '1rem', textAlign: 'left' }}>
                            Status
                        </th>
                        <th style={{ borderBottom: '2px solid #ddd', padding: '1rem', textAlign: 'left' }}>
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr
                            key={record.id}
                            style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                            onClick={() => {
                                setSelectedRecordId(record.id)
                            }}
                        >
                            <td style={{ padding: '1rem' }}>
                                {(record.data as { serialNumber?: string })?.serialNumber ?? '-'}
                            </td>
                            <td style={{ padding: '1rem' }}>
                                {(record.data as { category?: string })?.category ?? '-'}
                            </td>
                            <td style={{ padding: '1rem' }}>
                                {(record.data as { manufacturer?: string })?.manufacturer ?? '-'}
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <span
                                    style={{
                                        background:
                                            (record.data as { status?: string })?.status === 'Active'
                                                ? '#e8f5e9'
                                                : '#fff3e0',
                                        borderRadius: '12px',
                                        color:
                                            (record.data as { status?: string })?.status === 'Active'
                                                ? '#2e7d32'
                                                : '#e65100',
                                        padding: '0.25rem 0.75rem',
                                    }}
                                >
                                    {(record.data as { status?: string })?.status ?? '-'}
                                </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        setSelectedRecordId(record.id)
                                    }}
                                    style={{
                                        background: '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        padding: '0.5rem 1rem',
                                    }}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {records.length === 0 && (
                <div style={{ color: '#666', padding: '3rem', textAlign: 'center' }}>
                    <p>No records found. Click "New Record" to create one.</p>
                </div>
            )}
        </div>
    )
}

export default App
