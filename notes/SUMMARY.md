# SUMMARY.md

## What This Project Is

This project defines a **generic operator framework** for AI-assisted structured data entry.

It separates:

- evidence (raw inputs)
- proposals (AI suggestions)
- commits (human decisions)

The result is a workflow where AI assists without taking control.

---

## Key Ideas

- Evidence is not truth
- AI proposes, humans commit
- Every change is explicit
- Every value has provenance
- Undo is first-class

---

## What Makes It Different

Most AI tools:

- fill entire forms
- overwrite silently
- lose context

This system:

- works field-by-field
- requires human intent
- preserves receipts
- supports schema swapping

It behaves more like **version control for data** than autofill.

---

## Who This Is For

- developers building internal tools
- operators handling messy inputs
- systems needing traceability
- projects with evolving schemas

---

## Core Components

- Operator UI (Evidence | Proposals | Form)
- Schema Resolver
- Proposal Engine
- Patch History
- Storage Adapter

All loosely coupled.

---

## Reuse Story

The operator:

- is schema-agnostic
- is backend-agnostic
- is domain-agnostic

It can be embedded into:

- inventory systems
- pet tracking
- research extraction
- ops tooling

---

## Mental Model

Evidence → Proposals → Patches → Record

AI suggests.  
Humans commit.  
Every value has a receipt.
