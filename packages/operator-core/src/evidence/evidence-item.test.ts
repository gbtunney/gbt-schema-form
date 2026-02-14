import { describe, expect, test } from 'vitest'
import { evidenceItemSchema } from './evidence-item.js'

describe('evidence/evidence-item evidenceItemSchema', () => {
    const validEvidenceItem = {
        id: 'item-123',
        groupId: 'group-456',
        title: 'Test Evidence',
        text: 'This is the evidence content.',
        pinned: false,
        selected: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T12:00:00Z',
    }

    test('accepts valid evidence item with all required fields', () => {
        const result = evidenceItemSchema.safeParse(validEvidenceItem)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.id).toBe('item-123')
            expect(result.data.groupId).toBe('group-456')
            expect(result.data.pinned).toBe(false)
            expect(result.data.selected).toBe(true)
        }
    })

    test('rejects evidence item missing required id', () => {
        const { id, ...withoutId } = validEvidenceItem
        const result = evidenceItemSchema.safeParse(withoutId)
        expect(result.success).toBe(false)
    })

    test('rejects evidence item missing required groupId', () => {
        const { groupId, ...withoutGroupId } = validEvidenceItem
        const result = evidenceItemSchema.safeParse(withoutGroupId)
        expect(result.success).toBe(false)
    })

    test('rejects evidence item with empty id', () => {
        const invalidItem = { ...validEvidenceItem, id: '' }
        const result = evidenceItemSchema.safeParse(invalidItem)
        expect(result.success).toBe(false)
    })

    test('rejects evidence item with empty groupId', () => {
        const invalidItem = { ...validEvidenceItem, groupId: '' }
        const result = evidenceItemSchema.safeParse(invalidItem)
        expect(result.success).toBe(false)
    })

    test('rejects evidence item with invalid datetime format', () => {
        const invalidItem = { ...validEvidenceItem, createdAt: 'not-a-date' }
        const result = evidenceItemSchema.safeParse(invalidItem)
        expect(result.success).toBe(false)
    })

    test('rejects evidence item with non-boolean pinned', () => {
        const invalidItem = { ...validEvidenceItem, pinned: 'true' }
        const result = evidenceItemSchema.safeParse(invalidItem)
        expect(result.success).toBe(false)
    })

    test('rejects evidence item with non-boolean selected', () => {
        const invalidItem = { ...validEvidenceItem, selected: 1 }
        const result = evidenceItemSchema.safeParse(invalidItem)
        expect(result.success).toBe(false)
    })

    test('accepts empty strings for title and text', () => {
        const itemWithEmptyStrings = { ...validEvidenceItem, title: '', text: '' }
        const result = evidenceItemSchema.safeParse(itemWithEmptyStrings)
        expect(result.success).toBe(true)
    })

    test('rejects non-string title', () => {
        const invalidItem = { ...validEvidenceItem, title: 123 }
        const result = evidenceItemSchema.safeParse(invalidItem)
        expect(result.success).toBe(false)
    })

    test('rejects non-string text', () => {
        const invalidItem = { ...validEvidenceItem, text: null }
        const result = evidenceItemSchema.safeParse(invalidItem)
        expect(result.success).toBe(false)
    })
})
