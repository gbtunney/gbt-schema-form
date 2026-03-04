import { describe, expect, test } from 'vitest'

import { normalizePointerValue } from './normalize.js'

describe('compare/normalize normalizePointerValue', () => {
    test('trims strings', () => {
        expect(normalizePointerValue('/x', '  hi  ')).toBe('hi')
    })

    test('empty-after-trim becomes null', () => {
        expect(normalizePointerValue('/x', '')).toBeNull()
        expect(normalizePointerValue('/x', '   ')).toBeNull()
    })

    test('non-strings are unchanged', () => {
        expect(normalizePointerValue('/x', 1)).toBe(1)
        expect(normalizePointerValue('/x', false)).toBe(false)
        expect(normalizePointerValue('/x', null)).toBeNull()
        expect(normalizePointerValue('/x', { a: 1 })).toEqual({ a: 1 })
        expect(normalizePointerValue('/x', [1, 2])).toEqual([1, 2])
    })
})
