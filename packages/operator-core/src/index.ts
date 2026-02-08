// Core types and pure functions for the schema-driven operator.
//
// Evidence items represent the messy inputs (text, images, audio, urls) that users collect
// before extracting structured data. Proposals suggest field values derived from the evidence.
// Patches represent reversible changes to records.

import { z } from 'zod'

/* Evidence types */

/** Supported evidence item kinds. You can extend this union when adding new media types. */
export type EvidenceType = 'text' | 'image' | 'audio' | 'url'

/**
 * An evidence item captures raw user input. The content field is deliberately untyped because it may contain any
 * structure appropriate for the evidence type.
 */
export type EvidenceItem = {
    id: string
    type: EvidenceType
    content: unknown
}

/** Zod schema for EvidenceItem. This can be used to validate external inputs. */
export const EvidenceItemSchema = z.object({
    content: z.unknown(),
    id: z.string(),
    type: z.union([
        z.literal('text'),
        z.literal('image'),
        z.literal('audio'),
        z.literal('url'),
    ]),
})

/* Proposal types */

/** A proposal suggests a value for a record field along with metadata about its provenance. */
export type Proposal<T = unknown> = {
    field: string
    value: T
    confidence?: number
    evidenceIds: Array<string>
}

/* Patch types */

/** A single patch operation following the JSON Patch specification (RFC 6902). */
export type PatchOperation = {
    op: 'add' | 'remove' | 'replace'
    path: string
    value?: unknown
}

/** A Patch is an ordered array of operations that can be applied atomically to an object. */
export type Patch = Array<PatchOperation>

/* Utility functions */

/**
 * Apply a patch to an object, returning a new object with the changes applied. This does not mutate the input. Paths
 * use JSON Pointer notation (e.g. "/a/b/0").
 */
export function applyPatch<T>(data: T, patch: Patch): T {
    // Deep clone the data to avoid mutating the original. structuredClone is
    // preferred when available; fallback to JSON clone otherwise.
    const clone: any =
        typeof (globalThis as any).structuredClone === 'function'
            ? (globalThis as any).structuredClone(data)
            : JSON.parse(JSON.stringify(data))

    for (const op of patch) {
        const segments = op.path.split('/').slice(1).map(decodeURIComponent)
        let target: any = clone
        for (let i = 0; i < segments.length - 1; i++) {
            const key = segments[i]
            if (!(key in target)) {
                target[key] = {}
            }
            target = target[key]
        }
        const last = segments[segments.length - 1]
        switch (op.op) {
            case 'add':
            case 'replace':
                target[last] = op.value
                break
            case 'remove':
                if (Array.isArray(target)) {
                    target.splice(Number(last), 1)
                } else {
                    delete target[last]
                }
                break
        }
    }
    return clone as T
}

/**
 * Invert a patch by reversing the order of operations and swapping add/remove. Replace operations are inverted with
 * remove when no previous value is known. For a full implementation you would capture previous values when applying
 * patches.
 */
export function invertPatch(patch: Patch): Patch {
    return [...patch].reverse().map((op) => {
        if (op.op === 'add') {
            return { op: 'remove', path: op.path } as PatchOperation
        }
        if (op.op === 'remove') {
            return {
                op: 'add',
                path: op.path,
                value: op.value,
            } as PatchOperation
        }
        // For replace we cannot know the old value; treat as remove.
        return { op: 'remove', path: op.path } as PatchOperation
    })
}

/** Utility to get a value at a JSON pointer. Returns undefined if the path does not exist. */
export function getAtPath(obj: unknown, pointer: string): unknown {
    const segments = pointer.split('/').slice(1).map(decodeURIComponent)
    let target: any = obj
    for (const key of segments) {
        if (target == null) return undefined
        target = target[key]
    }
    return target
}

/** Utility to set a value at a JSON pointer on an object, mutating the object. Creates intermediate objects as needed. */
export function setAtPath(obj: any, pointer: string, value: unknown): void {
    const segments = pointer.split('/').slice(1).map(decodeURIComponent)
    let target: any = obj
    for (let i = 0; i < segments.length - 1; i++) {
        const key = segments[i]
        if (!(key in target) || typeof target[key] !== 'object') {
            target[key] = {}
        }
        target = target[key]
    }
    const last = segments[segments.length - 1]
    target[last] = value
}

/** Deterministic JSON stringify with stable key ordering. Useful for hashing. */
export function stableStringify(value: unknown): string {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const sorted: Record<string, unknown> = {}
        for (const key of Object.keys(value as any).sort()) {
            sorted[key] = (value as any)[key]
        }
        return JSON.stringify(sorted)
    }
    return JSON.stringify(value)
}
