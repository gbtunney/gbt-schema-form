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

---

# Packages

## 1) `@operator/core`

Pure TypeScript logic + types.

Responsibilities:

- core types: Evidence, Attachments, Proposals, Patches
- Zod schemas for these core types (not your domain data)
- patch functions:
  - apply patch
  - invert patch
  - undo/redo helpers
- proposal helpers:
  - normalize values
  - equality/similarity checks
  - hide already-applied proposals
  - collapse similar proposals
  - dedupe/rank proposals
- utility: getAtPath / setAtPath, stable stringify, etc.

Must not depend on:

- React
- any database library
- OpenAI SDK

---

## 2) `@operator/store`

Contracts only: interfaces that make UI pluggable.

Responsibilities:

- `OperatorStore` interface (CRUD for records/evidence/patches/attachments)
- `SchemaResolver` interface (load schema by schemaId)
- `ProposalClient` interface (request proposal generation)
- `DerivationClient` interface (OCR/transcribe/scrape)

No implementations. No DB dependencies.

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
