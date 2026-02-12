# Editor Context

## Project: Operator Editor

> (schema-driven AI-assisted JSON editor)

### Architecture rules

- Zod v4
- JSON-document based (everything JSON-serializable)
- Immutable core
- No classes
- No interfaces
- No `any`
- `unknown` allowed
- Functional style only

### Core packages

- @operator/core → pointer + patch + compare helpers only
- @operator/store → ports + types only
- @operator/ui → React wiring

### Libraries

- json-pointer (RFC6901 get/set/remove)
- rfc6902 (optional patch ops)
- structuredClone for immutability
- RJSF in UI layer only

### Patch model

- Durable history uses AppliedPatch
- Evidence → Proposals → AppliedPatch
- No auto-merging
- All changes are reversible

### Goal

Keep core boring, deterministic, testable. No domain logic inside pointer/patch layer.

## Short Version

### Operator Editor

- Zod v4.
- json-pointer + rfc6902.
- Immutable.
- No classes. Functional only.
- Working on @operator/core.
