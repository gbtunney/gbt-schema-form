import type { Id, JsonValue, Proposal, RecordSnapshot } from '@operator/core'

/**
 * Persistence + client contracts.
 *
 * This package defines types only.
 *
 * Rules:
 * - No `interface`, no `any`, no classes.
 * - JSON-only values: prefer `JsonValue` where possible.
 */

export type OperatorStore = {
    /** Load a record snapshot by ID. Return `undefined` if it does not exist. */
    loadRecord: (recordId: Id) => Promise<RecordSnapshot | undefined>

    /** Persist a record snapshot. */
    saveRecord: (snapshot: RecordSnapshot) => Promise<void>

    /** List record snapshots. Filtering is adapter-defined. */
    listRecords: (args?: { schemaId?: Id }) => Promise<Array<RecordSnapshot>>
}

export type SchemaResolver = {
    /** Resolve a JSON Schema bundle by ID. */
    resolve: (schemaId: Id) => Promise<{
        schemaId: Id
        jsonSchema: JsonValue
        uiSchema?: JsonValue
    }>
}

export type ProposalClient = {
    /** Generate proposals from evidence + current record state. */
    runProposals: (args: {
        evidenceItemId: Id
        schemaId: Id
        currentData?: JsonValue
    }) => Promise<Array<Proposal>>
}

export type DerivationClient = {
    /** Extract text from an image attachment. */
    ocr: (attachmentId: Id) => Promise<string>

    /** Transcribe an audio attachment. */
    transcribe: (attachmentId: Id) => Promise<string>

    /** Fetch and extract text content from a URL. */
    scrape: (url: string) => Promise<string>

    /** Extract text from a PDF attachment. */
    extractPdf: (attachmentId: Id) => Promise<string>
}
