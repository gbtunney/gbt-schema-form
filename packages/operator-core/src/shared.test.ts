import { describe, expect, test } from 'vitest'
import { isoDateTimeStringSchema } from './shared.js'

describe('shared isoDateTimeStringSchema', () => {
    test('accepts valid ISO 8601 datetime strings', () => {
        const validDates = [
            '2024-01-15T10:30:00Z',
            '2024-01-15T10:30:00.123Z',
            '2024-12-31T23:59:59Z',
            '2024-01-01T00:00:00.000Z',
        ]

        validDates.forEach((date) => {
            const result = isoDateTimeStringSchema.safeParse(date)
            expect(result.success).toBe(true)
        })
    })

    test('rejects invalid datetime formats', () => {
        const invalidDates = [
            '',
            'not-a-date',
            '2024-01-15',
            '2024-01-15 10:30:00',
            '15/01/2024',
            'January 15, 2024',
            '2024-13-01T10:30:00Z', // invalid month
            '2024-01-32T10:30:00Z', // invalid day
        ]

        invalidDates.forEach((date) => {
            const result = isoDateTimeStringSchema.safeParse(date)
            expect(result.success).toBe(false)
        })
    })

    test('rejects non-string values', () => {
        const invalidValues = [null, undefined, 123, true, {}, []]

        invalidValues.forEach((value) => {
            const result = isoDateTimeStringSchema.safeParse(value)
            expect(result.success).toBe(false)
        })
    })
})
