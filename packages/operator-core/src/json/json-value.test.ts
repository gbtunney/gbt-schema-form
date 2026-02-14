import { describe, expect, test } from 'vitest'
import { jsonValueSchema } from './json-value.js'

describe('json/json-value jsonValueSchema', () => {
    test('accepts string primitives', () => {
        const values = ['hello', '', 'multi\nline', '12345']

        values.forEach((value) => {
            const result = jsonValueSchema.safeParse(value)
            expect(result.success, `Should accept string: "${value}"`).toBe(true)
        })
    })

    test('accepts number primitives', () => {
        const values = [0, 1, -1, 3.14, -3.14, 1e10, -1e-10, Number.MAX_SAFE_INTEGER]

        values.forEach((value) => {
            const result = jsonValueSchema.safeParse(value)
            expect(result.success, `Should accept number: ${value}`).toBe(true)
        })
    })

    test('accepts boolean primitives', () => {
        const values = [true, false]

        values.forEach((value) => {
            const result = jsonValueSchema.safeParse(value)
            expect(result.success, `Should accept boolean: ${value}`).toBe(true)
        })
    })

    test('accepts null', () => {
        const result = jsonValueSchema.safeParse(null)
        expect(result.success).toBe(true)
    })

    test('accepts arrays of JSON values', () => {
        const arrays = [
            [],
            [1, 2, 3],
            ['a', 'b', 'c'],
            [true, false, null],
            [1, 'mixed', true, null],
            [[1, 2], [3, 4]],
            [{ nested: 'object' }],
        ]

        arrays.forEach((value) => {
            const result = jsonValueSchema.safeParse(value)
            expect(result.success, `Should accept array: ${JSON.stringify(value)}`).toBe(true)
        })
    })

    test('accepts objects with JSON values', () => {
        const objects = [
            {},
            { key: 'value' },
            { a: 1, b: 2 },
            { str: 'text', num: 42, bool: true, nil: null },
            { nested: { deep: { object: 'value' } } },
            { arr: [1, 2, 3] },
            { mixed: { strings: ['a', 'b'], numbers: [1, 2] } },
        ]

        objects.forEach((value) => {
            const result = jsonValueSchema.safeParse(value)
            expect(result.success, `Should accept object: ${JSON.stringify(value)}`).toBe(true)
        })
    })

    test('accepts deeply nested structures', () => {
        const deepStructure = {
            level1: {
                level2: {
                    level3: {
                        level4: {
                            array: [1, 2, { nested: true }],
                            value: 'deep',
                        },
                    },
                },
            },
        }

        const result = jsonValueSchema.safeParse(deepStructure)
        expect(result.success).toBe(true)
    })

    test('rejects undefined', () => {
        const result = jsonValueSchema.safeParse(undefined)
        expect(result.success).toBe(false)
    })

    test('rejects functions', () => {
        const result = jsonValueSchema.safeParse(() => {})
        expect(result.success).toBe(false)
    })

    test('rejects symbols', () => {
        const result = jsonValueSchema.safeParse(Symbol('test'))
        expect(result.success).toBe(false)
    })

    test('rejects special number values', () => {
        const invalidNumbers = [NaN, Infinity, -Infinity]

        invalidNumbers.forEach((value) => {
            const result = jsonValueSchema.safeParse(value)
            expect(result.success, `Should reject: ${value}`).toBe(false)
        })
    })

    test('handles complex real-world JSON structures', () => {
        const realWorldData = {
            user: {
                id: '12345',
                name: 'John Doe',
                email: 'john@example.com',
                active: true,
                age: null,
                roles: ['admin', 'user'],
                metadata: {
                    lastLogin: '2024-01-15T10:30:00Z',
                    preferences: {
                        theme: 'dark',
                        notifications: true,
                    },
                },
            },
            items: [
                { id: 1, value: 'First' },
                { id: 2, value: 'Second' },
            ],
        }

        const result = jsonValueSchema.safeParse(realWorldData)
        expect(result.success).toBe(true)
    })
})
