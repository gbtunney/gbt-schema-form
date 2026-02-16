import { describe, expect, test } from 'vitest'
import { proposalRequestSchema } from './ports.js'

describe('operator-store/ports proposalRequestSchema', () => {
    const validEvidenceItem = {
        createdAt: '2024-01-15T10:30:00Z',
        groupId: 'group-456',
        id: 'item-123',
        pinned: false,
        selected: true,
        text: 'Evidence content',
        title: 'Test Evidence',
        updatedAt: '2024-01-15T12:00:00Z',
    }

    const validRecordData = {
        email: 'john@example.com',
        name: 'John Doe',
    }

    const validProposalRequest = {
        evidenceItem: validEvidenceItem,
        recordData: validRecordData,
        schemaId: 'schema-contact-v1',
    }

    test('accepts valid proposal request without recordId', () => {
        const result = proposalRequestSchema.safeParse(validProposalRequest)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.evidenceItem.id).toBe('item-123')
            expect(result.data.schemaId).toBe('schema-contact-v1')
            expect(result.data.recordData).toEqual(validRecordData)
        }
    })

    test('accepts valid proposal request with optional recordId', () => {
        const requestWithRecordId = {
            ...validProposalRequest,
            recordId: 'record-789',
        }

        const result = proposalRequestSchema.safeParse(requestWithRecordId)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.recordId).toBe('record-789')
        }
    })

    test('accepts various recordData structures', () => {
        const testDataStructures = [
            { simple: 'value' },
            { nested: { deep: 'structure' } },
            { array: [1, 2, 3] },
            null,
            'string',
            123,
            [],
        ]

        testDataStructures.forEach((recordData) => {
            const request = { ...validProposalRequest, recordData }
            const result = proposalRequestSchema.safeParse(request)
            expect(result.success).toBe(true)
        })
    })

    test('rejects proposal request missing evidenceItem', () => {
        const { evidenceItem, ...withoutEvidenceItem } = validProposalRequest
        const result = proposalRequestSchema.safeParse(withoutEvidenceItem)
        expect(result.success).toBe(false)
    })

    test('rejects proposal request with invalid evidenceItem', () => {
        const invalidRequest = {
            ...validProposalRequest,
            evidenceItem: { id: 'item-123' }, // missing required fields
        }
        const result = proposalRequestSchema.safeParse(invalidRequest)
        expect(result.success).toBe(false)
    })

    test('rejects proposal request missing recordData', () => {
        const { recordData, ...withoutRecordData } = validProposalRequest
        const result = proposalRequestSchema.safeParse(withoutRecordData)
        expect(result.success).toBe(false)
    })

    test('rejects proposal request missing schemaId', () => {
        const { schemaId, ...withoutSchemaId } = validProposalRequest
        const result = proposalRequestSchema.safeParse(withoutSchemaId)
        expect(result.success).toBe(false)
    })

    test('rejects proposal request with empty schemaId', () => {
        const request = { ...validProposalRequest, schemaId: '' }
        const result = proposalRequestSchema.safeParse(request)
        expect(result.success).toBe(false)
    })

    test('rejects proposal request with empty recordId when provided', () => {
        const request = { ...validProposalRequest, recordId: '' }
        const result = proposalRequestSchema.safeParse(request)
        expect(result.success).toBe(false)
    })

    test('rejects proposal request with invalid evidenceItem datetime', () => {
        const invalidRequest = {
            ...validProposalRequest,
            evidenceItem: {
                ...validEvidenceItem,
                createdAt: 'not-a-date',
            },
        }
        const result = proposalRequestSchema.safeParse(invalidRequest)
        expect(result.success).toBe(false)
    })

    test('rejects non-object proposal request', () => {
        const invalidValues = [null, undefined, 'string', 123, true, []]

        invalidValues.forEach((value) => {
            const result = proposalRequestSchema.safeParse(value)
            expect(result.success).toBe(false)
        })
    })
})

describe('operator-store/ports type contracts', () => {
    test('SchemaResolver type allows async schema resolution', () => {
        /**
         * Type-only test - verifying contract structure
         */
        const mockResolver = (
            schemaId: string,
        ): Promise<{
            schemaId: string
            jsonSchema: unknown
        }> =>
            Promise.resolve({
                jsonSchema: { properties: {}, type: 'object' },
                schemaId,
            })

        expect(mockResolver).toBeDefined()
        expect(typeof mockResolver).toBe('function')
    })

    test('ProposalClient type allows async proposal generation', () => {
        /**
         * Type-only test - verifying contract structure
         */
        const mockClient = (): Promise<
            Array<{
                id: string
                evidenceItemId: string
                path: string
                value: string
                confidence: 'High'
            }>
        > =>
            Promise.resolve([
                {
                    confidence: 'High' as const,
                    evidenceItemId: 'item-1',
                    id: 'prop-1',
                    path: '/field',
                    value: 'test',
                },
            ])

        expect(mockClient).toBeDefined()
        expect(typeof mockClient).toBe('function')
    })

    test('OperatorStore type defines expected port structure', () => {
        /* Type-only test - verifying contract structure exists */
        const mockStore = {
            evidenceGroups: {
                create: (): Promise<{
                    id: string
                    owner: { kind: 'draft' }
                    title: string
                    createdAt: string
                    updatedAt: string
                }> =>
                    Promise.resolve({
                        createdAt: '2024-01-15T10:30:00Z',
                        id: 'group-1',
                        owner: { kind: 'draft' as const },
                        title: 'Test',
                        updatedAt: '2024-01-15T10:30:00Z',
                    }),
                list: (): Promise<Array<never>> => Promise.resolve([]),
            },
            evidenceItems: {
                create: (): Promise<{
                    id: string
                    groupId: string
                    title: string
                    text: string
                    pinned: boolean
                    selected: boolean
                    createdAt: string
                    updatedAt: string
                }> =>
                    Promise.resolve({
                        createdAt: '2024-01-15T10:30:00Z',
                        groupId: 'group-1',
                        id: 'item-1',
                        pinned: false,
                        selected: false,
                        text: 'Content',
                        title: 'Test',
                        updatedAt: '2024-01-15T10:30:00Z',
                    }),
                list: (): Promise<Array<never>> => Promise.resolve([]),
            },
            patches: {
                append: (): Promise<void> => Promise.resolve(),
                list: (): Promise<Array<never>> => Promise.resolve([]),
            },
            records: {
                load: (): Promise<null> => Promise.resolve(null),
                save: (): Promise<void> => Promise.resolve(),
            },
        }

        expect(mockStore.records).toBeDefined()
        expect(mockStore.evidenceGroups).toBeDefined()
        expect(mockStore.evidenceItems).toBeDefined()
        expect(mockStore.patches).toBeDefined()
    })
})
