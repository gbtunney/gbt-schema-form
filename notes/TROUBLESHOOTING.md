# TROUBLESHOOTING.md

A practical checklist for the most common failure modes in the Operator system.

---

## Constraints (non-negotiable)

- No classes
- No `interface`
- No DI container
- No `any`
- `unknown` only at true boundaries
- JSON values are `JsonValue` (JSON-safe)
- Changes to records happen via **patches**, not direct mutation

---

## 1) Proposals don’t disappear after applying

### Symptom

- You apply a proposal, but it still shows as applicable.

### Typical causes

- comparing values with `===`
- not normalizing per path (whitespace/case/number coercions)
- not recalculating proposal visibility after apply

### Fix

- use canonical JSON equality (your `json-stringified` / stable stringify utilities)
- normalize `before` + `after` via `normalizeForPath(path, value)` before comparing
- after apply, re-run:
  - `prepareProposals({ proposals, currentData })`

### Guardrail

- refuse to create a patch if:
  - `isEffectivelySame(path, before, after)` is `true`

---

## 2) Undo feels wrong

### Symptom

- Undo restores the wrong value or appears to do nothing.

### Typical causes

- `beforeJson` captured **after** you mutated `data`
- path mismatch (dot path vs pointer) between patch and setters
- patch points at a different schema version than the current form data

### Fix

- always compute:
  - `before = getAtPath(data, path)`
  - then set
- pick one path format and stick to it everywhere
- save `{ schemaId, data }` together and never mix schemaId/data from different sources

---

## 3) RJSF shows errors unexpectedly

### Symptom

- Errors appear on load, or fields vanish / reset strangely.

### Typical causes

- `schemaId` mismatch (loaded schema doesn’t match record.schemaId)
- `data` contains non-JSON values (`undefined` is the #1 offender)
- AJV defaults/`additionalProperties` constraints fighting your data

### Fix

- store and type `data` as `JsonValue`
- sanitize `undefined` away at boundaries
- confirm `schemaResolver(record.schemaId)` is what’s being rendered

---

## 4) You’re tempted to “auto-merge evidence”

### Symptom

- You want evidence ingestion to directly overwrite fields.

### Typical causes

- trying to reduce clicks
- skipping the trust step because it “seems obvious”

### Fix

- preserve the trust model: **evidence → proposals → patches**
- if you want speed, add:
  - multi-apply (apply all _new_ proposals)
  - bulk apply per section
  - keyboard shortcuts not silent writes

---

## 5) “It doesn’t feel like DI”

### Symptom

- The store/client objects feel like “weird objects” and you worry it’s a pattern smell.

### Typical cause

- expecting classes/constructors/containers

### Fix

- DI here is just function bundles:
  - UI depends on types
  - app injects implementations
- verify `@operator/ui` imports only:
  - `@operator/core`
  - `@operator/store` (types)
  - and **never** Drizzle/OpenAI/Express

---

## Minimal debug probes

- Log a patch before persisting:
  - `{ path, beforeJson, afterJson }`
- Log current value at path after apply:
  - `getAtPath(data, path)`
- Log proposal visibility counts:
  - total vs visible vs collapsed vs same

---

## Quick sanity invariants

- After apply, `getAtPath(data, path)` equals proposal value (after normalization)
- A patch’s `beforeJson` equals the value that was present _immediately before_ apply
- Undo sets the value back to `beforeJson`
