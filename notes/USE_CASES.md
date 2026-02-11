# USE_CASES.md

# Evidence-Driven Schema Editor — Use Cases

This project is a **generic operator component + persistence model** for turning messy, real-world inputs into
clean structured records using AI — while keeping humans in control.

It’s not “an app.”  
It’s an **editor + workflow pattern** that can be embedded into many projects.

Think of it as:

> A schema-driven editor where AI proposes field values from evidence, and humans selectively commit changes.

Or:

> Git for structured data entry.

---

## Core Pattern (Applies Everywhere)

Every use case follows the same loop:

1. Collect messy inputs (text, images, audio, URLs, PDFs)
2. Convert them into **Evidence Items** (editable text blobs)
3. Run AI to generate **Field Proposals**
4. Human reviews proposals
5. Human applies chosen values
6. System records provenance + undoable patches
7. Structured record is saved

AI assists. Humans decide.

---

## Why This Exists

Most tools jump directly from:

Input → AI → Saved Record

This causes:

- Silent overwrites
- Lost context
- No traceability
- No partial acceptance
- No trust

This system inserts an explicit human checkpoint:

Input → Evidence → Proposals → Human Commit → Record

Every value has a receipt.

---

# Example Use Cases

These are examples — the component itself is generic.

---

## 🐟 Equipment Inventory

### Inputs

- Photos of product labels
- Manuals (PDF)
- Craigslist / marketplace listings
- Voice notes
- Web pages

### Workflow

1. Upload photo of pump label → OCR fills evidence text
2. Paste listing description
3. Record quick audio note (“got this used, seems quiet”)
4. AI proposes:
   - brand
   - model
   - specs
   - purchase source
5. You apply only what looks correct
6. Provenance is stored per field

Result: clean inventory records with source traceability.

---

## 🐾 Pet Tracking App (health + equipment + events)

### Inputs

- Photos of medication bottles
- Vet visit summaries (PDF or text)
- Voice notes about behavior
- Tank/enclosure equipment info
- Feeding logs
- Web links to care instructions

### Workflow

1. Upload vet paperwork → OCR creates evidence text
2. Add photo of medication bottle
3. Record voice note (“ate less today, hiding”)
4. AI proposes:
   - pet name
   - species
   - treatment
   - dosage
   - dates
   - equipment used
   - observations
5. You selectively apply fields
6. Evidence stays attached to every data point

Result: structured pet records with medical + care history that always link back to sources.

This is especially useful when data comes from many places over time.

---

## 🔬 Research / Data Extraction

### Inputs

- Scientific papers (PDF)
- Highlighted paragraphs
- Tables

### Workflow

1. Upload paper
2. OCR extracts text into evidence
3. AI proposes:
   - title
   - authors
   - sample size
   - conclusions
4. Researcher confirms fields manually

Result: structured datasets with citation provenance.

---

## 🏥 Intake / Operations

### Inputs

- Photos
- Voice notes
- Emails
- Forms

### Workflow

1. Staff records audio or uploads photos
2. AI proposes structured intake fields
3. Operator validates per field
4. System saves with audit trail

Result: faster intake without losing accountability.

---

## 🏗 Asset / Facility Tracking

### Inputs

- Equipment photos
- Location notes
- Maintenance PDFs
- Spoken updates

### Workflow

1. Upload image of asset tag
2. OCR extracts ID
3. Voice note adds context
4. AI proposes:

- asset id
- location
- condition
- service date

Operator commits verified fields.

---

## What Makes This Different

Traditional tools:

- AI fills everything
- Human fixes mistakes

This system:

- AI suggests
- Human commits
- Every field is traceable
- Every change is undoable

It’s designed for **messy reality**, not clean forms.

---

## Philosophy

AI suggests.  
Humans commit.  
Every value has a receipt.
