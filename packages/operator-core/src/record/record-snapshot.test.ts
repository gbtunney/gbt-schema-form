import { describe, expect, test } from 'vitest'
import { recordDocSchema, recordSnapshotSchema } from './record-snapshot.js'

describe('record/record-snapshot recordSnapshotSchema', () => {
    const validRecord = {
        createdAt: '2024-01-15T10:30:00Z',
        data: {
            age: 30,
            email: 'john@example.com',
            name: 'John Doe',
        },
        id: 'record-123',
        schemaId: 'schema-contact-v1',
        updatedAt: '2024-01-15T12:00:00Z',
    }

    test('accepts valid record snapshot with all required fields', () => {
        const result = recordSnapshotSchema.safeParse(validRecord)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.id).toBe('record-123')
            expect(result.data.schemaId).toBe('schema-contact-v1')
            expect(result.data.data).toEqual(validRecord.data)
        }
    })

    test('accepts various JSON data structures', () => {
        const testData = [
            { simple: 'value' },
            { nested: { deep: { structure: 'value' } } },
            { array: [1, 2, 3] },
            {
                mixed: {
                    booleans: true,
                    nulls: null,
                    numbers: 42,
                    strings: 'text',
                },
            },
            { arrayOfObjects: [{ id: 1 }, { id: 2 }] },
            null,
            'simple string',
            123,
            true,
            [],
        ]

        testData.forEach((data) => {
            const record = { ...validRecord, data }
            const result = recordSnapshotSchema.safeParse(record)
            expect(result.success).toBe(true)
        })
    })

    test('rejects record missing required id', () => {
        const { id, ...withoutId } = validRecord
        const result = recordSnapshotSchema.safeParse(withoutId)
        expect(result.success).toBe(false)
    })

    test('rejects record with empty id', () => {
        const record = { ...validRecord, id: '' }
        const result = recordSnapshotSchema.safeParse(record)
        expect(result.success).toBe(false)
    })

    test('rejects record missing schemaId', () => {
        const { schemaId, ...withoutSchemaId } = validRecord
        const result = recordSnapshotSchema.safeParse(withoutSchemaId)
        expect(result.success).toBe(false)
    })

    test('rejects record with empty schemaId', () => {
        const record = { ...validRecord, schemaId: '' }
        const result = recordSnapshotSchema.safeParse(record)
        expect(result.success).toBe(false)
    })

    test('rejects record missing data field', () => {
        const { data, ...withoutData } = validRecord
        const result = recordSnapshotSchema.safeParse(withoutData)
        expect(result.success).toBe(false)
    })

    test('rejects record with invalid datetime format for createdAt', () => {
        const record = { ...validRecord, createdAt: '2024-01-15' }
        const result = recordSnapshotSchema.safeParse(record)
        expect(result.success).toBe(false)
    })

    test('rejects record with invalid datetime format for updatedAt', () => {
        const record = { ...validRecord, updatedAt: 'not-a-date' }
        const result = recordSnapshotSchema.safeParse(record)
        expect(result.success).toBe(false)
    })

    test('rejects non-string id', () => {
        const record = { ...validRecord, id: 123 }
        const result = recordSnapshotSchema.safeParse(record)
        expect(result.success).toBe(false)
    })

    test('rejects non-string schemaId', () => {
        const record = { ...validRecord, schemaId: null }
        const result = recordSnapshotSchema.safeParse(record)
        expect(result.success).toBe(false)
    })
})

describe('record/record-snapshot recordDocSchema alias', () => {
    test('recordDocSchema is an alias for recordSnapshotSchema', () => {
        expect(recordDocSchema).toBe(recordSnapshotSchema)
    })

    test('recordDocSchema validates the same way as recordSnapshotSchema', () => {
        const validRecord = {
            createdAt: '2024-01-15T10:30:00Z',
            data: { test: 'value' },
            id: 'record-789',
            schemaId: 'schema-test',
            updatedAt: '2024-01-15T12:00:00Z',
        }

        const snapshotResult = recordSnapshotSchema.safeParse(validRecord)
        const docResult = recordDocSchema.safeParse(validRecord)

        expect(snapshotResult.success).toBe(true)
        expect(docResult.success).toBe(true)
        expect(snapshotResult.data).toEqual(docResult.data)
    })
})
