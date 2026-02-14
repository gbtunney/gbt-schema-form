# STORE.md

## Operator Store — Persistence Contract

This document defines the **store contract** used by the Operator system. The store is a **functional DI
port**: a plain object of functions.

**Implementation approach:**

- Domain models (Evidence, Record, Proposal) defined in `@operator/core` as TypeScript types
- Zod schemas in `@operator/store` validate data structures
- Store contract uses plain TypeScript function types
- No classes, no `interface`, no `any`
- `unknown` only at true boundaries
- Zod 4–compatible

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

All ID types are exported from `@operator/core`:

```ts
import type { RecordId, SchemaId, EvidenceGroupId, EvidenceItemId, AttachmentId } from '@operator/core'
```

Zod schemas for validation are in `@operator/store`:

```ts
import {
  RecordIdSchema,
  SchemaIdSchema,
  EvidenceGroupIdSchema,
  EvidenceItemIdSchema,
  AttachmentIdSchema,
} from '@operator/store'
```

JSON values are always JSON-safe:

```ts
import type { JsonValue } from '@operator/core'
```

---

## Record snapshot

A record is always a **schema + JSON document** pair.

Type from `@operator/core`:

```ts
import type { RecordSnapshot } from '@operator/core'

// RecordSnapshot = {
//   id: RecordId
//   schemaId: SchemaId
//   data: JsonValue
//   createdAt: string
//   updatedAt: string
// }
```

Zod schema from `@operator/store`:

```ts
import { RecordDocSchema } from '@operator/store'

// RecordDoc = same shape as RecordSnapshot, validated by Zod
```

The store does not validate `data` against the schema. Validation is handled by the UI / schema engine.

---

## Evidence models (from @operator/core)

All Evidence domain models are defined in `@operator/core`:

```ts
import type {
  EvidenceOwner, // { kind: 'record'; recordId } | { kind: 'draft' }
  EvidenceGroup,
  EvidenceItem,
  EvidenceAttachment,
} from '@operator/core'
```

Corresponding Zod schemas for validation are in `@operator/store`:

```ts
import { EvidenceOwnerSchema, EvidenceGroupSchema, EvidenceItemSchema } from '@operator/store'
```

The store persists these models as-is and never mutates their meaning.

---

## Store contract

```ts
import type { OperatorStore } from '@operator/store'

export type OperatorStore = {
  /* ==========================
     Records
     ========================== */

  records: {
    list?: () => Promise<RecordDoc[]>
    load: (recordId: string) => Promise<RecordDoc | null>
    save: (record: RecordDoc) => Promise<void>
  }

  /* ==========================
     Evidence Groups
     ========================== */

  evidenceGroups: {
    list: (owner: EvidenceOwner) => Promise<EvidenceGroup[]>
    create: (args: { owner: EvidenceOwner; title: string }) => Promise<EvidenceGroup>
  }

  /* ==========================
     Evidence Items
     ========================== */

  evidenceItems: {
    list: (groupId: string) => Promise<EvidenceItem[]>
    create: (args: { groupId: string; title: string; text: string }) => Promise<EvidenceItem>
    update?: (args: {
      id: string
      patch: Partial<Omit<EvidenceItem, 'id' | 'groupId' | 'createdAt'>>
    }) => Promise<EvidenceItem>
  }

  /* ==========================
     Patches (history)
     ========================== */

  patches: {
    list: (recordId: string) => Promise<AppliedPatch[]>
    append: (patch: AppliedPatch) => Promise<void>
  }
}
```

All methods return Promises. Create operations generate IDs and timestamps automatically.

---

## Draft behavior

- `owner: {kind: 'draft'}` on `EvidenceGroup` means **draft** (not attached to a record)
- `owner: {kind: 'record', recordId}` means attached to that record
- Draft evidence may exist before a record exists
- Draft groups can later be attached to a record by updating the owner

The store must support this flow.

---

## Transactions (important)

When applying a proposal in the UI:

1. UI computes a patch
2. UI updates in-memory `data`
3. UI calls:
   - `store.patches.append(patch)`
   - `store.records.save(snapshot)`

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
