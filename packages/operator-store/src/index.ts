// Operator store interfaces for persistence and client abstraction.

export type OperatorStore = {
    /** Load a record by its ID. Implementations should return undefined if the record does not exist. */
    loadRecord: (recordId: string) => Promise<unknown | undefined>

    /** Persist a record. Implementations may choose how to store the data. */
    saveRecord: (
        recordId: string,
        data: unknown,
        schemaId: string,
    ) => Promise<void>

    /** List records available to the user. Filtering is optional. */
    listRecords: (query?: unknown) => Promise<Array<unknown>>
}

export type SchemaResolver = {
    /** Resolve a schema by its ID. */
    resolve: (
        schemaId: string,
    ) => Promise<{ schemaId: string; jsonSchema: unknown; uiSchema?: unknown }>
}

export type ProposalClient = {
    /** Run proposal generation on an evidence item. Optionally provide currentData. */
    runProposals: (args: {
        evidenceItemId: string
        schemaId: string
        currentData?: unknown
    }) => Promise<Array<unknown>>
}

export type DerivationClient = {
    ocr: (attachmentId: string) => Promise<string>
    transcribe: (attachmentId: string) => Promise<string>
    scrape: (url: string) => Promise<string>
    extractPdf: (attachmentId: string) => Promise<string>
}
