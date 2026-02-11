# SCHEMAS.md

## Purpose

Schemas define the **shape of truth** for records edited by the Operator. They are **inputs to the UI**, not
the database schema itself.

The Operator is schema-agnostic:

- any valid JSON Schema can be used
- schemas can be swapped without DB migrations

---

## Schema Sources

Schemas may come from multiple places:

1. **Repo-backed (recommended)**
    - Generated from Zod
    - Committed JSON Schema files
2. **DB-backed**
    - Stored as JSON
    - Versioned by `schemaId`
3. **Ad-hoc / Playground**
    - Pasted at runtime
    - Stored in localStorage or ephemeral memory

All are resolved via `SchemaResolver`.

---

## Canonical Flow

Zod (authoring)  
→ JSON Schema (generated, committed)  
→ Operator UI (rendered form)

Zod is never required at runtime by the editor.

---

## Schema Identity

Each schema must have:

- `schemaId` (string, stable)
- `title`
- JSON Schema object

Example:

```json
{
    "schemaId": "equipment.v1",
    "title": "Equipment Record v1"
}
```

The `schemaId` is stored on each record.

---

## UI Schema

`uiSchema` is optional.

- ignored by core operator workflow
- supported in playgrounds or advanced layouts
- never required for proposal logic

---

## Index Projection (optional)

Schemas _may_ define index hints for tables:

- primary display field
- category
- status
- review flags

These are optional and host-defined.

---

## Versioning Rules

- Schema changes should be additive when possible
- Breaking changes create a new `schemaId`
- Old records keep their original schema

---

## Philosophy

Schemas describe **what may exist**, not **what must be filled**.
