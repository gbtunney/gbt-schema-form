# Evidence-Driven Schema Operator

AI-assisted structured data entry where **AI proposes** and **humans commit**.

This is a **schema-first operator editor** that turns messy inputs (OCR, audio, URLs, notes, PDFs) into clean
structured records with:

- **field-level proposals**
- **explicit apply arrows**
- **provenance (receipts)**
- **undo/redo via patches**
- **schema swapping** (JSON Schema)

> Git for structured data entry.

---

## Docs

- **SUMMARY**: `SUMMARY.md`
- **Directions / Spec**: `DIRECTIONS.md`
- **Schemas**: `SCHEMAS.md`
- **Packages**: `PACKAGES.md`
- **Use cases**: `USE_CASES.md`
- **Architecture**: `ARCHITECTURE.md`
- **Design brief**: `DESIGN.md`
- **Tech stack**: `TECH_STACK.md`
- **Nx decision**: `NX_DECISION.md`

---

## Mental Model

Evidence → Proposals → Patches → Record

AI suggests. Humans commit. Every value has a receipt.

---

## Core UI

- Evidence Pane: evidence items + attachments (OCR/Whisper/scrape)
- Proposals Pane: grouped suggestions + arrows
- Form Pane: JSON Schema form + validation + patch history

---

## Quick Start (concept)

1. Pick a schema (`schemaId`)
2. Create or open a record
3. Add evidence items
4. Generate proposals per evidence item
5. Apply proposals you trust
6. Undo/redo as needed

---

## Non-goals

- AI auto-writing records
- silent overwrites
- schema inference
