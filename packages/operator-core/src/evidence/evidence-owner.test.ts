import { describe, expect, test } from 'vitest'
import { evidenceOwnerSchema } from './evidence-owner.js'

describe('evidence/evidence-owner evidenceOwnerSchema', () => {
    test('accepts valid "record" owner with recordId', () => {
        const validOwners = [
            { kind: 'record', recordId: 'rec-123' },
            { kind: 'record', recordId: 'uuid-abcd-1234' },
        ]

        validOwners.forEach((owner) => {
            const result = evidenceOwnerSchema.safeParse(owner)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.kind).toBe('record')
            }
        })
    })

    test('accepts valid "draft" owner without recordId', () => {
        const draftOwner = { kind: 'draft' }
        const result = evidenceOwnerSchema.safeParse(draftOwner)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.kind).toBe('draft')
        }
    })

    test('rejects "record" owner without recordId', () => {
        const invalidOwner = { kind: 'record' }
        const result = evidenceOwnerSchema.safeParse(invalidOwner)
        expect(result.success).toBe(false)
    })

    test('rejects "record" owner with empty recordId', () => {
        const invalidOwner = { kind: 'record', recordId: '' }
        const result = evidenceOwnerSchema.safeParse(invalidOwner)
        expect(result.success).toBe(false)
    })

    test('rejects unknown kind values', () => {
        const invalidOwners = [
            { kind: 'unknown' },
            { kind: 'invalid', recordId: 'rec-123' },
            { kind: 123 },
        ]

        invalidOwners.forEach((owner) => {
            const result = evidenceOwnerSchema.safeParse(owner)
            expect(result.success).toBe(false)
        })
    })

    test('rejects non-object values', () => {
        const invalidValues = [null, undefined, 'draft', 123, true, []]

        invalidValues.forEach((value) => {
            const result = evidenceOwnerSchema.safeParse(value)
            expect(result.success).toBe(false)
        })
    })

    test('allows draft owner with extra properties (Zod default behavior)', () => {
        const draftWithExtra = { kind: 'draft', recordId: 'extra-property' }
        const result = evidenceOwnerSchema.safeParse(draftWithExtra)
        // Zod discriminated unions allow extra properties by default
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.kind).toBe('draft')
            // Extra property is stripped in the output
        }
    })
})
