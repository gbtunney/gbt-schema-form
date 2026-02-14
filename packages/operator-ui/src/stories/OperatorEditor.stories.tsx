import { createInMemoryStore } from '@operator/adapter-local'
import type { JsonSchema, SchemaResolver } from '@operator/store'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { OperatorEditor } from '../components/OperatorEditor.tsx'

/** Sample JSON Schema for a patient intake form */
const patientSchema = {
    properties: {
        dateOfBirth: { format: 'date', title: 'Date of Birth', type: 'string' },
        diagnosis: { title: 'Primary Diagnosis', type: 'string' },
        firstName: { title: 'First Name', type: 'string' },
        insuranceId: { title: 'Insurance ID', type: 'string' },
        lastName: { title: 'Last Name', type: 'string' },
        notes: { title: 'Notes', type: 'string' },
    },
    required: ['firstName', 'lastName'],
    title: 'Patient Intake',
    type: 'object',
}

/** Mock schema resolver that returns the patient schema */
const mockSchemaResolver: SchemaResolver = async (schemaId: string) =>
    Promise.resolve({
        jsonSchema: patientSchema as JsonSchema,
        schemaId,
    })

const meta = {
    component: OperatorEditor,
    parameters: {
        layout: 'fullscreen',
    },
    title: 'Editor/OperatorEditor',
} satisfies Meta<typeof OperatorEditor>

export default meta
type Story = StoryObj<typeof meta>

/** Empty editor with no pre-existing data */
export const Empty: Story = {
    args: {
        schemaId: 'patient-intake',
        schemaResolver: mockSchemaResolver,
        store: createInMemoryStore(),
    },
}

/** Editor pre-loaded with an existing record and evidence */
export const WithExistingData: Story = {
    args: {
        recordId: 'rec-001',
        schemaId: 'patient-intake',
        schemaResolver: mockSchemaResolver,
        store: ((): ReturnType<typeof createInMemoryStore> => {
            const recordId = 'rec-001'
            const groupId = 'grp-001'
            return createInMemoryStore({
                evidenceGroupsById: new Map([
                    [
                        groupId,
                        {
                            createdAt: '2025-01-15T10:00:00.000Z',
                            id: groupId,
                            owner: { kind: 'record', recordId },
                            title: 'Insurance Card Scan',
                            updatedAt: '2025-01-15T10:00:00.000Z',
                        },
                    ],
                ]),
                evidenceItemsById: new Map([
                    [
                        'item-001',
                        {
                            createdAt: '2025-01-15T10:01:00.000Z',
                            groupId,
                            id: 'item-001',
                            pinned: true,
                            selected: false,
                            text: 'Member: John Smith\nID: INS-88442\nGroup: GRP-2211\nEffective: 01/01/2025',
                            title: 'Front of card (OCR)',
                            updatedAt: '2025-01-15T10:01:00.000Z',
                        },
                    ],
                    [
                        'item-002',
                        {
                            createdAt: '2025-01-15T10:02:00.000Z',
                            groupId,
                            id: 'item-002',
                            pinned: false,
                            selected: true,
                            text: 'Patient confirmed date of birth: March 15, 1985. Primary complaint is persistent lower back pain for 3 months.',
                            title: 'Phone intake notes',
                            updatedAt: '2025-01-15T10:02:00.000Z',
                        },
                    ],
                ]),
                recordsById: new Map([
                    [
                        recordId,
                        {
                            createdAt: '2025-01-15T09:00:00.000Z',
                            data: {
                                dateOfBirth: '1985-03-15',
                                firstName: 'John',
                                insuranceId: 'INS-88442',
                                lastName: 'Smith',
                            },
                            id: recordId,
                            schemaId: 'patient-intake',
                            updatedAt: '2025-01-15T10:05:00.000Z',
                        },
                    ],
                ]),
            })
        })(),
    },
}
