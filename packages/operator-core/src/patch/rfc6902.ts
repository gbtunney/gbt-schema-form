import type { Operation } from 'rfc6902'
import { applyPatch } from 'rfc6902'
import type { JsonValue } from '../json/json-value.js'

export type JsonPatchOp = Operation

function cloneJson(value: JsonValue): JsonValue {
    // JSON-safe clone
    return JSON.parse(JSON.stringify(value)) as JsonValue
}

export function applyRfc6902Patch(
    doc: JsonValue,
    ops: Array<JsonPatchOp>,
): JsonValue {
    const cloned = cloneJson(doc)

    /**
     * `rfc6902.applyPatch` mutates the passed document in-place. Return shapes vary by version; handle the common
     * cases.
     */
    const result = applyPatch(cloned as unknown as object, ops) as unknown

    if (Array.isArray(result)) {
        const errorItems = result.filter((item) => {
            if (typeof item !== 'object' || item === null) return false
            if (!('error' in item)) return false
            return Boolean((item as { error?: unknown }).error)
        })

        if (errorItems.length > 0) {
            throw new Error('RFC6902 patch failed')
        }

        return cloned
    }

    if (typeof result === 'object' && result !== null && 'doc' in result) {
        return (result as { doc: unknown }).doc as JsonValue
    }

    return cloned
}
