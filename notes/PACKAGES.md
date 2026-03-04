# PACKAGES.md

# Package Split for Evidence-Driven Schema Operator

Goal: keep the **operator UI** reusable and easy to embed into other projects by isolating:

- pure logic (no React, no DB)
- UI (React only)
- persistence adapters (DB/local)
- server-side AI/derivations (Express + OpenAI + OCR)

Key rule:

> `@operator/ui` must not import Drizzle/Prisma/OpenAI/Express.

---

## Monorepo Layout (pnpm workspaces)

```sh
packages/
operator-core/
operator-store/
operator-ui/
operator-adapter-drizzle/
operator-adapter-local/
operator-api-server/
domain-schemas/
apps/
operator-demo/
pet-tracking/
equipment-inventory/
```

---

## Dependency Rules (import graph)

```sh
operator-core (zod only)
    ↓
operator-store (types from core)
    ↓
operator-ui + operator-adapter-* (implement ports)
```

Allowed imports:

- `operator-core` → `zod` only (no React, no DB, no OpenAI)
- `operator-store` → `operator-core` (types only, no runtime deps)
- `operator-ui` → `operator-core` (schemas/types), `operator-store` (ports)
- `operator-adapter-*` → `operator-core` (schemas/types), `operator-store` (ports), DB libs
- `operator-api-server` → `operator-core` (schemas), `domain-schemas` (optional)
- `domain-schemas` → `zod` + schema generator deps only
- `apps/*` → everything needed

Not allowed:

- `operator-ui` importing DB or OpenAI
- `operator-core` importing React, Drizzle, Prisma, or any DB lib
- `operator-store` importing Zod schemas (imports types from core instead)

---

# Packages

## 1) `@operator/core`

Pure business logic + data models (no React, no DB, no AI).

Responsibilities:

- **Zod schemas** (single source of truth):
  - Evidence models: `EvidenceGroupSchema`, `EvidenceItemSchema`, `EvidenceAttachmentSchema`,
    `EvidenceOwnerSchema`
  - Record model: `RecordSnapshotSchema`
  - Proposal model: `FieldProposalSchema`
  - Patch model: `AppliedPatchSchema`
  - ID schemas: `RecordIdSchema`, `SchemaIdSchema`, `EvidenceGroupIdSchema`, `EvidenceItemIdSchema`,
    `AttachmentIdSchema`
  - JSON type: `JsonValueSchema`
- **TypeScript types** (inferred from Zod):
  - `EvidenceGroup = z.infer<typeof EvidenceGroupSchema>`
  - `RecordSnapshot = z.infer<typeof RecordSnapshotSchema>`
  - etc.
- **Pure functions**:
  - patch functions: apply, invert, make patch (with auto-generated ID/timestamp)
  - JSON Pointer utilities: `getPointer`, `setPointer`
  - equality/normalization helpers: `jsonEquals`, `isEffectivelySame`, `normalizePointerValue`

**Architecture:**

- Schemas define types (via inference)
- Zero type duplication
- Validation happens at boundaries (adapters, UI inputs)
- Core exports both schemas and types

Must not depend on:

- React
- any database library
- OpenAI SDK

Dependencies: `zod` only

---

## 2) `@operator/store`

Persistence contracts (DI ports) - implementations live in adapters.

Responsibilities:

- **Port interfaces** (TypeScript function types):
  - `OperatorStore` - persistence contract for records/evidence/patches
  - `SchemaResolver` - load JSON schema by schemaId
  - `ProposalClient` - request AI proposal generation
  - `DerivationClient` - OCR, transcription, scraping
- **No implementations** - pure contracts only
- **No schemas** - imports types/schemas from `@operator/core`

**Architecture:**

- Imports types from `@operator/core`
- Defines function signatures only (plain TS types)
- No Zod schemas (those live in core)
- No runtime behavior
- DI pattern: UI depends on ports, not concrete implementations

Example:

```ts
import type { EvidenceGroup, RecordSnapshot } from '@operator/core'

export type OperatorStore = {
  loadRecord: (id: string) => Promise<RecordSnapshot | null>
  listEvidenceGroups: (recordId: string | null) => Promise<EvidenceGroup[]>
  // ...
}
```

Dependencies: `@operator/core` (types only)

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

---

## 4) `@operator/adapter-drizzle`

Concrete persistence adapter implementing `OperatorStore` port.

Responsibilities:

- Drizzle schema tables (Postgres/SQLite)
- CRUD for Record/EvidenceGroup/Items/Attachments/Patches
- transactions for applying patches and saving form data
- optionally: minimal indexing/projection table for grid view
- **Validation**: uses Zod schemas from `@operator/core` at boundaries

**Architecture:**

- Implements `OperatorStore` interface from `@operator/store`
- Imports schemas from `@operator/core` for validation
- DB schema separate from domain schemas

This package is swappable.

Dependencies: `@operator/core`, `@operator/store`, `drizzle-orm`

---

## 5) `@operator/adapter-local`

Local/mock persistence adapter implementing `OperatorStore` port.

Responsibilities:

- IndexedDB (Dexie) or in-memory store
- used for demos, playground, offline dev
- proves UI independence from backend
- **Validation**: uses Zod schemas from `@operator/core` at boundaries

**Architecture:**

- Implements `OperatorStore` interface from `@operator/store`
- Imports schemas from `@operator/core` for validation
- Can be purely in-memory for testing

Dependencies: `@operator/core`, `@operator/store`, `dexie` (optional)

---

## 6) `@operator/api-server`

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

# Interfaces (minimum viable)

## OperatorStore

The editor should only need this shape (add methods later as needed):

- records:
  - loadRecord(recordId)
  - saveRecord(recordId, data, schemaId)
  - listRecords(query/filter) (for grid view)

- evidence:
  - listEvidenceGroups(recordId|null)
  - upsertEvidenceGroup(group)
  - lists(groupId)
  - upsert(item)
  - delete(id)

- attachments:
  - createAttachment(args)
  - updateAttachment(args)

- patches (optional):
  - listPatches(recordId)
  - appendPatch(recordId, patch)

---

## SchemaResolver

- resolve(schemaId) → { schemaId, jsonSchema, uiSchema? }

---

## ProposalClient

- runProposals({ Id, schemaId, currentData? }) → proposals[]

---

## DerivationClient

- ocr(attachmentId) → derivedText
- transcribe(attachmentId) → transcriptText
- scrape(url) → scrapedText
- extractPdf(attachmentId) → extractedText

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
