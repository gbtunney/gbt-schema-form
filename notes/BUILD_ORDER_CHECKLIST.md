# BUILD_ORDER_CHECKLIST.md

One-page checklist for building this when tired.

Rule: **don’t build the backend first**. Build the core truth + a local demo adapter first.

---

## Phase 0 — Ground truth docs (done)

- [ ] `CORE_ZOD.md`
- [ ] `CORE_HELPERS.md`
- [ ] `STORE.md`
- [ ] `UI_TYPES.md`
- [ ] `WALKTHROUGH.md`
- [ ] `TROUBLESHOOTING.md`

---

## Phase 1 — `@operator/core` (pure)

**Goal:** core behavior is correct before any UI polish.

- [ ] Implement `JsonValue` + canonical equality (reuse your `json-stringified` util)
- [ ] Implement path functions: `getAtPath`, `setAtPath`
- [ ] Implement normalization: `normalizeForPath`
- [ ] Implement comparisons: `isEffectivelySame`, `isSimilar`
- [ ] Implement patch helpers: `makePatch`, `invertPatch`
- [ ] Implement proposal prep: `prepareProposals` (hide/collapse/dedupe/rank)
- [ ] Add unit tests for helpers (tiny fixtures)

Stop when:

- applying a proposal to a JSON doc works in tests
- undo via inverted patch works in tests

---

## Phase 2 — `@operator/store` (types only)

- [ ] Export port types as `type` aliases (no interfaces)
- [ ] Reference core types (`EvidenceItem`, `AppliedPatch`, etc.)
- [ ] Keep the surface area minimal

Stop when:

- UI can compile against the store port without any adapter

---

## Phase 3 — `@operator/ui` (types first, then minimal UI)

- [ ] Create `OperatorEditorProps` + `OperatorState` (from `UI_TYPES.md`)
- [ ] Build a minimal editor page layout (3 panes)
- [ ] Wire “open record” flow:
  - load record → resolve schema → load evidence
- [ ] Render RJSF form with `jsonSchema + data`
- [ ] Render evidence list

Stop when:

- you can open a record and see form + evidence (no proposals yet)

---

## Phase 4 — Local adapter + demo app (make it real fast)

- [ ] Implement `@operator/adapter-local` (in-memory store)
- [ ] Create `apps/operator-demo`
- [ ] Add `/records` page (DataGrid) powered by `listRecords`
- [ ] Add `/records/:id` page (OperatorEditor)

Stop when:

- you can click a row → open editor

---

## Phase 5 — Proposals & apply arrows (core loop)

- [ ] Add mocked `proposalClient` that returns fixed proposals
- [ ] Wire “Run proposals” per evidence item
- [ ] Display proposals with hide/collapse rules
- [ ] Apply arrow:
  - make patch → setAtPath → appendPatch + saveRecord
- [ ] Undo button:
  - last patch beforeJson → saveRecord

Stop when:

- end-to-end applies + undo work with mock proposals

---

## Phase 6 — Server + real persistence (later)

Only now add:

- [ ] `@operator/api` (express-zod-api) for real LLM + derivations
- [ ] `@operator/adapter-drizzle` for Postgres/SQLite
- [ ] Storybook scenario library + test runner (optional)

---

## If you’re stuck tonight

- make the mocked proposal client return **one** proposal
- get apply/undo correct
- everything else is optional until that works
