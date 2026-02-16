import { describe, expect, test } from 'vitest'
import {
    attachmentIdSchema,
    evidenceGroupIdSchema,
    evidenceItemIdSchema,
    recordIdSchema,
    schemaIdSchema,
} from './ids.js'

describe('evidence/ids schemas', () => {
    const schemas = [
        { name: 'recordIdSchema', schema: recordIdSchema },
        { name: 'schemaIdSchema', schema: schemaIdSchema },
        { name: 'evidenceGroupIdSchema', schema: evidenceGroupIdSchema },
        { name: 'evidenceItemIdSchema', schema: evidenceItemIdSchema },
        { name: 'attachmentIdSchema', schema: attachmentIdSchema },
    ]

    schemas.forEach(({ name, schema }) => {
        test(`${name} accepts valid non-empty string IDs`, () => {
            const validIds = ['a', '123', 'uuid-1234-5678', 'record_id', 'Very Long ID String']

            validIds.forEach((id) => {
                const result = schema.safeParse(id)
                expect(result.success).toBe(true)
            })
        })

        test('rejects empty strings', () => {
            const result = schema.safeParse('')
            expect(result.success).toBe(false)
        })

        test('rejects non-string values', () => {
            const invalidValues = [null, undefined, 123, true, {}, []]

            invalidValues.forEach((value) => {
                const result = schema.safeParse(value)
                expect(result.success).toBe(false)
            })
        })
    })
})
