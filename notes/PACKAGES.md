# PACKAGES.md

# Evidence-Driven Schema Operator — package split (non-negotiable)

The only thing that matters: `@operator/ui` must be embeddable.

Embeddable means:

- Core is pure functions + Zod v4 schemas.
- UI is React-only.
- Persistence is adapters.
- AI/derivations are behind an API boundary.

Hard rule:

> `@operator/ui` must not import Drizzle/Prisma/OpenAI/Express.

Harder rule:

> `@operator/core` is the only authority on data shapes and patch semantics.

Style rules (apply across operator packages):

- Zod v4-first.
- No `interface` keyword.
- No `any`.
- No classes.
- JSON-only values (must round-trip through `JSON.stringify`/`JSON.parse`).

---

## Monorepo Layout (pnpm workspaces)

```sh
packages/
operator-core/
operator-store/
operator-ui/
operator-adapter-drizzle/
operator-adapter-local/
operator-api/
domain-schemas/
apps/
operator-demo/
pet-tracking/
equipment-inventory/
```

---

## Dependency Rules (import graph)

Allowed imports:

- `operator-core` → (none)
- `operator-store` → `operator-core`
- `operator-ui` → `operator-core`, `operator-store`
- `operator-adapter-*` → `operator-core`, `operator-store` (and their own deps)
- `operator-api` → `operator-core` (optional), `domain-schemas` (optional)
- `domain-schemas` → (zod + schema generator deps only)
- `apps/*` → everything needed

Not allowed:

- `operator-ui` importing DB or OpenAI
- `operator-core` importing React
- `operator-core` importing Drizzle/Prisma

Also not allowed:

- `operator-ui` importing `zod` domain schemas directly (UI consumes JSON Schema at runtime)
- `operator-ui` defining its own patch format (patch semantics come from core)

---

# Packages

## 1) `@operator/core`

Pure TypeScript. Pure functions. Zod v4 schemas.

This package is the constitution. If something is “kind of like a patch” but doesn’t match core, it’s not a
patch.

Core invariants:

- Schemas first. Types come from schemas.
- Everything is JSON (`JsonValue`). No dates, no maps, no userland classes.
- Patch format is reversible by construction (undo is exact, not “best effort”).
- No RFC6902 in core. Not “maybe later”. Not “just for adapters”. Core has one patch format.

### Core types (actual exported model)

```ts
import { z } from 'zod'

export const IdSchema = z.string().min(1)
export const IsoDateTimeStringSchema = z.string().datetime()

export type JsonPrimitive = boolean | null | number | string
export type JsonObject = { [key: string]: JsonValue }
export type JsonValue = JsonObject | Array<JsonValue> | JsonPrimitive

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
    z.union([
        z.null(),
        z.boolean(),
        z.number(),
        z.string(),
        z.array(JsonValueSchema),
        z.record(z.string(), JsonValueSchema),
    ]),
)

export const JsonPointerSchema = z
    .string()
    .refine(
        (pointer) => pointer === '' || pointer.startsWith('/'),
        'JSON Pointer must be "" (root) or start with "/"',
    )

export const ValueRefSchema = z.union([
    z.object({ exists: z.literal(false) }),
    z.object({ exists: z.literal(true), value: JsonValueSchema }),
])

export const OperatorPatchOpSchema = z.object({
    op: z.literal('change'),
    path: JsonPointerSchema,
    before: ValueRefSchema,
    after: ValueRefSchema,
})

export const OperatorPatchSchema = z.array(OperatorPatchOpSchema)

export const RecordSnapshotSchema = z.object({
    recordId: IdSchema,
    schemaId: IdSchema,
    data: JsonValueSchema,
    updatedAt: IsoDateTimeStringSchema,
})

export const AttachmentSchema = z.object({
    id: IdSchema,
    storageKey: z.string().min(1),
    contentType: z.string().min(1),
    filename: z.string().min(1).optional(),
    byteSize: z.number().int().nonnegative().optional(),
    createdAt: IsoDateTimeStringSchema,
})

export const EvidenceOwnerSchema = z.union([
    z.object({ kind: z.literal('record'), recordId: IdSchema }),
    z.object({ kind: z.literal('global') }),
])

export const EvidenceGroupSchema = z.object({
    id: IdSchema,
    owner: EvidenceOwnerSchema,
    title: z.string().min(1),
    createdAt: IsoDateTimeStringSchema,
})

export const EvidenceItemSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('text'),
        id: IdSchema,
        groupId: IdSchema,
        createdAt: IsoDateTimeStringSchema,
        summary: z.string().min(1).optional(),
        text: z.string(),
    }),
    z.object({
        type: z.literal('url'),
        id: IdSchema,
        groupId: IdSchema,
        createdAt: IsoDateTimeStringSchema,
        summary: z.string().min(1).optional(),
        url: z.string().url(),
    }),
    z.object({
        type: z.literal('image'),
        id: IdSchema,
        groupId: IdSchema,
        createdAt: IsoDateTimeStringSchema,
        summary: z.string().min(1).optional(),
        attachmentId: IdSchema,
    }),
    z.object({
        type: z.literal('audio'),
        id: IdSchema,
        groupId: IdSchema,
        createdAt: IsoDateTimeStringSchema,
        summary: z.string().min(1).optional(),
        attachmentId: IdSchema,
    }),
    z.object({
        type: z.literal('pdf'),
        id: IdSchema,
        groupId: IdSchema,
        createdAt: IsoDateTimeStringSchema,
        summary: z.string().min(1).optional(),
        attachmentId: IdSchema,
    }),
])

export const ProposalSchema = z.object({
    id: IdSchema,
    createdAt: IsoDateTimeStringSchema,
    path: JsonPointerSchema,
    value: JsonValueSchema,
    confidence: z.number().min(0).max(1),
    evidenceItemIds: z.array(IdSchema),
    note: z.string().min(1).optional(),
})
```

