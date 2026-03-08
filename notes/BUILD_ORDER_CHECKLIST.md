# BUILD_ORDER_CHECKLIST.md

One-page checklist for building this when tired.

Rule: **don't build the backend first**. Build the core truth + a local demo adapter first.

---

## Phase 0 — Ground truth docs ✅

- [x] `CORE_ZOD.md`
- [x] `CORE_HELPERS.md`
- [x] `STORE.md`
- [x] `UI_TYPES.md`
- [x] `WALKTHROUGH.md`
- [x] `TROUBLESHOOTING.md`

---

## Phase 1 — `@operator/core` ✅

- [x] Implement `JsonValue` + canonical equality (`json-stringified` util)
- [x] Implement path functions: `getPointer`, `setPointer`
- [x] Implement normalization: `normalizePointerValue`
- [x] Implement comparisons: `isEffectivelySame`, `jsonEquals`
- [x] Implement patch helpers: `makeAppliedPatch`, `invertAppliedPatch`, `applyAppliedPatch`
- [x] Zod schemas for all core types (Evidence, FieldProposal, AppliedPatch, RecordDoc)
- [x] Unit tests

---

## Phase 2 — `@operator/store` ✅

- [x] `OperatorStore` port type
- [x] `SchemaResolver` port type
- [x] `ProposalClient` port type + `proposalRequestSchema`
- [x] References core types

---

## Phase 3 — `@operator/ui` ✅

- [x] `OperatorEditor` — 3-pane layout wired to store + proposalClient
- [x] `EvidencePane` — groups, items, auto-group, quick-add, voice recording
- [x] `ProposalsPane` — per-item proposals, apply arrows
- [x] `FormPane` — RJSF form + live validation
- [x] `VoiceRecordButton` — browser audio → transcription
- [x] Apply proposal → patch written to store
- [x] Undo via `invertAppliedPatch`

---

## Phase 4 — `@operator/adapter-local` ✅

- [x] In-memory `OperatorStore` implementation
- [x] Supports `initialState` for seeding Storybook scenarios
- [x] Unit tests for all store methods

---

## Phase 5 — Proposals & apply arrows ✅

- [x] Mock `proposalClient` in stories
- [x] Real `proposalClient` via `@operator/api-client`
- [x] Apply proposal → patch + save
- [x] Undo via inverted patch
- [x] `PatchHistory` Storybook story for testing apply/undo loop

---

## Phase 6 — Server + API client ✅

- [x] `@operator/api-server` (express-zod-api)
  - [x] `POST /v1/proposals/from-evidence` — GPT-4o-mini
  - [x] `POST /derive/ocr` — Tesseract
  - [x] `POST /derive/transcribe` — OpenAI Whisper
  - [x] `POST /derive/scrape` — node-html-parser (headings/lists/tables)
- [x] `@operator/api-client` — typed generated client + adapters
- [x] Storybook `LiveApi` story wired to real server

---

## Phase 7 — Schemas as Zod ✅

- [x] Equipment schema defined in Zod in stories
- [x] `z.toJSONSchema()` feeds RJSF and AI prompt
- [x] `EquipmentRecord` type inferred from Zod

---

## Not yet started

- [ ] `@operator/adapter-drizzle` — Drizzle ORM adapter (placeholder only)
- [ ] PDF derivation endpoint (`POST /derive/pdf`)
- [ ] Storybook test runner (Playwright)
- [ ] E2E tests
- [ ] Real app with routing (`/records` grid + `/records/:id` editor)
