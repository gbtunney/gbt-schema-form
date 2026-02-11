import { describe, expect, it } from 'vitest'

import {
    applyOperatorPatch,
    createChangeOp,
    getAtJsonPointer,
    invertOperatorPatch,
    JsonValueSchema,
    stableStringify,
} from './index.js'

describe('@operator/core', () => {
    it('parses JsonValue via Zod', () => {
        const parsed = JsonValueSchema.parse({ a: [1, true, null, 'x'] })
        expect(parsed).toEqual({ a: [1, true, null, 'x'] })
    })

    it('reads missing paths with exists=false', () => {
        const ref = getAtJsonPointer({ data: { a: { b: 1 } }, pointer: '/a/c' })
        expect(ref).toEqual({ exists: false })
    })

    it('applies reversible patch and inverts it', () => {
        const initial = { a: { b: 1 }, list: ['x', 'y'] }

        const patch = [
            createChangeOp({
                after: { exists: true, value: 2 },
                data: initial,
                path: '/a/b',
            }),
            createChangeOp({
                after: { exists: false },
                data: initial,
                path: '/list/0',
            }),
        ]

        const next = applyOperatorPatch({ data: initial, patch })
        expect(next).toEqual({ a: { b: 2 }, list: ['y'] })

        const inverted = invertOperatorPatch(patch)
        const roundTrip = applyOperatorPatch({ data: next, patch: inverted })
        expect(roundTrip).toEqual(initial)
    })

    it('stableStringify is key-order deterministic', () => {
        expect(stableStringify({ a: 2, b: 1 })).toBe(stableStringify({ a: 2, b: 1 }))
    })
})
