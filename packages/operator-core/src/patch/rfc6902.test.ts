import { describe, expect, test } from 'vitest'
import { applyRfc6902Patch } from './rfc6902.js'
import type { JsonValue } from '../json/json-value.js'

describe('applyRfc6902Patch', () => {
    test('replaces a nested value', () => {
        const document: JsonValue = { a: { b: 1 } }

        const next = applyRfc6902Patch(document, [
            { op: 'replace', path: '/a/b', value: 2 },
        ])

        expect(next).toEqual({ a: { b: 2 } })
        expect(document).toEqual({ a: { b: 1 } })
    })

    test('removes a key', () => {
        const document: JsonValue = { a: { b: 1, c: 2 } }

        const next = applyRfc6902Patch(document, [
            { op: 'remove', path: '/a/b' },
        ])

        expect(next).toEqual({ a: { c: 2 } })
    })
})
