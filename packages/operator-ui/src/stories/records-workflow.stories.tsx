import { createInMemoryStore } from '@operator/adapter-local'
import type { RecordDoc } from '@operator/core'
import type { JsonSchema, SchemaResolver } from '@operator/store'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type ReactElement, useCallback, useEffect, useState } from 'react'

import { OperatorEditor } from '../components/OperatorEditor.tsx'

/** Equipment JSON Schema */
const equipmentSchema = {
    properties: {
        category: {
            enum: ['Computer', 'Printer', 'Monitor', 'Phone', 'Other'],
            title: 'Category',
            type: 'string',
        },
        location: { title: 'Location', type: 'string' },
        manufacturer: { title: 'Manufacturer', type: 'string' },
        model: { title: 'Model', type: 'string' },
        name: { title: 'Equipment Name', type: 'string' },
        serialNumber: { title: 'Serial Number', type: 'string' },
        status: {
            enum: ['Active', 'In Repair', 'Retired', 'Missing'],
            title: 'Status',
            type: 'string',
        },
    },
    required: ['name', 'category'],
    title: 'Equipment Record',
    type: 'object',
}

const mockSchemaResolver: SchemaResolver = async (schemaId: string) =>
    Promise.resolve({
        jsonSchema: equipmentSchema as JsonSchema,
        schemaId,
    })

/** Create store with sample equipment records */
const createSampleStore = () =>
    createInMemoryStore({
        recordsById: new Map<string, RecordDoc>([
            [
                'rec-001',
                {
                    createdAt: '2025-01-10T08:00:00.000Z',
                    data: {
                        category: 'Computer',
                        location: 'Office Floor 2',
                        manufacturer: 'Dell',
                        model: 'XPS 15',
                        name: 'Dev Laptop #42',
                        serialNumber: 'DELL-2024-1001',
                        status: 'Active',
                    },
                    id: 'rec-001',
                    schemaId: 'equipment.v1',
                    updatedAt: '2025-01-10T08:00:00.000Z',
                },
            ],
            [
                'rec-002',
                {
                    createdAt: '2025-01-11T14:30:00.000Z',
                    data: {
                        category: 'Monitor',
                        location: 'Office Floor 1',
                        manufacturer: 'LG',
                        model: 'UltraWide 34"',
                        name: 'Design Monitor',
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
                        name: 'Office Printer',
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

/** Full workflow component: records list → editor */
function RecordsWorkflow(): ReactElement {
    const [store] = useState(createSampleStore)
    const [records, setRecords] = useState<Array<RecordDoc>>([])
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
    const [isCreatingNew, setIsCreatingNew] = useState(false)

    const loadRecords = useCallback(async (): Promise<void> => {
        if (store.records.list) {
            const recordsList = await store.records.list()
            setRecords(recordsList)
        }
    }, [store])

    useEffect(() => {
        void loadRecords()
    }, [loadRecords])

    const handleCreateNew = (): void => {
        setIsCreatingNew(true)
        setSelectedRecordId(null)
    }

    const handleCloseEditor = (): void => {
        setIsCreatingNew(false)
        setSelectedRecordId(null)
        void loadRecords()
    }

    /** Render editor view */
    if (isCreatingNew || selectedRecordId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div style={{ background: '#f5f5f5', borderBottom: '1px solid #ccc', padding: '1rem' }}>
                    <button onClick={handleCloseEditor} style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}>
                        ← Back to Records
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

    /** Render records list view */
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
                <h1 style={{ margin: 0 }}>Equipment Records</h1>
                <button
                    onClick={handleCreateNew}
                    style={{
                        background: '#007bff',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 500,
                        padding: '0.75rem 1.5rem',
                    }}
                >
                    + Create New Record
                </button>
            </div>

            <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                            <th style={{ fontWeight: 600, padding: '1rem', textAlign: 'left' }}>Name</th>
                            <th style={{ fontWeight: 600, padding: '1rem', textAlign: 'left' }}>Category</th>
                            <th style={{ fontWeight: 600, padding: '1rem', textAlign: 'left' }}>
                                Manufacturer
                            </th>
                            <th style={{ fontWeight: 600, padding: '1rem', textAlign: 'left' }}>Status</th>
                            <th style={{ fontWeight: 600, padding: '1rem', textAlign: 'left' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => {
                            const data = record.data as Record<string, unknown>
                            return (
                                <tr
                                    key={record.id}
                                    style={{
                                        borderBottom: '1px solid #eee',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#f8f9fa'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent'
                                    }}
                                >
                                    <td style={{ padding: '1rem' }}>{String(data.name ?? '—')}</td>
                                    <td style={{ padding: '1rem' }}>{String(data.category ?? '—')}</td>
                                    <td style={{ padding: '1rem' }}>{String(data.manufacturer ?? '—')}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span
                                            style={{
                                                background:
                                                    data.status === 'Active'
                                                        ? '#d4edda'
                                                        : data.status === 'In Repair'
                                                          ? '#fff3cd'
                                                          : '#f8d7da',
                                                borderRadius: '12px',
                                                color:
                                                    data.status === 'Active'
                                                        ? '#155724'
                                                        : data.status === 'In Repair'
                                                          ? '#856404'
                                                          : '#721c24',
                                                fontSize: '0.875rem',
                                                padding: '0.25rem 0.75rem',
                                            }}
                                        >
                                            {String(data.status ?? 'Unknown')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button
                                            onClick={() => {
                                                setSelectedRecordId(record.id)
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #007bff',
                                                borderRadius: '4px',
                                                color: '#007bff',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                                padding: '0.5rem 1rem',
                                            }}
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

const meta = {
    component: RecordsWorkflow,
    parameters: {
        layout: 'fullscreen',
    },
    title: 'Workflows/Records Management',
} satisfies Meta<typeof RecordsWorkflow>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Full workflow demonstrating:
 * - Records list with sample equipment data
 * - Create new record button
 * - Click to edit existing records
 * - 3-pane editor (Evidence | Form | Proposals)
 * - Auto-save with debounce
 * - Return to list with refreshed data
 */
export const EquipmentManagement: Story = {}
