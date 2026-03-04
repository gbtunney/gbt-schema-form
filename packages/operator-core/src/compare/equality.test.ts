import { describe, expect, test } from 'vitest'

import { isEffectivelySame, jsonEquals } from './equality.js'
import type { JsonValue } from '../json/json-value.js'

describe('compare/equality jsonEquals', () => {
    test('primitive equality', () => {
        expect(jsonEquals('a', 'a')).toBe(true)
        expect(jsonEquals(1, 1)).toBe(true)
        expect(jsonEquals(true, true)).toBe(true)
        expect(jsonEquals(null, null)).toBe(true)
    })

    test('primitive inequality', () => {
        expect(jsonEquals('1', 1 as unknown as JsonValue)).toBe(false)
        expect(jsonEquals(false, true)).toBe(false)
        expect(jsonEquals(null, 0 as unknown as JsonValue)).toBe(false)
    })

    test('array deep equality (order-sensitive)', () => {
        expect(jsonEquals([1, { a: 2 }], [1, { a: 2 }])).toBe(true)
        expect(jsonEquals([1, 2], [2, 1])).toBe(false)
        expect(jsonEquals([1, 2], [1, 2, 3] as unknown as JsonValue)).toBe(
            false,
        )
    })

    test('object deep equality (key order-insensitive)', () => {
        expect(jsonEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
        expect(jsonEquals({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false)
        expect(
            jsonEquals({ a: 1 }, { a: 1, b: 2 } as unknown as JsonValue),
        ).toBe(false)
    })
})

describe('compare/equality isEffectivelySame', () => {
    test('normalizes strings before compare', () => {
        expect(isEffectivelySame('/x', '  hi  ', 'hi')).toBe(true)
        expect(isEffectivelySame('/x', '', null)).toBe(true)
        expect(isEffectivelySame('/x', ' ', 'x')).toBe(false)
    })
})
