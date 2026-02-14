// packages/operator-store/src/ports.ts
import type { AppliedPatch } from '@operator/core'
import { z } from 'zod'

import {
    type EvidenceGroup,
    type EvidenceItem,
    evidenceItemSchema,
    type EvidenceOwner,
} from './evidence.js'
import { recordIdSchema, schemaIdSchema } from './ids.js'
import { type FieldProposal } from './proposal.js'
import { recordDocSchema } from './record.js'
import type { RecordDoc } from './record.js'

/**
 * JSON Schema payload for RJSF.
 * Keep boundary as unknown; UI/RJSF will interpret it.
 */
export type JsonSchema = unknown

/**
 * schemaId → jsonSchema
 * Resolver for loading JSON schemas by ID.
 */
export type SchemaResolver = (schemaId: string) => Promise<{
    schemaId: string
    jsonSchema: JsonSchema
}>

/**
 * Proposals: one evidence item → many field proposals
 * Request structure for generating AI proposals.
 */
export const proposalRequestSchema = z.object({
    evidenceItem: evidenceItemSchema,
    recordData: recordDocSchema.shape.data,
    recordId: recordIdSchema.optional(),
    schemaId: schemaIdSchema,
})

export type ProposalRequest = z.infer<typeof proposalRequestSchema>
export type ProposalClient = (request: ProposalRequest) => Promise<Array<FieldProposal>>

/**
 * Persistence port implemented by adapter-local / adapter-drizzle.
 * Plain TypeScript types for function contracts.
 * Zod schemas validate data structures only.
 */
export type OperatorStore = {
    records: {
        list?: () => Promise<Array<RecordDoc>>
        load: (recordId: string) => Promise<RecordDoc | null>
        save: (record: RecordDoc) => Promise<void>
    }

    evidenceGroups: {
        list: (owner: EvidenceOwner) => Promise<Array<EvidenceGroup>>
        create: (args: { owner: EvidenceOwner; title: string }) => Promise<EvidenceGroup>
    }

    evidenceItems: {
        list: (groupId: string) => Promise<Array<EvidenceItem>>
        create: (args: { groupId: string; title: string; text: string }) => Promise<EvidenceItem>
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
