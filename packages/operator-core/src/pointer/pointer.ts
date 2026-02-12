import { type Json, objectUtils } from '@snailicide/g-library'
import * as jp from 'json-pointer'
import type { JsonValue } from '../json/json-value.js'
export type Pointer = string

export type Container = Json.Object | Json.Array
function isContainer(jsonValue: JsonValue): jsonValue is Json.Object | Json.Array {
    return objectUtils.isJsonifiableObject(jsonValue) || objectUtils.isJsonifiableArray(jsonValue)
}

function cloneContainer<Type extends Container>(value: Type): JsonValue {
    return structuredClone(value)
}

/**
 * Get value at JSON Pointer.
 */
export function getPointer(document: JsonValue, pointer: Pointer): JsonValue | undefined {
    if (pointer === '') return document

    return jp.get(document as unknown as object, pointer) as JsonValue | undefined
}

/**
 * Set value at JSON Pointer (immutable).
 */
export function setPointer(document: JsonValue, pointer: Pointer, value: JsonValue): JsonValue {
    if (pointer === '') return value

    if (!isContainer(document)) {
        throw new Error(`Cannot set non-root pointer on non-container root: ${pointer}`)
    }

    const clone = cloneContainer(document)

    jp.set(clone as unknown as object, pointer, value)

    return clone
}

/**
 * Remove value at JSON Pointer (immutable).
 */
export function removePointer(document: JsonValue, pointer: Pointer): JsonValue {
    if (pointer === '') {
        throw new Error('Refusing to delete root document')
    }

    if (!isContainer(document)) {
        return document
    }

    const clone = cloneContainer(document)

    jp.remove(clone as unknown as object, pointer)

    return clone
}
