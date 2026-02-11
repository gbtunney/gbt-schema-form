# STORE.md

## Operator Store — Persistence Contract (Types-First)

This document defines the **store contract** used by the Operator system. The store is a **functional DI
port**: a plain object of functions.

No classes.  
No `interface`.  
No `any`.  
`unknown` only at true boundaries.  
Zod 4–compatible.

The Operator UI depends **only** on this contract.

---

## Design goals

- Backend-agnostic (Drizzle, Prisma, REST, IndexedDB, memory)
- Schema-agnostic (JSON Schema at runtime)
- Domain-agnostic (equipment, pets, anything)
- Explicit persistence (no hidden writes)
- Patch-first history

---

## Mental model

The store manages **durable state only**.

It does **not**:

- run AI
- generate proposals
- interpret schemas
- manage UI state

It **does**:

1. Load/save record snapshots
2. Persist evidence + attachments
3. Persist patch history
4. Provide lists for navigation (tables)

---

## Shared primitives

```ts
export type RecordId = string
export type SchemaId = string

export type GroupId = string
export type ItemId = string
export type AttachmentId = string
export type PatchId = string
```

JSON values are always JSON-safe:

```ts
import { JsonValue } from '@operator/core/json'
```

---

## Record snapshot

A record is always a **schema + JSON document** pair.

```ts
export type RecordSnapshot = {
  recordId: RecordId
  schemaId: SchemaId
  data: JsonValue
}
```

The store does not validate `data` against the schema. Validation is handled by the UI / schema engine.

---

## Evidence models (from @operator/core)

The store persists these **as-is**:

- `EvidenceGroup`
- `EvidenceItem`
- `EvidenceAttachment`
- `AppliedPatch`

The store never mutates their meaning.

---

## Store contract

```ts
export type OperatorStore = {
  /* ==========================
     Records
     ========================== */

  loadRecord: (recordId: RecordId) => Promise<RecordSnapshot | null>

  saveRecord: (snapshot: RecordSnapshot) => Promise<void>

  listRecords: (args?: { schemaId?: SchemaId; search?: string; limit?: number; offset?: number }) => Promise<
    {
      recordId: RecordId
      schemaId: SchemaId
      summary?: string
      updatedAt: string
    }[]
  >

  /* ==========================
     Evidence Groups
     ========================== */

  listEvidenceGroups: (recordId: RecordId | null) => Promise<EvidenceGroup[]>

  upsertEvidenceGroup: (group: EvidenceGroup) => Promise<void>

  deleteEvidenceGroup?: (groupId: GroupId) => Promise<void>

  /* ==========================
     Evidence Items
     ========================== */

  listEvidenceItems: (groupId: GroupId) => Promise<EvidenceItem[]>

  upsertEvidenceItem: (item: EvidenceItem) => Promise<void>

  deleteEvidenceItem: (itemId: ItemId) => Promise<void>

  /* ==========================
     Attachments
     ========================== */

  listAttachments: (itemId: ItemId) => Promise<EvidenceAttachment[]>

  upsertAttachment: (attachment: EvidenceAttachment) => Promise<void>

  /* ==========================
     Patches (history)
     ========================== */

  listPatches: (recordId: RecordId) => Promise<AppliedPatch[]>

  appendPatch: (patch: AppliedPatch) => Promise<void>
}
```

All methods are **idempotent where possible**. Upserts are preferred to partial updates.

---

## Draft behavior

- `recordId = null` on `EvidenceGroup` means **draft**
- Draft evidence may exist before a record exists
- Draft groups can later be attached to a record

The store must support this flow.

---

## Transactions (important)

When applying a proposal in the UI:

1. UI computes a patch
2. UI updates in-memory `data`
3. UI calls:
   - `appendPatch(patch)`
   - `saveRecord(snapshot)`

Adapters **should** ensure atomicity where possible.

---

## What the store must NOT do

- No schema inference
- No AI calls
- No proposal dedupe
- No fuzzy matching
- No auto-merging patches

Those belong to:

- `@operator/core`
- `@operator/ui`
- `@operator/api`

---

## Adapter examples

Valid implementations include:

- Drizzle + Postgres
- Drizzle + SQLite
- REST-backed store
- IndexedDB (Dexie)
- In-memory (demo/testing)

All are interchangeable.

---

## Why this is DI (without classes)

The app provides the implementation:

```ts
const store: OperatorStore = createDrizzleStore(db);

<OperatorEditor store={store} />
```

The UI depends only on the _shape_, not the implementation.

---

## Invariants (must hold)

- `RecordSnapshot.data` is JSON-safe
- Patches always reference a `recordId`
- Evidence items never mutate records directly
- History is append-only

---

## Summary

The store is:

- boring by design
- explicit
- predictable
- replaceable

It is the persistence backbone, nothing more.
