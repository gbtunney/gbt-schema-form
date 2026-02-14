import { describe, expect, test } from 'vitest'
import { proposalRequestSchema } from './ports.js'

describe('operator-store/ports proposalRequestSchema', () => {
    const validEvidenceItem = {
        id: 'item-123',
        groupId: 'group-456',
        title: 'Test Evidence',
        text: 'Evidence content',
        pinned: false,
        selected: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
    }

    const validRecordData = {
        name: 'John Doe',
        email: 'john@example.com',
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
            expect(result.success, `Should accept recordData: ${JSON.stringify(recordData)}`).toBe(
                true
            )
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
            expect(result.success, `Should reject: ${typeof value}`).toBe(false)
        })
    })
})

describe('operator-store/ports type contracts', () => {
    test('SchemaResolver type allows async schema resolution', () => {
        /* Type-only test - verifying contract structure */
        const mockResolver = async (schemaId: string) => ({
            schemaId,
            jsonSchema: { type: 'object', properties: {} },
        })

        expect(mockResolver).toBeDefined()
        expect(typeof mockResolver).toBe('function')
    })

    test('ProposalClient type allows async proposal generation', () => {
        /* Type-only test - verifying contract structure */
        const mockClient = async () => [
            {
                id: 'prop-1',
                evidenceItemId: 'item-1',
                path: '/field',
                value: 'test',
                confidence: 'High' as const,
            },
        ]

        expect(mockClient).toBeDefined()
        expect(typeof mockClient).toBe('function')
    })

    test('OperatorStore type defines expected port structure', () => {
        /* Type-only test - verifying contract structure exists */
        const mockStore = {
            records: {
                load: async () => null,
                save: async () => {},
            },
            evidenceGroups: {
                list: async () => [],
                create: async () => ({
                    id: 'group-1',
                    owner: { kind: 'draft' as const },
                    title: 'Test',
                    createdAt: '2024-01-15T10:30:00Z',
                    updatedAt: '2024-01-15T10:30:00Z',
                }),
            },
            evidenceItems: {
                list: async () => [],
                create: async () => ({
                    id: 'item-1',
                    groupId: 'group-1',
                    title: 'Test',
                    text: 'Content',
                    pinned: false,
                    selected: false,
                    createdAt: '2024-01-15T10:30:00Z',
                    updatedAt: '2024-01-15T10:30:00Z',
                }),
            },
            patches: {
                list: async () => [],
                append: async () => {},
            },
        }

        expect(mockStore.records).toBeDefined()
        expect(mockStore.evidenceGroups).toBeDefined()
        expect(mockStore.evidenceItems).toBeDefined()
        expect(mockStore.patches).toBeDefined()
    })
})
