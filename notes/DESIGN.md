# DESIGN.md

# Design Brief — Evidence-Driven Schema Operator

## Problem

Real-world data entry is messy:

- conflicting sources
- partial inputs
- scanned labels and manuals
- voice notes
- web listings

Most AI form-fill systems go straight from: Input → AI → Saved Record

This loses:

- trust
- provenance
- control
- debuggability

---

## Core Idea

Treat unstructured inputs as **evidence**, not truth.

- Evidence produces proposals.
- Humans apply proposals deliberately.
- Every applied value keeps a receipt.
- Every change is undoable.

---

## Principles

1. **Human intent required**
2. **Field-level suggestions**
3. **No silent overwrites**
4. **Receipts by default**
5. **Undo is first-class**
6. **Schemas are swappable**
7. **Backend is pluggable**

---

## What Makes It Different

This behaves like version control for data entry:

- proposals are ephemeral
- patches are permanent
- provenance links values back to evidence

---

## Outcome

A reusable operator component:

- schema-agnostic
- backend-agnostic
- domain-agnostic

that can be embedded in inventory, pet tracking, ops tools, etc.
