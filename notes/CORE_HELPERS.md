# CORE_HELPERS.md

## Purpose

This document specifies the **pure helper functions** in `@operator/core`. These helpers contain _all non-UI
logic_ for comparing, normalizing, patching, and preparing proposals.

They are:

- pure functions
- deterministic
- side-effect free
- reusable across UI, tests, and adapters

No classes. No interfaces. No `any`.

---

## Path helpers

### `getAtPath`

```ts
getAtPath(data: JsonValue, path: string): JsonValue | undefined
```

- Reads a value from a JSON document
- Path format must be consistent (choose one):
  - dot path: `specs.flow_rate_lph`
  - OR JSON pointer: `/specs/flow_rate_lph`
- Returns `undefined` if path does not exist

Used by:

- proposal comparison
- patch creation
- undo logic

---

### `setAtPath`

```ts
setAtPath(data: JsonValue, path: string, value: JsonValue): JsonValue
```

- Returns a **new JSON document**
- Never mutates input
- Creates missing objects as needed
- Removes key if value is `null` (policy choice; document it)

Used by:

- apply proposal
- undo / redo
- manual edits

---

## Normalization helpers

### `normalizeForPath`

```ts
normalizeForPath(path: string, value: JsonValue): JsonValue
```

Purpose:

- reduce false differences

Examples:

- trim strings
- normalize casing
- coerce numeric strings → numbers (path-specific)
- collapse empty strings → null

Normalization rules may vary **by path**.

---

## Comparison helpers

### `isEffectivelySame`

```ts
isEffectivelySame(path: string, a: JsonValue, b: JsonValue): boolean
```

Returns `true` if:

- values are semantically equal
- even if structurally different (e.g. "1000" vs 1000)

Must:

- normalize both sides
- compare using canonical JSON equality (stable stringify)

Used to:

- hide proposals
- prevent no-op patches

---

### `isSimilar`

```ts
isSimilar(path: string, a: JsonValue, b: JsonValue): boolean
```

Returns `true` if:

- values are close enough to collapse
- but not equal

Examples:

- string edit distance
- numeric tolerance
- enum aliasing

Used to:

- collapse proposals
- reduce visual noise

---

## Proposal helpers

### `prepareProposals`

```ts
prepareProposals(args: {
  proposals: FieldProposal[];
  currentData: JsonValue;
}): ProposalViewModel[]
```

Responsibilities:

- attach current value (`beforeJson`) to each proposal
- mark proposal as:
  - same
  - similar
  - new
  - invalid
- hide proposals already applied
- group similar proposals
- sort by confidence

This is the **only place** proposal visibility rules live.

---

## Patch helpers

### `makePatch`

```ts
makePatch(args: {
  recordId: RecordId;
  path: string;
  beforeJson: JsonValue;
  afterJson: JsonValue;
  source: "proposal" | "manual" | "system";
  evidenceItemId?: string | null;
}): AppliedPatch
```

Rules:

- `beforeJson` must be captured **before** mutation
- `afterJson` must be normalized
- never create patch if `isEffectivelySame` is true

---

### `invertPatch`

```ts
invertPatch(patch: AppliedPatch): AppliedPatch
```

- swaps `beforeJson` and `afterJson`
- used for undo / redo
- keeps provenance intact

---

## Invariants

- helpers never mutate inputs
- helpers never access storage
- helpers never call AI
- helpers never depend on UI state

---

## Summary

If something feels inconsistent:

- look here first

This file defines the **truth of behavior**.
