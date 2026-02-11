# WALKTHROUGH.md

This is a **literal wiring guide** for the Operator system. It’s written as a sequence of calls and state
transitions so you can implement it without guessing.

Scope:

- open record → render panes
- generate proposals (per evidence item)
- apply arrow → patch + save
- manual edits → patch + save
- undo/redo
- drafts → attach to record

Assumptions:

- UI uses RJSF + AJV for form rendering/validation
- JSON values are `JsonValue` (JSON-safe)
- Store is the persistence port (`STORE.md`)
- Core helpers live in `@operator/core`

---

## 0) Core modules you will call

From `@operator/core` you will repeatedly call:

- `getAtPath(data, path) -> JsonValue | undefined`
- `setAtPath(data, path, value) -> JsonValue`
- `normalizeForPath(path, value) -> JsonValue`
- `isEffectivelySame(path, a, b) -> boolean`
- `isSimilar(path, a, b) -> boolean`
- `makePatch({ recordId, path, beforeJson, afterJson, source, evidenceItemId? }) -> AppliedPatch`
- `invertPatch(patch) -> AppliedPatch` (optional)
- `prepareProposals({ proposals, currentData }) -> ProposalViewModel[]`
  - handles: dedupe + hide-same + collapse-similar

---

## 1) Route: Open editor page `/records/:recordId`

### 1.1 Load record snapshot

Call:

- `store.loadRecord(recordId)` → `RecordSnapshot | null`

If null:

- render “Not found”

Else you have:

- `schemaId`
- `data` (JsonValue)

### 1.2 Load schema

Call:

- `schemaResolver(schemaId)` → `{ jsonSchema, uiSchema? }`

The editor does not need Zod at runtime. Zod is authoring; JSON Schema is runtime.

### 1.3 Load evidence for the record

Call:

- `store.listEvidenceGroups(recordId)` → `EvidenceGroup[]`

For each group:

- `store.listEvidenceItems(group.id)` → `EvidenceItem[]`
- for each item: `store.listAttachments(item.id)` → `EvidenceAttachment[]`

### 1.4 Render panes

You now render:

- Evidence Pane: groups/items/attachments
- Form Pane: RJSF form with `jsonSchema` + `data`
- Proposals Pane: empty until runs

---

## 2) Action: Create evidence group / item

### 2.1 Create group (record-attached)

UI constructs `EvidenceGroup` and calls:

- `store.upsertEvidenceGroup(group)`

### 2.2 Create item

UI constructs `EvidenceItem` and calls:

- `store.upsertEvidenceItem(item)`

Note:

- Evidence can exist without proposals.
- Evidence is always editable.

---

## 3) Action: Add attachment and derive text

### 3.1 Create attachment metadata

- user uploads image/pdf or enters url or starts audio recording
- UI creates an attachment object and calls:

`store.upsertAttachment(attachment)`

### 3.2 Derive text

UI calls derive client (not the store):

- `derivationClient.ocr(attachmentId)`
- `derivationClient.transcribe(attachmentId)`
- `derivationClient.scrape(url)`
- `derivationClient.extractPdf(attachmentId)`

After derived text returns:

1. update attachment:
   - `attachment.derivedText = derived`
   - `attachment.status = "done"`
   - `store.upsertAttachment(attachment)`

2. update evidence item text (policy decision):
   - append derived text into `EvidenceItem.text` (common default)
   - `store.upsertEvidenceItem(updatedItem)`

This keeps derived text as a receipt while also feeding the editable blob.

---

## 4) Action: Run proposals for ONE evidence item

Important:

- proposals are per evidence item
- proposals are ephemeral
- do not persist proposals unless you choose to cache runs

### 4.1 Call proposal client

UI calls:

`proposalClient({   schemaId,   evidenceItemId: item.id,   currentData: data }) -> FieldProposal[]`

### 4.2 Validate proposal shapes (optional but recommended)

Use `@operator/core` Zod schemas for proposal shapes. Reject any invalid proposal payload.

### 4.3 Compute view model (hide/collapse)

UI calls:

`prepareProposals({ proposals, currentData: data }) -> ProposalVM[]`

ProposalVM should include:

