/**
 * @operator/core
 *
 * Opinionated rules:
 * - Zod v4 schemas are the source of truth. Export schemas + infer TS types.
 * - Everything is JSON-serializable. If it can’t round-trip through JSON, it doesn’t belong here.
 * - Patches are reversible by construction (they carry before/after existence + value).
 *
 * No classes, no `interface`, no `any`.
 */

import { z } from 'zod'
export type Id = string

export const IdSchema = z.string().min(1)

export type IsoDateTimeString = string

export const IsoDateTimeStringSchema = z.string().datetime()

export type JsonPrimitive = boolean | null | number | string

export type JsonObject = { [key: string]: JsonValue }

export type JsonValue = JsonObject | Array<JsonValue> | JsonPrimitive

export const JsonValueSchema: z.ZodJSONSchema = z.json()

export type JsonPointer = string

export const JsonPointerSchema = z
    .string()
    .refine(
        (pointer) => pointer === '' || pointer.startsWith('/'),
        'JSON Pointer must be "" (root) or start with "/"',
    )

export type ValueRef =
    | { exists: false }
    | {
          exists: true
          value: JsonValue
      }

export const ValueRefSchema = z.union([
    z.object({ exists: z.literal(false) }),
    z.object({ exists: z.literal(true), value: JsonValueSchema }),
])

export type OperatorPatchOp = {
    op: 'change'
    path: JsonPointer
    before: ValueRef
    after: ValueRef
}

export const OperatorPatchOpSchema = z.object({
    after: ValueRefSchema,
    before: ValueRefSchema,
    op: z.literal('change'),
    path: JsonPointerSchema,
})

export type OperatorPatch = Array<OperatorPatchOp>

export const OperatorPatchSchema = z.array(OperatorPatchOpSchema)

export type RecordSnapshot = {
    recordId: Id
    schemaId: Id
    data: JsonValue
    updatedAt: IsoDateTimeString
}

export const RecordSnapshotSchema = z.object({
    data: JsonValueSchema,
    recordId: IdSchema,
    schemaId: IdSchema,
    updatedAt: IsoDateTimeStringSchema,
})

export type Attachment = {
    id: Id
    storageKey: string
    contentType: string
    filename?: string
    byteSize?: number
    createdAt: IsoDateTimeString
}

export const AttachmentSchema = z.object({
    byteSize: z.number().int().nonnegative().optional(),
    contentType: z.string().min(1),
    createdAt: IsoDateTimeStringSchema,
    filename: z.string().min(1).optional(),
    id: IdSchema,
    storageKey: z.string().min(1),
})

export type EvidenceOwner =
    | {
          kind: 'record'
          recordId: Id
      }
    | {
          kind: 'global'
      }

export const EvidenceOwnerSchema = z.union([
    z.object({ kind: z.literal('record'), recordId: IdSchema }),
    z.object({ kind: z.literal('global') }),
])

export type EvidenceGroup = {
    id: Id
    owner: EvidenceOwner
    title: string
    createdAt: IsoDateTimeString
}

export const EvidenceGroupSchema = z.object({
    createdAt: IsoDateTimeStringSchema,
    id: IdSchema,
    owner: EvidenceOwnerSchema,
    title: z.string().min(1),
})

export type EvidenceItemBase = {
    id: Id
    groupId: Id
    createdAt: IsoDateTimeString
    summary?: string
}

export type EvidenceTextItem = EvidenceItemBase & {
    type: 'text'
    text: string
}

export type EvidenceUrlItem = EvidenceItemBase & {
    type: 'url'
    url: string
}

export type EvidenceImageItem = EvidenceItemBase & {
    type: 'image'
    attachmentId: Id
}

export type EvidenceAudioItem = EvidenceItemBase & {
    type: 'audio'
    attachmentId: Id
}

export type EvidencePdfItem = EvidenceItemBase & {
    type: 'pdf'
    attachmentId: Id
}

export type EvidenceItem =
    | EvidenceAudioItem
    | EvidenceImageItem
    | EvidencePdfItem
    | EvidenceTextItem
    | EvidenceUrlItem

