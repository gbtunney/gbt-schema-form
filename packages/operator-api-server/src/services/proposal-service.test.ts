// Tests for proposal-service
//
// Strategy: test the pure helper functions (describeSchema, buildUserPrompt)
// directly — no OpenAI mock needed for those. The integration of the full
// service with a live OpenAI key is left for manual/e2e testing.
//
// This means these tests run fast, offline, and without any API key.

import type { ProposalRequest } from '@operator/store'
import { describe, expect, test } from 'vitest'
import {
    buildSystemPrompt,
    buildUserPrompt,
    describeSchema,
} from './proposal-service.js'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const equipmentSchema = {
    properties: {
        category: {
            enum: ['Laptop', 'Monitor', 'Server'],
            title: 'Category',
            type: 'string',
        },
        manufacturer: { title: 'Manufacturer', type: 'string' },
        model: { title: 'Model', type: 'string' },
        purchaseDate: {
            format: 'date',
            title: 'Purchase Date',
            type: 'string',
        },
        serialNumber: { title: 'Serial Number', type: 'string' },
        status: {
            enum: ['Active', 'In Repair', 'Retired'],
            title: 'Status',
            type: 'string',
        },
    },
    required: ['serialNumber', 'category'],
    title: 'Equipment Record',
    type: 'object',
}

const sampleRequest: ProposalRequest = {
    evidenceItem: {
        createdAt: '2025-01-01T00:00:00Z',
        groupId: 'grp-001',
        id: 'item-001',
        pinned: false,
        selected: false,
        text: 'Dell Latitude 7440, serial DLAT-2025-001, status Active, purchased 2025-01-15',
        title: 'Asset tag scan',
        updatedAt: '2025-01-01T00:00:00Z',
    },
    jsonSchema: equipmentSchema,
    recordData: { manufacturer: 'Dell' },
    schemaId: 'equipment.v1',
}

// ─── describeSchema ───────────────────────────────────────────────────────────

describe('describeSchema', () => {
    test('returns a line for each property', () => {
        const lines = describeSchema(equipmentSchema)
        expect(lines).toHaveLength(6) // one per property
    })

    test('includes JSON pointer paths', () => {
        const lines = describeSchema(equipmentSchema)
        expect(lines.some((l) => l.includes('/model'))).toBe(true)
        expect(lines.some((l) => l.includes('/serialNumber'))).toBe(true)
        expect(lines.some((l) => l.includes('/category'))).toBe(true)
    })

    test('includes property titles', () => {
        const lines = describeSchema(equipmentSchema)
        expect(lines.some((l) => l.includes('Serial Number'))).toBe(true)
        expect(lines.some((l) => l.includes('Purchase Date'))).toBe(true)
    })

    test('includes enum values', () => {
        const lines = describeSchema(equipmentSchema)
        const categoryLine = lines.find((l) => l.includes('/category'))
        expect(categoryLine).toContain('"Laptop"')
        expect(categoryLine).toContain('"Monitor"')
        expect(categoryLine).toContain('"Server"')
    })

    test('includes format annotation', () => {
        const lines = describeSchema(equipmentSchema)
        const dateLine = lines.find((l) => l.includes('/purchaseDate'))
        expect(dateLine).toContain('[date]')
    })

    test('returns empty array for schema with no properties', () => {
        expect(describeSchema({ type: 'string' })).toHaveLength(0)
        expect(describeSchema(null)).toHaveLength(0)
        expect(describeSchema({})).toHaveLength(0)
    })

    test('recurses into nested objects', () => {
        const nestedSchema = {
            properties: {
                specs: {
                    properties: {
                        weight: { title: 'Weight kg', type: 'number' },
                    },
                    title: 'Specs',
                    type: 'object',
                },
            },
            type: 'object',
        }
        const lines = describeSchema(nestedSchema)
        expect(lines.some((l) => l.includes('/specs/weight'))).toBe(true)
    })
})

// ─── buildSystemPrompt ────────────────────────────────────────────────────────

describe('buildSystemPrompt', () => {
    test('instructs to return JSON only', () => {
        const prompt = buildSystemPrompt()
        expect(prompt).toContain('valid JSON only')
    })

    test('defines the three confidence levels', () => {
        const prompt = buildSystemPrompt()
        expect(prompt).toContain('High')
        expect(prompt).toContain('Medium')
        expect(prompt).toContain('Low')
    })

    test('instructs not to invent data', () => {
        const prompt = buildSystemPrompt()
        expect(prompt.toLowerCase()).toContain('do not invent')
    })

    test('specifies the proposals wrapper key', () => {
        const prompt = buildSystemPrompt()
        expect(prompt).toContain('"proposals"')
    })
})

// ─── buildUserPrompt ──────────────────────────────────────────────────────────

describe('buildUserPrompt', () => {
    test('includes evidence item text', () => {
        const prompt = buildUserPrompt(sampleRequest)
        expect(prompt).toContain('Dell Latitude 7440')
        expect(prompt).toContain('DLAT-2025-001')
    })

    test('includes evidence item id', () => {
        const prompt = buildUserPrompt(sampleRequest)
        expect(prompt).toContain('item-001')
    })

    test('includes current record data', () => {
        const prompt = buildUserPrompt(sampleRequest)
        expect(prompt).toContain('"manufacturer"')
        expect(prompt).toContain('"Dell"')
    })

    test('includes all schema field paths when jsonSchema provided', () => {
        const prompt = buildUserPrompt(sampleRequest)
        expect(prompt).toContain('/model')
        expect(prompt).toContain('/serialNumber')
        expect(prompt).toContain('/category')
        expect(prompt).toContain('/purchaseDate')
    })

    test('includes enum values in field descriptions', () => {
        const prompt = buildUserPrompt(sampleRequest)
        expect(prompt).toContain('"Laptop"')
        expect(prompt).toContain('"Active"')
    })

    test('instructs to only use listed paths', () => {
        const prompt = buildUserPrompt(sampleRequest)
        expect(prompt).toContain(
            'Only suggest proposals using paths from the list above',
        )
    })

    test('falls back when no jsonSchema provided', () => {
        const prompt = buildUserPrompt({
            ...sampleRequest,
            jsonSchema: undefined,
        })
        expect(prompt).toContain('equipment.v1')
        expect(prompt).toContain('no schema provided')
        // Should still include evidence text
        expect(prompt).toContain('Dell Latitude 7440')
    })
})
