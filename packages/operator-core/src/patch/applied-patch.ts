import type { JsonValue } from '../json/json-value.js'
import { setPointer } from '../pointer/pointer.js'

export type PatchSource = 'proposal' | 'manual' | 'system'

export type AppliedPatch = {
    id: string
    recordId: string
    createdAt: string
    path: string
    beforeJson: JsonValue
    afterJson: JsonValue
    source: PatchSource
    evidenceItemId?: string | null
}

export function makeAppliedPatch(
    args: Omit<AppliedPatch, 'id' | 'createdAt'> &
        Partial<Pick<AppliedPatch, 'id' | 'createdAt'>>,
): AppliedPatch {
    const id = args.id ?? crypto.randomUUID()
    const createdAt = args.createdAt ?? new Date().toISOString()

    return {
        ...args,
        createdAt,
        id,
    }
}

export function invertAppliedPatch(p: AppliedPatch): AppliedPatch {
    return {
        ...p,
        afterJson: p.beforeJson,
        beforeJson: p.afterJson,
        createdAt: new Date().toISOString(),
        id: crypto.randomUUID(),
    }
}

export function applyAppliedPatch(doc: JsonValue, p: AppliedPatch): JsonValue {
    return setPointer(doc, p.path, p.afterJson)
}
