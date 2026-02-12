# DIRECTIONS.md

## Goal

Build a **schema-driven operator editor** where AI proposes field values from evidence, and humans explicitly
commit changes with provenance and undo.

This document describes **behavior**, not implementation.

---

## Core Loop

1. User collects evidence (text, OCR, audio, URLs, PDFs)
2. Evidence becomes editable text blobs
3. AI generates proposals from a single evidence item
4. Proposals are compared against current form data
5. Only meaningful proposals are shown
6. User applies proposals via arrows
7. Each apply creates a patch
8. Patches are undoable and traceable

---

## Evidence Rules

- Evidence items are independent
- Each evidence item can run proposals alone
- Attachments generate or refresh evidence text
- Evidence may exist without a record (draft)

---

## Proposal Visibility Rules

- Exact match → hidden
- Normalized match → hidden
- Near-duplicate → collapsed
- Different value → visible with apply arrow
- Null form value → always visible

Similarity thresholds:

- ≥ 0.95 = same
- 0.85–0.95 = similar
- < 0.85 = different

---

## Proposal Lifecycle

- Proposals are ephemeral
- Regenerated at any time
- Never directly persisted
- Only applied patches are permanent

---

## Apply Behavior

Applying a proposal:

- updates formData at path
- records before/after
- optionally references evidenceItemId
- creates a patch entry

---

## Undo / Redo

Undo/redo operates on patches:

- undo reverts last patch
- redo reapplies patch
- manual edits also create patches

---

## UI Panes

### Evidence Pane

- list of evidence items
- attachments + derive buttons
- per-item proposal run

### Proposals Pane

- grouped by field
- searchable (Fuse)
- hidden/collapsed logic
- apply arrows

### Form Pane

- JSON Schema rendered
- live validation
- reflects applied patches

---

## Defaults

- autosave enabled
- hide already-applied proposals
- collapse similar proposals
- explicit apply required for all changes

---

## Non-Goals

- AI auto-writing records
- silent overwrites
- schema inference
