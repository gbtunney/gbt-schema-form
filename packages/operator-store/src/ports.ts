// packages/operator-store/src/ports.ts
import type {
    AppliedPatch,
    EvidenceGroup,
    EvidenceItem,
    EvidenceOwner,
    FieldProposal,
    RecordDoc,
} from '@operator/core'
import {
    evidenceItemSchema,
    recordDocSchema,
    recordIdSchema,
    schemaIdSchema,
} from '@operator/core'
import { z } from 'zod'

/** JSON Schema payload for RJSF. Keep boundary as unknown; UI/RJSF will interpret it. */
export type JsonSchema = unknown

/** SchemaId → jsonSchema Resolver for loading JSON schemas by ID. */
export type SchemaResolver = (schemaId: string) => Promise<{
    schemaId: string
    jsonSchema: JsonSchema
}>

/** Proposals: one evidence item → many field proposals Request structure for generating AI proposals. */
export const proposalRequestSchema = z.object({
    evidenceItem: evidenceItemSchema,
    /**
     * The resolved JSON Schema for this record. When provided, the proposal service uses it to enumerate valid field
     * paths in the prompt — this significantly improves accuracy and prevents hallucinated paths. The UI should always
     * pass this; it already has the schema in hand.
     */
    jsonSchema: z.unknown().optional(),
    recordData: recordDocSchema.shape.data,
    recordId: recordIdSchema.optional(),
    schemaId: schemaIdSchema,
})

export type ProposalRequest = z.infer<typeof proposalRequestSchema>
export type ProposalClient = (
    request: ProposalRequest,
) => Promise<Array<FieldProposal>>

/**
 * Persistence port implemented by adapter-local / adapter-drizzle. Plain TypeScript types for function contracts. Zod
 * schemas validate data structures only.
 */
export type OperatorStore = {
    records: {
        list?: () => Promise<Array<RecordDoc>>
        load: (recordId: string) => Promise<RecordDoc | null>
        save: (record: RecordDoc) => Promise<void>
    }

    evidenceGroups: {
        list: (owner: EvidenceOwner) => Promise<Array<EvidenceGroup>>
        create: (args: {
            owner: EvidenceOwner
            title: string
        }) => Promise<EvidenceGroup>
    }

    evidenceItems: {
        list: (groupId: string) => Promise<Array<EvidenceItem>>
        create: (args: {
            groupId: string
            title: string
            text: string
        }) => Promise<EvidenceItem>
        update?: (args: {
            id: string
            patch: Partial<Omit<EvidenceItem, 'id' | 'groupId' | 'createdAt'>>
        }) => Promise<EvidenceItem>
    }

    patches: {
        list: (recordId: string) => Promise<Array<AppliedPatch>>
        append: (patch: AppliedPatch) => Promise<void>
    }
}