### Patch semantics (this is the point)

- A patch is `OperatorPatch = Array<OperatorPatchOp>`.
- Each op is `{ op: 'change', path, before, after }`.
- Deletes are represented as `after: { exists: false }`.
- Setting/replacing a value is `after: { exists: true, value }`.
- Undo is `invertOperatorPatch(patch)`.

### Core functions (actual API)

- JSON pointer helpers: `escapeJsonPointerSegment`, `unescapeJsonPointerSegment`, `parseJsonPointer`,
  `formatJsonPointer`
- Pointer operations: `getAtJsonPointer`, `setAtJsonPointer`, `removeAtJsonPointer`
- Patch ops: `createChangeOp`, `applyOperatorPatch`, `invertOperatorPatch`
- Determinism: `stableStringify`

---

## 2) `@operator/store`

Contracts only. No implementations.

Rules:

- No `interface` keyword. Use `type` aliases.
- Keep it boring: small function signatures, JSON-ish inputs/outputs.
- This package is allowed to depend on `@operator/core` types.

Minimum contracts (shape):

```ts
export type OperatorStore = {
    loadRecord: (recordId: string) => Promise<unknown | undefined>
    saveRecord: (recordId: string, data: unknown, schemaId: string) => Promise<void>
    listRecords: (query?: unknown) => Promise<Array<unknown>>
}
```

This is intentionally vague at v0: `@operator/ui` gets a store via props, and the adapter decides what a
“record” is.

---

## 3) `@operator/ui`

React operator UI package.

Responsibilities:

- core component(s):
    - `<OperatorEditor />`
    - `<EvidencePane />`, `<ProposalsPane />`, `<FormPane />`
- hooks:
    - `useOperatorState(store, schemaResolver, recordId)`
- UI logic:
    - fuse-based proposal search/filter
    - hide already-entered proposals
    - “show hidden” toggles
    - proposal grouping by field
    - apply arrow → produce patch
    - undo/redo (in-memory; optionally backed by store)
- integration points:
    - accepts store + clients via props
    - feature flags

Must not depend on:

- Drizzle/Prisma
- Express
- OpenAI SDK

Must do:

- Only use core patch semantics (`OperatorPatch`).
- Treat JSON Schema as runtime input (domain Zod stays out of the UI runtime path).

---

## 4) `@operator/adapter-drizzle`

Concrete persistence adapter implementing `OperatorStore`.

Responsibilities:

- Drizzle schema tables (Postgres/SQLite)
- CRUD for EquipmentRecord/EvidenceGroup//Attachments/Patches
- transactions for applying patches and saving form data
- optionally: minimal indexing/projection table for grid view

This package is swappable.

---

## 5) `@operator/adapter-local`

Local storage adapter implementing `OperatorStore`.

Responsibilities:

- IndexedDB (Dexie) or in-memory store
- used for demos, playground, offline dev
- proves UI independence

---

## 6) `@operator/api`

Server-side API for AI + derivations.

Suggested tech:

- Express Zod API
- OpenAI (or other) model integration
- OCR/transcription/scrape helpers

Responsibilities:

- endpoints:
    - POST `/proposals/run` (Id + schemaId → proposals)
    - POST `/derive/ocr` (image attachment → derived text)
    - POST `/derive/transcribe` (audio stream/live → transcript)
    - POST `/derive/scrape` (url → extracted text)
    - POST `/uploads/sign` (signed upload URLs)
- auth + rate limiting
- prompt templates and model selection

Important:

- API does not have to share DB layer with UI.
- UI talks to API via a ProposalClient/DerivationClient.

---

## 7) `@domain/schemas`

Domain schemas live here, not in operator packages.

Responsibilities:

- Zod domain schemas (equipment, pet, etc.)
- JSON Schema generated artifacts (committed)
- schema registry/manifest:
    - list available schemaIds
    - metadata and display names
- optional: “index projection” rules for grid view

Example:

- `equipment.v1.ts` (Zod)
- `equipment.v1.schema.json` (generated)
- `manifest.json` (schema list)

---

# Contract shapes (minimum viable)

No interfaces. Only `type` aliases.

## OperatorStore

- Records: load/save/list.
- Evidence: groups + items.
- Attachments: metadata only (bytes are stored elsewhere).
- Patches: optional, but if you persist patches, persist reversible patches (before/after), not RFC6902.

## SchemaResolver

- `resolve(schemaId) -> { schemaId, jsonSchema, uiSchema? }`

## ProposalClient

- `runProposals({ evidenceItemId, schemaId, currentData? }) -> Proposal[]`

## DerivationClient

- `ocr(attachmentId) -> string`
- `transcribe(attachmentId) -> string`
- `scrape(url) -> string`
- `extractPdf(attachmentId) -> string`

---

# Notes

- Proposals are allowed to be ephemeral (regenerate anytime).
- Patches should be persistent if you want long-term undo + auditing.
- Keep attachments bytes out of DB; store metadata and a storageKey.

---

## Summary

This split keeps the operator:

- reusable
- backend-agnostic
- domain-agnostic
- friendly for demos and “paste schema” playground

While still letting you ship a real app with Drizzle + Express Zod API.
