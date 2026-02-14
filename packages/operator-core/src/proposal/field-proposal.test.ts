import { describe, expect, test } from 'vitest'
import { fieldProposalSchema } from './field-proposal.js'

describe('proposal/field-proposal fieldProposalSchema', () => {
    const validProposal = {
        confidence: 'High' as const,
        evidenceItemId: 'item-456',
        excerpt: 'Email found in document: user@example.com',
        id: 'proposal-123',
        path: '/contact/email',
        value: 'user@example.com',
    }

    test('accepts valid field proposal with all fields', () => {
        const result = fieldProposalSchema.safeParse(validProposal)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.id).toBe('proposal-123')
            expect(result.data.evidenceItemId).toBe('item-456')
            expect(result.data.path).toBe('/contact/email')
            expect(result.data.value).toBe('user@example.com')
            expect(result.data.confidence).toBe('High')
        }
    })

    test('accepts valid proposal without optional excerpt', () => {
        const { excerpt, ...withoutExcerpt } = validProposal
        const result = fieldProposalSchema.safeParse(withoutExcerpt)
        expect(result.success).toBe(true)
    })

    test('accepts all valid confidence levels', () => {
        const confidenceLevels = ['High', 'Medium', 'Low'] as const

        confidenceLevels.forEach((confidence) => {
            const proposal = { ...validProposal, confidence }
            const result = fieldProposalSchema.safeParse(proposal)
            expect(result.success).toBe(true)
        })
    })

    test('rejects invalid confidence levels', () => {
        const invalidConfidences = ['high', 'MEDIUM', 'low', 'VeryHigh', '', 'Unknown']

        invalidConfidences.forEach((confidence) => {
            const proposal = { ...validProposal, confidence }
            const result = fieldProposalSchema.safeParse(proposal)
            expect(result.success).toBe(false)
        })
    })

    test('accepts various JSON value types', () => {
        const testValues = [
            'string value',
            123,
            true,
            false,
            null,
            { nested: 'object' },
            [1, 2, 3],
            { complex: { nested: ['array', 'values'] } },
        ]

        testValues.forEach((value) => {
            const proposal = { ...validProposal, value }
            const result = fieldProposalSchema.safeParse(proposal)
            expect(result.success).toBe(true)
        })
    })

    test('rejects proposal missing required id', () => {
        const { id, ...withoutId } = validProposal
        const result = fieldProposalSchema.safeParse(withoutId)
        expect(result.success).toBe(false)
    })

    test('rejects proposal missing evidenceItemId', () => {
        const { evidenceItemId, ...withoutEvidenceItemId } = validProposal
        const result = fieldProposalSchema.safeParse(withoutEvidenceItemId)
        expect(result.success).toBe(false)
    })

    test('rejects proposal with empty evidenceItemId', () => {
        const proposal = { ...validProposal, evidenceItemId: '' }
        const result = fieldProposalSchema.safeParse(proposal)
        expect(result.success).toBe(false)
    })

    test('rejects proposal missing path', () => {
        const { path, ...withoutPath } = validProposal
        const result = fieldProposalSchema.safeParse(withoutPath)
        expect(result.success).toBe(false)
    })

    test('accepts empty path string', () => {
        const proposal = { ...validProposal, path: '' }
        const result = fieldProposalSchema.safeParse(proposal)
        expect(result.success).toBe(true)
    })

    test('accepts JSON pointer paths', () => {
        const validPaths = ['/contact/email', '/address/0/street', '/data/nested/field', '/']

        validPaths.forEach((path) => {
            const proposal = { ...validProposal, path }
            const result = fieldProposalSchema.safeParse(proposal)
            expect(result.success).toBe(true)
        })
    })

    test('rejects non-string excerpt', () => {
        const proposal = { ...validProposal, excerpt: 123 }
        const result = fieldProposalSchema.safeParse(proposal)
        expect(result.success).toBe(false)
    })

    test('accepts empty excerpt string', () => {
        const proposal = { ...validProposal, excerpt: '' }
        const result = fieldProposalSchema.safeParse(proposal)
        expect(result.success).toBe(true)
    })
})