- `visible` (hide already-applied)
- `collapsed` (similar bucket)
- `showApply` (only if would change data)
- `status: same|similar|new|invalid|conflict`

Now render the proposals pane for that evidence item.

---

## 5) Action: Apply proposal arrow

This is the core invariant:

- applying a proposal creates an **AppliedPatch**
- data changes only through patches

Given proposal `{ path, valueJson }`:

### 5.1 Read before value

`before = getAtPath(data, path)`

### 5.2 Normalize both sides (optional but recommended)

`after = normalizeForPath(path, valueJson)`

### 5.3 Skip if same (safety)

If `isEffectivelySame(path, before, after)`:

- do nothing
- mark proposal as “already applied”

### 5.4 Create patch

`patch = makePatch({   recordId,   path,   beforeJson: before ?? null,   afterJson: after,   source: "proposal",   evidenceItemId: item.id, })`

### 5.5 Update in-memory data

`data = setAtPath(data, path, after)`

### 5.6 Persist (atomic if possible)

Call in order:

1. `store.appendPatch(patch)`
2. `store.saveRecord({ recordId, schemaId, data })`

Adapters should do this transactionally if they can.

### 5.7 Refresh proposal visibility

Re-run:

`prepareProposals({ proposals, currentData: data })`

This hides proposals that are now applied.

---

## 6) Action: Manual edit in the form

Manual edits should also be patch-tracked.

Two patterns:

### Pattern A (simple): patch on blur

- when a field changes, compare previous vs next
- on blur/commit, create patch and save

### Pattern B (strict): patch on every change

- noisier history but very consistent

Recommended:

- patch on blur / explicit “commit” for manual edits

### Implementation outline

1. UI receives `nextData` from RJSF change event
2. compute diff paths you care about (usually just the edited path)
3. create patch(s) for changed fields
4. append patch(s) + saveRecord(snapshot)

If you don’t have path-level info from RJSF, you can:

- keep previous snapshot
- compute a shallow diff for top-level keys at first
- improve later

---

## 7) Undo / Redo

Patches are the source of truth for history.

### Undo (basic)

1. load patches:
   - `patches = await store.listPatches(recordId)`
2. take last patch `p`
3. apply inverse to data:
   - `data = setAtPath(data, p.path, p.beforeJson)`
4. persist:
   - `store.saveRecord({ recordId, schemaId, data })`

To support redo, you need an explicit undo stack. Two common ways:

- maintain redo stack in UI state (v1 acceptable)
- persist undo/redo markers (later)

### Redo (basic)

- reapply patch:
  - `data = setAtPath(data, p.path, p.afterJson)`
  - `saveRecord(...)`

---

## 8) Draft evidence groups (recordId = null)

Draft groups let you collect evidence before you know what record it belongs to.

### Create draft group

- `recordId: null` on group
- `store.upsertEvidenceGroup(group)`

### Attach draft to record

When user clicks “Attach to record”:

- update group:
  - `group.recordId = recordId`
  - `store.upsertEvidenceGroup(group)`

Now the evidence appears under that record.

---

## 9) DataGrid / record picker flow

### Table page `/records`

- `store.listRecords({ search, schemaId, ... })`
- render MUI DataGrid rows
- click row → navigate to `/records/:recordId`

The grid should use a projection:

- recordId
- schemaId
- summary (name/brand/model)
- updatedAt

Do not load full record JSON for the grid.

---

## 10) “If you’re stuck” debugging checklist

- Proposals don’t hide:
  - confirm you re-run `prepareProposals` after applying
  - confirm `isEffectivelySame` uses normalization + JSON equality

- Undo incorrect:
  - confirm `before` captured before mutation
  - confirm setAtPath writes correct JSON values

- Form validation weird:
  - confirm JSON schema aligns with record schemaId
  - confirm data is JSON-safe (no undefined)

- “Feels like it’s not DI”:
  - check `@operator/ui` imports only ports + core helpers
  - store/api implementations live outside

---

## Summary

Implement in this exact order:

1. store + schema resolver wired on editor page
2. evidence CRUD
3. proposals per evidence item
4. apply arrow → patch + save
5. undo/redo (UI-local first)
6. derivations and attachments
7. real persistence adapters
