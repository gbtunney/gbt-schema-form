import { describe, expect, test } from 'vitest'

import {
    applyAppliedPatch,
    invertAppliedPatch,
    makeAppliedPatch,
} from './applied-patch.js'
import type { JsonValue } from '../json/json-value.js'
import { getPointer } from '../pointer/pointer.js'

describe('patch/applied-patch makeAppliedPatch', () => {
    test('respects provided id/createdAt', () => {
        const patch = makeAppliedPatch({
            afterJson: 1,
            beforeJson: null,
            createdAt: '2020-01-01T00:00:00.000Z',
            id: 'id-1',
            path: '/a',
            recordId: 'r1',
            source: 'manual',
        })

        expect(patch.id).toBe('id-1')
        expect(patch.createdAt).toBe('2020-01-01T00:00:00.000Z')
    })

    test('generates id and createdAt when omitted', () => {
        const patch = makeAppliedPatch({
            afterJson: 1,
            beforeJson: null,
            path: '/a',
            recordId: 'r1',
            source: 'manual',
        })

        expect(typeof patch.id).toBe('string')
        expect(patch.id.length).toBeGreaterThan(10)
        expect(typeof patch.createdAt).toBe('string')
        expect(patch.createdAt).toMatch(/\d{4}-\d{2}-\d{2}T/)
    })
})

describe('patch/applied-patch invert + apply', () => {
    test('invert swaps before/after and changes id/createdAt', () => {
        const original = makeAppliedPatch({
            afterJson: 2,
            beforeJson: 1,
            createdAt: '2020-01-01T00:00:00.000Z',
            id: 'id-1',
            path: '/a/b',
            recordId: 'r1',
            source: 'manual',
        })

        const inverted = invertAppliedPatch(original)

        expect(inverted.beforeJson).toBe(2)
        expect(inverted.afterJson).toBe(1)
        expect(inverted.id).not.toBe(original.id)
        expect(inverted.createdAt).not.toBe(original.createdAt)
    })

    test('applyAppliedPatch writes afterJson at path immutably', () => {
        const doc: JsonValue = { a: { b: 1 } }

        const patch = makeAppliedPatch({
            afterJson: 2,
            beforeJson: 1,
            path: '/a/b',
            recordId: 'r1',
            source: 'manual',
        })

        const next = applyAppliedPatch(doc, patch)

        expect(getPointer(next, '/a/b')).toBe(2)
        expect(getPointer(doc, '/a/b')).toBe(1)
    })
})
