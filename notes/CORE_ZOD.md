# CORE_ZOD.md

# Core Zod Schemas — Operator (Types-First Review)

This doc defines the **core, reusable data types** for the operator system. These schemas are
**domain-agnostic** (not “equipment”, not “pets”).

Scope:

- Evidence (groups/items/attachments)
- Proposals (runs + field proposals)
- Patches (applied changes + provenance)

Non-goals:

- Domain record schema (that lives in `domain-schemas/*`)
- UI components
- DB tables (these types map cleanly to DB, but do not require one)

---

## Design conventions

### IDs and timestamps

- `id` is a string (uuid/ulid—host decides)
- `createdAt` / `updatedAt` are ISO strings

### Nullable vs optional

- `optional()` = field may not exist
- `nullable()` = field exists but can be `null` (often useful for “draft”)

### JSON values

- When we need arbitrary JSON (form data, before/after, proposal value), we use a JSON value schema.

---

## Shared primitives

```ts
import { z } from 'zod'

export const Id = z.string().min(1)
export const IsoDateTime = z.string().min(1) // keep simple; validate ISO later if you want

export const Confidence = z.enum(['High', 'Medium', 'Low'])

export const DeriveStatus = z.enum(['idle', 'running', 'done', 'error'])

export const PatchSource = z.enum(['proposal', 'manual', 'system']) // system = migrations/bulk ops
```

### JSON value (for valueJson/beforeJson/afterJson)

```ts
export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue }

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.null(),
    z.boolean(),
    z.number(),
    z.string(),
    z.array(JsonValueSchema),
    z.record(JsonValueSchema),
  ]),
)
```

---

# Evidence

Evidence is the **raw material**. It’s editable, persistent, and independent.

## EvidenceGroup

A bucket of evidence items.

- `recordId = null` means **draft group** not yet attached to a record.

```ts
export const EvidenceGroupSchema = z.object({
  id: Id,
  recordId: Id.nullable(), // null = draft/unattached
  title: z.string().min(1),
  status: z.enum(['draft', 'active', 'archived']).default('active'),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
})
export type EvidenceGroup = z.infer<typeof EvidenceGroupSchema>
```

## EvidenceItem

A titled **text blob**. Attachments can generate/refresh the text.

```ts
export const EvidenceItemSchema = z.object({
  id: Id,
  groupId: Id,

  title: z.string().min(1),
  text: z.string().default(''),

  pinned: z.boolean().default(false),
  selected: z.boolean().default(false),

  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
})
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>
```

## EvidenceAttachment

Attachments are sources that can produce derived text (OCR, transcript, scrape, etc.). They do **not** replace
EvidenceItem — they **feed** it.

Common fields:

- `derivedText` is stored per attachment so you can re-insert/append later
- `status` tracks derive job state

### Attachment union

```ts
const AttachmentBase = z.object({
  id: Id,
  itemId: Id,
  createdAt: IsoDateTime,

  status: DeriveStatus.default('idle'),
  derivedText: z.string().nullable().optional(), // derived output (if any)
})

export const ImageAttachmentSchema = AttachmentBase.extend({
  kind: z.literal('image'),
  storageKey: z.string().min(1), // points to object storage/local file
})

export const PdfAttachmentSchema = AttachmentBase.extend({
  kind: z.literal('pdf'),
  storageKey: z.string().min(1),
})

export const UrlAttachmentSchema = AttachmentBase.extend({
  kind: z.literal('url'),
  url: z.string().url(),
})

export const AudioLiveAttachmentSchema = AttachmentBase.extend({
  kind: z.literal('audio_live'),
  // live recording may not have a storageKey; host decides
  storageKey: z.string().min(1).nullable().optional(),
})

export const EvidenceAttachmentSchema = z.discriminatedUnion('kind', [
  ImageAttachmentSchema,
  PdfAttachmentSchema,
  UrlAttachmentSchema,
  AudioLiveAttachmentSchema,
])

export type EvidenceAttachment = z.infer<typeof EvidenceAttachmentSchema>
```

---

# Proposals

Proposals are **ephemeral**. They can be regenerated anytime.

## ProposalRun

A run ties an evidence item to a model/config.

```ts
export const ProposalRunSchema = z.object({
  id: Id,
  evidenceItemId: Id,
  createdAt: IsoDateTime,

  model: z.string().min(1),
  schemaId: z.string().min(1), // the domain schema used for inference
})
export type ProposalRun = z.infer<typeof ProposalRunSchema>
```

## FieldProposal

A proposal suggests a value for a JSON path.

Key fields:

- `path`: JSON pointer-ish or dot-path (pick one and standardize)
- `valueJson`: proposed value
- `excerpt`: optional supporting snippet
- `valid`: whether value passes domain validation

```ts
export const FieldProposalSchema = z.object({
  id: Id,
  runId: Id,

  path: z.string().min(1),
  valueJson: JsonValueSchema,

  confidence: Confidence,
  valid: z.boolean().default(true),

  excerpt: z.string().nullable().default(null),
})
export type FieldProposal = z.infer<typeof FieldProposalSchema>
```

---

# Patches (Undo/Redo + provenance)

Patches are **permanent history**. Undo/redo is patch replay.

## AppliedPatch

Represents one committed change.

Key fields:

- `recordId`: always present
- `path`: field path
- `beforeJson` / `afterJson`
- `source`: proposal/manual/system
- `evidenceItemId`: optional receipt pointer

```ts
export const AppliedPatchSchema = z.object({
  id: Id,
  recordId: Id,
  createdAt: IsoDateTime,

  path: z.string().min(1),
  beforeJson: JsonValueSchema,
  afterJson: JsonValueSchema,

  source: PatchSource.default('proposal'),
  evidenceItemId: Id.nullable().default(null),
})
export type AppliedPatch = z.infer<typeof AppliedPatchSchema>
```

---

# Optional: Provenance Reference (richer receipts)

If you want more than just `evidenceItemId`, add this later:

```ts
export const ProvenanceRefSchema = z.object({
  evidenceItemId: Id,
  attachmentId: Id.nullable().default(null),

  excerpt: z.string().nullable().default(null),
  // optional: offsets for highlighting in derived text
  start: z.number().int().nonnegative().nullable().default(null),
  end: z.number().int().nonnegative().nullable().default(null),
})
export type ProvenanceRef = z.infer<typeof ProvenanceRefSchema>
```

Then store `provenance: ProvenanceRefSchema.optional()` on `AppliedPatch` instead of only `evidenceItemId`.

---

# What you should confirm next (quick checklist)

1. **Path format**
   - dot path (`specs.flow_rate_lph`) vs JSON pointer (`/specs/flow_rate_lph`)

2. **Attachment strategy**
   - store derived text only on attachment vs also merging into EvidenceItem.text

3. **Patch storage**
   - persist all patches (recommended) vs keep only recent undo stack

4. **Provenance richness**
   - `evidenceItemId` only vs full `ProvenanceRef`

---

Next doc (when you’re ready):

- `UI_TYPES.md` (operator UI state + props shapes) — still type-first, minimal code.