export const EvidenceItemSchema = z.discriminatedUnion('type', [
    z.object({
        createdAt: IsoDateTimeStringSchema,
        groupId: IdSchema,
        id: IdSchema,
        summary: z.string().min(1).optional(),
        text: z.string(),
        type: z.literal('text'),
    }),
    z.object({
        createdAt: IsoDateTimeStringSchema,
        groupId: IdSchema,
        id: IdSchema,
        summary: z.string().min(1).optional(),
        type: z.literal('url'),
        url: z.string().url(),
    }),
    z.object({
        attachmentId: IdSchema,
        createdAt: IsoDateTimeStringSchema,
        groupId: IdSchema,
        id: IdSchema,
        summary: z.string().min(1).optional(),
        type: z.literal('image'),
    }),
    z.object({
        attachmentId: IdSchema,
        createdAt: IsoDateTimeStringSchema,
        groupId: IdSchema,
        id: IdSchema,
        summary: z.string().min(1).optional(),
        type: z.literal('audio'),
    }),
    z.object({
        attachmentId: IdSchema,
        createdAt: IsoDateTimeStringSchema,
        groupId: IdSchema,
        id: IdSchema,
        summary: z.string().min(1).optional(),
        type: z.literal('pdf'),
    }),
])

export type Proposal = {
    id: Id
    createdAt: IsoDateTimeString
    path: JsonPointer
    value: JsonValue
    confidence: number
    evidenceItemIds: Array<Id>
    note?: string
}

export const ProposalSchema = z.object({
    confidence: z.number().min(0).max(1),
    createdAt: IsoDateTimeStringSchema,
    evidenceItemIds: z.array(IdSchema),
    id: IdSchema,
    note: z.string().min(1).optional(),
    path: JsonPointerSchema,
    value: JsonValueSchema,
})

/** Escapes one JSON Pointer segment. */
export function escapeJsonPointerSegment(segment: string): string {
    return segment.replaceAll('~', '~0').replaceAll('/', '~1')
}

/** Unescapes one JSON Pointer segment. */
export function unescapeJsonPointerSegment(segment: string): string {
    return segment.replaceAll('~1', '/').replaceAll('~0', '~')
}

/** Converts a JSON Pointer string to unescaped segments. */
export function parseJsonPointer(pointer: JsonPointer): Array<string> {
    if (pointer === '') return []
    if (!pointer.startsWith('/')) {
        throw new Error('Invalid JSON Pointer: must start with "/" or be ""')
    }
    return pointer.split('/').slice(1).map(unescapeJsonPointerSegment)
}

/** Converts segments to a JSON Pointer string. */
export function formatJsonPointer(segments: ReadonlyArray<string>): JsonPointer {
    if (segments.length === 0) return ''
    return `/${segments.map(escapeJsonPointerSegment).join('/')}`
}

function isNonNegativeIntegerString(value: string): boolean {
    return /^(0|[1-9]\d*)$/.test(value)
}

