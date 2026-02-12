import { describe, expect, test } from 'vitest'
import type { JsonValue } from '../json/json-value.js'
import { getPointer, removePointer, setPointer } from '../pointer/pointer.js'

describe('pointer getPointer/setPointer', () => {
    test('"" returns root', () => {
        const document: JsonValue = { a: 1 }
        expect(getPointer(document, '')).toEqual(document)
        expect(setPointer(document, '', { b: 2 })).toEqual({ b: 2 })
    })

    test('setPointer is immutable and updates nested object', () => {
        const document: JsonValue = { a: { b: 1 } }
        const next = setPointer(document, '/a/b', 2)
        expect(next).toEqual({ a: { b: 2 } })
        expect(document).toEqual({ a: { b: 1 } })
    })

    test('strict array handling (numeric segments only)', () => {
        const doc: JsonValue = { a: [10, 20] }
        expect(getPointer(doc, '/a/1')).toBe(20)
        expect(() => setPointer(doc, '/a/foo', 99)).toThrow()
    })

    test('unescape ~1 and ~0', () => {
        const doc: JsonValue = { 'a/b': { '~c': 1 } }
        expect(getPointer(doc, '/a~1b/~0c')).toBe(1)
    })
})

describe('pointer removePointer', () => {
    test('removes a key immutably', () => {
        const doc: JsonValue = { a: { b: 1, c: 2 } }

        const next = removePointer(doc, '/a/b')

        expect(next).toEqual({ a: { c: 2 } })
        expect(doc).toEqual({ a: { b: 1, c: 2 } })
    })

    test('refuses to delete root', () => {
        const doc: JsonValue = { a: 1 }
        expect(() => removePointer(doc, '')).toThrow()
    })
})
