import { describe, expect, test } from 'vitest'
import { evidenceGroupSchema } from './evidence-group.js'

describe('evidence/evidence-group evidenceGroupSchema', () => {
    const validRecordOwner = { kind: 'record' as const, recordId: 'rec-123' }
    const validDraftOwner = { kind: 'draft' as const }

    const createValidGroup = (
        owner: typeof validRecordOwner | typeof validDraftOwner,
    ): {
        id: string
        title: string
        owner: typeof validRecordOwner | typeof validDraftOwner
        createdAt: string
        updatedAt: string
    } => ({
        createdAt: '2024-01-15T10:30:00Z',
        id: 'group-123',
        owner,
        title: 'Test Evidence Group',
        updatedAt: '2024-01-15T12:00:00Z',
    })

    test('accepts valid evidence group with record owner', () => {
        const group = createValidGroup(validRecordOwner)
        const result = evidenceGroupSchema.safeParse(group)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.id).toBe('group-123')
            expect(result.data.owner.kind).toBe('record')
        }
    })

    test('accepts valid evidence group with draft owner', () => {
        const group = createValidGroup(validDraftOwner)
        const result = evidenceGroupSchema.safeParse(group)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.owner.kind).toBe('draft')
        }
    })

    test('rejects evidence group missing required id', () => {
        const { id, ...withoutId } = createValidGroup(validRecordOwner)
        const result = evidenceGroupSchema.safeParse(withoutId)
        expect(result.success).toBe(false)
    })

    test('rejects evidence group with empty id', () => {
        const group = { ...createValidGroup(validRecordOwner), id: '' }
        const result = evidenceGroupSchema.safeParse(group)
        expect(result.success).toBe(false)
    })

    test('rejects evidence group missing owner', () => {
        const { owner, ...withoutOwner } = createValidGroup(validRecordOwner)
        const result = evidenceGroupSchema.safeParse(withoutOwner)
        expect(result.success).toBe(false)
    })

    test('rejects evidence group with invalid owner', () => {
        const group = {
            ...createValidGroup(validRecordOwner),
            owner: { kind: 'invalid' },
        }
        const result = evidenceGroupSchema.safeParse(group)
        expect(result.success).toBe(false)
    })

    test('rejects evidence group with invalid datetime format', () => {
        const group = {
            ...createValidGroup(validRecordOwner),
            createdAt: '2024-01-15',
        }
        const result = evidenceGroupSchema.safeParse(group)
        expect(result.success).toBe(false)
    })

    test('accepts empty title string', () => {
        const group = { ...createValidGroup(validRecordOwner), title: '' }
        const result = evidenceGroupSchema.safeParse(group)
        expect(result.success).toBe(true)
    })

    test('rejects non-string title', () => {
        const group = { ...createValidGroup(validRecordOwner), title: 123 }
        const result = evidenceGroupSchema.safeParse(group)
        expect(result.success).toBe(false)
    })
})
