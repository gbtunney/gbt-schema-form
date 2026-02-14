import { z } from 'zod'

/**
 * Zod schemas for ID types.
 * All IDs are non-empty strings.
 */

export const recordIdSchema = z.string().min(1)
export const schemaIdSchema = z.string().min(1)
export const evidenceGroupIdSchema = z.string().min(1)
export const evidenceItemIdSchema = z.string().min(1)
export const attachmentIdSchema = z.string().min(1)

export type RecordId = z.infer<typeof recordIdSchema>
export type SchemaId = z.infer<typeof schemaIdSchema>
export type EvidenceGroupId = z.infer<typeof evidenceGroupIdSchema>
export type EvidenceItemId = z.infer<typeof evidenceItemIdSchema>
export type AttachmentId = z.infer<typeof attachmentIdSchema>
