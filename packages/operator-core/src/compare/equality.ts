import { type Json, objectUtils } from '@snailicide/g-library'
import { Writable } from 'type-fest'
import { normalizePointerValue } from './normalize.js'
import type { JsonValue } from '../json/json-value.js'
/* ------------------ Equality ------------------ */

/**
 * equalsArray
 *
 * Compares two JsonValue arrays by:
 * - length equality
 * - deep equality of each element in order
 */
function equalsArray(leftArray: Json.Array, rightArray: Json.Array): boolean {
    if (leftArray.length !== rightArray.length) return false

    return leftArray.every((leftValue, index) => {
        const rightValue = rightArray[index]
        if (rightValue === undefined) return false
        return jsonEquals(leftValue, rightValue)
    })
}

/**
 * equalsObject
 *
 * Compares two JsonValue objects by:
 * - same number of keys
 * - same set of keys
 * - deep equality of each key's value
 */
function equalsObject(leftValue: Writable<Json.Object>, rightValue: Json.Object): boolean {
    const leftKeys = Object.keys(leftValue)
    const rightKeys = Object.keys(rightValue)

    if (leftKeys.length !== rightKeys.length) return false

    for (const key of leftKeys) {
        if (leftValue[key] === undefined || rightValue[key] === undefined) return false

        if (objectUtils.isJsonifiable(leftValue[key]) || objectUtils.isJsonifiable(rightValue[key])) {
            /**
             *as Json.Object
             */
            const innerLeftVal: JsonValue = leftValue[key]
            /**
             *as Json.Object
             */
            const innerRightVal: JsonValue = rightValue[key]

            if (
                !Object.prototype.hasOwnProperty.call(rightKeys, key) ||
                !Object.prototype.hasOwnProperty.call(leftKeys, key)
            )
                return false
            if (!jsonEquals(innerLeftVal, innerRightVal)) return false
        }
    }
    return true
}

/* ------------------------------ Public API ----------------------------- */
/**
 * jsonEquals
 *
 * Deep structural equality for JsonValue.
 */

export function jsonEquals(leftValue: JsonValue, rightValue: JsonValue): boolean {
    if (leftValue === rightValue) return true

    if (leftValue === null || rightValue === null) return leftValue === rightValue

    if (typeof leftValue !== typeof rightValue) return false

    if (objectUtils.isJsonifiableArray(leftValue)) {
        return objectUtils.isJsonifiableArray(rightValue) && equalsArray(leftValue, rightValue)
    }

    if (objectUtils.isJsonifiableObject(leftValue) && objectUtils.isJsonifiableObject(rightValue)) {
        if (objectUtils.isJsonifiableArray(rightValue) || rightValue === null) return false
        return equalsObject(leftValue, rightValue)
    }

    return false
}

/**
 * Effective sameness (normalize + compare).
 */
export function isEffectivelySame(pointer: string, leftValue: JsonValue, rightValue: JsonValue): boolean {
    return jsonEquals(normalizePointerValue(pointer, leftValue), normalizePointerValue(pointer, rightValue))
}
