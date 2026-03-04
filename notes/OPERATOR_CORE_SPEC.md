# OPERATOR_CORE_SPEC.md

## Package: `@operator/core`

### Goal

Implement the **pure core** of the operator system:

- JSON value typing + JSON string parsing (vendored `json-stringified.ts`)
- JSON Pointer (RFC6901) helpers (get/set)
- RFC6902 patch application wrapper
- Durable patch model (`AppliedPatch`) + invert/apply
- Normalization + equality comparison

No UI. No DB. No network.

---

## Constraints

- No classes
- No `interface`
- No `any` (use `unknown` only if required)
- ESM TypeScript
- Zod v4
- Vitest for tests
- Paths use JSON Pointer (`/a/b/0`)

---

# Directory Structure

packages/operator-core/ src/ json/ json-value.ts json-stringified.ts index.ts pointer/ pointer.ts patch/
rfc6902.ts applied-patch.ts compare/ normalize.ts equality.ts **tests**/ core.test.ts index.ts

---

# 1) json/json-value.ts

```ts
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
```

---

# 2) json/json-stringified.ts

Vendor your existing file.

Required changes:

- Replace all `any` with `unknown`
- Use `ctx.addIssue()` for Zod v4
- Must compile with Zod v4

Public API must include:

- `jsonStringified`
- `jsonParser`
- `jsonLooseCodec`

---

# 3) pointer/pointer.ts

Exports:

```ts
export function getPtr(doc: JsonValue, ptr: string): JsonValue | undefined

export function setPtr(doc: JsonValue, ptr: string, value: JsonValue): JsonValue
```

Rules:

- `""` returns root
- Immutable updates only
- Strict array handling (numeric segments only)
- Unescape `~1` → `/`, `~0` → `~`

---

# 4) patch/rfc6902.ts

Wrap `rfc6902`.

```ts
export type JsonPatchOp = Operation

export function applyRfc6902Patch(doc: JsonValue, ops: JsonPatchOp[]): JsonValue
```

Rules:

- Must clone input before apply
- Throw on failure
- No `any` leaking outside wrapper

---

# 5) patch/applied-patch.ts

```ts
export type PatchSource = 'proposal' | 'manual' | 'system'

export type AppliedPatch = {
  id: string
  recordId: string
  createdAt: string
  path: string
  beforeJson: JsonValue
  afterJson: JsonValue
  source: PatchSource
  evidenceItemId?: string | null
}
```

Exports:

```ts
export function makeAppliedPatch(...): AppliedPatch;
export function invertAppliedPatch(p: AppliedPatch): AppliedPatch;
export function applyAppliedPatch(doc: JsonValue, p: AppliedPatch): JsonValue;
```

Rules:

- Fill id with `crypto.randomUUID()` if missing
- Fill createdAt with ISO string
- Immutable application

---

# 6) compare/normalize.ts

```ts
export function normalizeForPtr(ptr: string, value: JsonValue): JsonValue
```

v1 rules:

- Trim strings
- Empty string → null
- Everything else unchanged

---

# 7) compare/equality.ts

```ts
export function jsonEquals(a: JsonValue, b: JsonValue): boolean

export function isEffectivelySame(ptr: string, a: JsonValue, b: JsonValue): boolean
```

Rules:

- Deep structural equality
- `isEffectivelySame` must normalize both sides first

---

# Tests (Vitest)

Create:

`src/__tests__/core.test.ts`

Required tests:

1. getPtr/setPtr basic behavior
2. AppliedPatch apply + invert works
3. isEffectivelySame handles trimmed strings
4. Empty string normalization → null

---

# Definition of Done

- Tests pass
- No `any`
- No UI imports
- No DB imports
- JSON Pointer used everywhere
- Package exports match spec

---

End of specification.
