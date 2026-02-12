import { describe, expect, test } from 'vitest'
import { isEffectivelySame } from '../compare/equality.js'
import { normalizePointerValue } from '../compare/normalize.js'
import type { JsonValue } from '../json/json-value.js'
import { applyAppliedPatch, invertAppliedPatch, makeAppliedPatch } from '../patch/applied-patch.js'
import { getPointer, setPointer } from '../pointer/pointer.js'

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

describe('AppliedPatch apply + invert', () => {
    test('apply then invert restores', () => {
        const doc: JsonValue = { a: { b: 1 } }

        const p = makeAppliedPatch({
            afterJson: 2,
            beforeJson: 1,
            path: '/a/b',
            recordId: 'r1',
            source: 'manual',
        })

        const next = applyAppliedPatch(doc, p)
        expect(getPointer(next, '/a/b')).toBe(2)

        const inv = invertAppliedPatch(p)
        const restored = applyAppliedPatch(next, inv)
        expect(getPointer(restored, '/a/b')).toBe(1)
    })
})

describe('normalize/equality', () => {
    test('isEffectivelySame handles trimmed strings', () => {
        expect(isEffectivelySame('/x', '  hi  ', 'hi')).toBe(true)
    })

    test('empty string normalizes to null', () => {
        expect(normalizePointerValue('/x', '')).toBeNull()
        expect(isEffectivelySame('/x', '', null)).toBe(true)
    })
})
