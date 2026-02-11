# CORE_FLOW_SUMMARY.md

## The one sentence that matters

You are building a **JSON-document editor** with three inputs:

1. **Schema** (what fields exist)
2. **Record data** (current values)
3. **Evidence** (raw text blobs)

AI produces **proposals**, but the only durable change is a **patch**.

---

## The full lifecycle (end-to-end)

### A) Open editor page `/records/:id`

1. `store.loadRecord(recordId)` → `{ schemaId, data }`
2. `schemaResolver(schemaId)` → `{ jsonSchema }`
3. `store.listEvidenceGroups(recordId)` + `store.listEvidenceItems(groupId)` → evidence

UI now renders:

- RJSF form = `jsonSchema + data`
- evidence list
- proposals pane (empty)

---

### B) Generate proposals for one evidence item

1. User clicks **Generate proposals** on evidence item `E1`
2. UI calls: `proposalClient({ schemaId, evidenceItemId: E1, currentData: data })`
3. `proposalClient` returns `FieldProposal[]` (paths + values + excerpt/confidence)

UI then runs core helpers:

- normalize / compare vs current data
- hide **same**
- collapse **similar**
- dedupe

---

### C) Apply a proposal (the arrow)

When user clicks **Apply**:

1. Read current value  
   `before = getAtPath(data, proposal.path)`

2. Build patch  
   `{ recordId, path, beforeJson: before, afterJson: proposal.valueJson, source: "proposal", evidenceItemId: E1 }`

3. Update in-memory data  
   `data = setAtPath(data, proposal.path, proposal.valueJson)`

4. Persist
   - `store.appendPatch(patch)`
   - `store.saveRecord({ recordId, schemaId, data })`

That’s it.  
No magic. No hidden merges.

---

### D) Undo

1. UI picks last patch `P`
2. `data = setAtPath(data, P.path, P.beforeJson)`
3. `store.saveRecord(...)`
4. (optional) store an undo marker or append an inverse patch

---

## What goes where

### `@operator/core` (pure)

- `getAtPath / setAtPath`
- `normalizeValue(path, value)`
- `isEffectivelySame(a, b, path)`
- `isSimilar(a, b, path)`
- `makePatch(...)`, `invertPatch(patch)`
- `dedupeProposals(proposals, data)`

### `@operator/store` (types only)

- port types: `OperatorStore`, `SchemaResolver`, clients

### `@operator/ui` (wiring + state)

- calls store + clients
- uses core helpers
- owns UI state (filters, hidden toggles, expanded similar, etc.)

### adapters / api

- implementations only

---

## DI (in plain English)

DI here means: **the UI does not know how persistence works**.

You pass a function bundle:

```tsx
<OperatorEditor store={store} schemaResolver={schemaResolver} proposalClient={proposalClient} />
```

No classes.  
No interfaces.  
No container.

---

## Common “why isn’t this working” failures

### 1) Proposals don’t disappear after applying

**Cause:** comparing with `===` or not normalizing  
**Fix:** use canonical JSON utilities + per-field normalization

### 2) Undo feels wrong

**Cause:** `beforeJson` captured after mutation  
**Fix:** compute `before` first, then set

### 3) RJSF shows errors unexpectedly

**Cause:** schema mismatch or non-JSON-safe data  
**Fix:** type data as `JsonValue` and sanitize `undefined`

### 4) Temptation to auto-merge evidence

**Cause:** skipping the proposal step  
**Fix:** keep the flow:  
**evidence → proposals → patches**

---

## Reminder

All record changes go through:

- proposal evaluation
- patch creation
- explicit application

No silent writes.  
No implicit merges.
