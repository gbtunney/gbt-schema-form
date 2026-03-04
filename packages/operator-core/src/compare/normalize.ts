import type { JsonValue } from '../json/json-value.js'

/**
 * NormalizePointerValue
 *
 * V1 normalization rules:
 *
 * - Trim strings
 * - Empty string -> null
 *
 * Notes:
 *
 * - `pointer` is accepted for future path-specific normalization rules.
 * - For non-strings, the value is returned unchanged.
 */
export function normalizePointerValue(
    pointer: string,
    value: JsonValue,
): JsonValue {
    void pointer

    if (typeof value !== 'string') return value

    const trimmed = value.trim()
    return trimmed === '' ? null : trimmed
}