function isJsonObject(value: JsonValue): value is JsonObject {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/** Reads a value at a pointer, preserving whether it exists. */
export function getAtJsonPointer(args: { data: JsonValue; pointer: JsonPointer }): ValueRef {
    const segments = parseJsonPointer(args.pointer)
    let current: JsonValue = args.data

    if (segments.length === 0) return { exists: true, value: current }

    for (const segment of segments) {
        if (Array.isArray(current)) {
            if (!isNonNegativeIntegerString(segment)) return { exists: false }
            const index = Number(segment)
            if (!Number.isSafeInteger(index) || index < 0 || index >= current.length) {
                return { exists: false }
            }
            current = current[index] as JsonValue
            continue
        }

        if (isJsonObject(current)) {
            if (!(segment in current)) return { exists: false }
            current = current[segment] as JsonValue
            continue
        }

        return { exists: false }
    }

    return { exists: true, value: current }
}

function setAtSegments(args: {
    current: JsonValue
    segments: ReadonlyArray<string>
    value: JsonValue
}): JsonValue {
    if (args.segments.length === 0) return args.value

    const [head, ...tail] = args.segments

    if (Array.isArray(args.current) && isNonNegativeIntegerString(head)) {
        const index = Number(head)
        const nextCurrent: JsonValue =
            index >= 0 && index < args.current.length
                ? (args.current[index] as JsonValue)
                : nextContainerForNextSegment(tail[0])

        const nextValue = setAtSegments({
            current: nextCurrent,
            segments: tail,
            value: args.value,
        })

        const copy = args.current.slice()
        if (index === copy.length) {
            copy.push(nextValue)
        } else {
            copy[index] = nextValue
        }
        return copy
    }

    const objectCurrent: JsonObject = isJsonObject(args.current) ? args.current : {}

    const nextCurrent: JsonValue =
        head in objectCurrent ? (objectCurrent[head] as JsonValue) : nextContainerForNextSegment(tail[0])

    const nextValue = setAtSegments({
        current: nextCurrent,
        segments: tail,
        value: args.value,
    })

    return { ...objectCurrent, [head]: nextValue }
}

function nextContainerForNextSegment(nextSegment: string | undefined): JsonValue {
    if (nextSegment === undefined) return {}
    if (isNonNegativeIntegerString(nextSegment)) return []
    return {}
}

function removeAtSegments(args: { current: JsonValue; segments: ReadonlyArray<string> }): JsonValue {
    if (args.segments.length === 0) {
        throw new Error('Refusing to delete the root document')
    }

    const [head, ...tail] = args.segments

    if (tail.length === 0) {
        if (Array.isArray(args.current) && isNonNegativeIntegerString(head)) {
            const index = Number(head)
            if (index < 0 || index >= args.current.length) return args.current
            const copy = args.current.slice()
            copy.splice(index, 1)
            return copy
        }

        if (isJsonObject(args.current)) {
            if (!(head in args.current)) return args.current
            const { [head]: _removed, ...rest } = args.current
            return rest
        }

        return args.current
    }

    if (Array.isArray(args.current) && isNonNegativeIntegerString(head)) {
        const index = Number(head)
        if (index < 0 || index >= args.current.length) return args.current
        const child = args.current[index] as JsonValue
        const nextChild = removeAtSegments({ current: child, segments: tail })
        if (nextChild === child) return args.current
        const copy = args.current.slice()
        copy[index] = nextChild
        return copy
    }

    if (isJsonObject(args.current)) {
        if (!(head in args.current)) return args.current
        const child = args.current[head] as JsonValue
        const nextChild = removeAtSegments({ current: child, segments: tail })
        if (nextChild === child) return args.current
        return { ...args.current, [head]: nextChild }
    }

    return args.current
}

/** Sets a value at a pointer immutably (creating intermediate objects/arrays). */
export function setAtJsonPointer(args: {
    data: JsonValue
    pointer: JsonPointer
    value: JsonValue
}): JsonValue {
    const segments = parseJsonPointer(args.pointer)
    return setAtSegments({ current: args.data, segments, value: args.value })
}

/** Removes a value at a pointer immutably. Array removals shift remaining elements. */
export function removeAtJsonPointer(args: { data: JsonValue; pointer: JsonPointer }): JsonValue {
    const segments = parseJsonPointer(args.pointer)
    return removeAtSegments({ current: args.data, segments })
}

/** Creates a reversible change op by capturing the current value at `path`. */
export function createChangeOp(args: {
    data: JsonValue
    path: JsonPointer
    after: ValueRef
}): OperatorPatchOp {
    return {
        after: args.after,
        before: getAtJsonPointer({ data: args.data, pointer: args.path }),
        op: 'change',
        path: args.path,
    }
}

/** Applies a reversible patch to JSON data immutably. */
export function applyOperatorPatch(args: { data: JsonValue; patch: OperatorPatch }): JsonValue {
    return args.patch.reduce((current, op) => {
        if (op.op !== 'change') return current
        if (op.after.exists) {
            return setAtJsonPointer({
                data: current,
                pointer: op.path,
                value: op.after.value,
            })
        }
        return removeAtJsonPointer({ data: current, pointer: op.path })
    }, args.data)
}

/** Inverts a reversible patch. */
export function invertOperatorPatch(patch: OperatorPatch): OperatorPatch {
    return [...patch].reverse().map((op) => ({ ...op, after: op.before, before: op.after }))
}

function sortJsonKeys(value: JsonValue): JsonValue {
    if (Array.isArray(value)) return value.map(sortJsonKeys)
    if (isJsonObject(value)) {
        const keys = Object.keys(value).sort()
        const sorted: JsonObject = {}
        for (const key of keys) {
            sorted[key] = sortJsonKeys(value[key] as JsonValue)
        }
        return sorted
    }
    return value
}

/** Stable JSON stringify (recursively sorts object keys). */
export function stableStringify(value: JsonValue): string {
    return JSON.stringify(sortJsonKeys(value))
}
