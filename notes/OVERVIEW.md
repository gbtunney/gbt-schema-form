# OVERVIEW.md

## What this is

A **generic operator framework** for AI-assisted structured data entry. It separates evidence (raw inputs),
proposals (AI suggestions), and patches (human commits). AI assists without taking control.

The mental model: **Evidence → Proposals → Patches → Record**

This behaves more like version control for data entry than autofill.

---

## The core loop

1. User collects evidence (text, OCR, audio, URLs, PDFs)
2. Evidence becomes editable text blobs
3. AI generates proposals from a single evidence item
4. Proposals are compared against current form data — exact/normalized matches hidden
5. User applies proposals via arrows
6. Each apply creates a patch with before/after + provenance
7. Patches are undoable and traceable

---

## Data flow

```txt
Unstructured inputs
  → Evidence Items (titled text blobs)
    → Proposal Engine (LLM + validators)
      → Field Proposals (per-field suggestions)
        → Operator UI (Evidence | Proposals | Form)
          → Patch (applied by human)
            → Record (Zod truth) + Provenance (evidence refs) + History (undo/redo)
```

---

## UI layout

Three panes:

- **Evidence Pane** — groups, items, attachments, voice recording, derive buttons
- **Proposals Pane** — per-item proposals, apply arrows, hidden/collapsed logic, Fuse search
- **Form Pane** — RJSF form, live validation, reflects applied patches

Two-pane mode (Evidence + Form) when no `proposalClient` is provided.

---

## Proposal visibility rules

- Exact match → hidden
- Normalized match → hidden
- Near-duplicate → collapsed
- Different value → visible with apply arrow
- Null form value → always visible

Thresholds: ≥ 0.95 = same, 0.85–0.95 = similar, < 0.85 = different

---

## Apply behavior

Applying a proposal:

1. reads `before = getAtPath(data, path)`
2. builds a patch `{ recordId, path, beforeJson, afterJson, source: "proposal", evidenceItemId }`
3. updates in-memory data via `setAtPath`
4. persists: `store.patches.append(patch)` then `store.records.save(record)`
5. re-runs proposal visibility (hides newly-applied proposals)

Data changes **only through patches**. No silent writes.

---

## Undo / redo

- Undo: take last patch, `setAtPath(data, p.path, p.beforeJson)`, save record
- Redo: reapply patch, `setAtPath(data, p.path, p.afterJson)`, save record
- Manual form edits also produce patches (on blur)

---

## Design principles

1. Human intent required for every field change
2. Field-level suggestions, not whole-form fill
3. No silent overwrites
4. Every value has a receipt (provenance)
5. Undo is first-class
6. Schemas are swappable at runtime
7. Backend is pluggable (port/adapter pattern)

---

## Who it's for

- Developers building internal tools
- Operators handling messy, multi-source inputs
- Systems needing traceability (audits, compliance)
- Projects with evolving or multiple schemas

---

## Non-goals

- AI auto-writing records without review
- Schema inference
- Silent overwrites of any kind
