# CHECKLIST.md

Build in this order. Don't build the backend first — core + local adapter first.

---

## ✅ Phase 1 — `@operator/core`

- [x] `JsonValue` + canonical equality (`json-stringified` util)
- [x] `getPointer` / `setPointer`
- [x] `normalizePointerValue`
- [x] `isEffectivelySame` / `jsonEquals`
- [x] `makeAppliedPatch` / `invertAppliedPatch` / `applyAppliedPatch`
- [x] Zod schemas for all core types
- [x] Unit tests

## ✅ Phase 2 — `@operator/store`

- [x] `OperatorStore` port type
- [x] `SchemaResolver` port type
- [x] `ProposalClient` port type + `proposalRequestSchema`

## ✅ Phase 3 — `@operator/ui`

- [x] `OperatorEditor` — 3-pane layout wired to store + proposalClient
- [x] `EvidencePane` — groups, items, auto-group, quick-add, voice recording
- [x] `ProposalsPane` — per-item proposals, apply arrows, filtering
- [x] `FormPane` — RJSF form + live validation
- [x] `VoiceRecordButton` — browser audio → transcription
- [x] Apply proposal → patch written to store
- [x] Undo via `invertAppliedPatch`

## ✅ Phase 4 — `@operator/adapter-local`

- [x] In-memory `OperatorStore` implementation
- [x] `initialState` for seeding Storybook scenarios
- [x] Unit tests

## ✅ Phase 5 — Proposals + apply loop

- [x] Mock `proposalClient` in stories
- [x] Real `proposalClient` via `@operator/api-client`
- [x] Apply proposal → patch + save
- [x] Undo via inverted patch
- [x] `PatchHistory` story for verifying apply/undo loop

## ✅ Phase 6 — Server + API client

- [x] `@operator/api-server` (express-zod-api)
  - [x] `POST /v1/proposals/from-evidence` — GPT-4o-mini
  - [x] `POST /derive/ocr` — Tesseract
  - [x] `POST /derive/transcribe` — OpenAI Whisper
  - [x] `POST /derive/scrape` — node-html-parser
- [x] `@operator/api-client` — typed generated client + adapters
- [x] Storybook `LiveApi` story — URL bar for Codespaces (no restart needed)

## ✅ Phase 7 — Zod schema authoring

- [x] Equipment schema defined in Zod in stories
- [x] `z.toJSONSchema()` feeds RJSF and AI prompt
- [x] `EquipmentRecord` type inferred from Zod

---

## 🔲 Next: Playground app

A standalone `apps/playground` Vite app. Think RJSF playground but the middle panel is the full
`OperatorEditor`.

**Three panels:**

- Left: Schema input — Zod tab and JSON Schema tab (toggle), `z.toJSONSchema()` converts on the fly
- Middle: `OperatorEditor` — full 3-pane (Evidence | Proposals | Form), wired to `adapter-local` + real
  `proposalClient`
- Right: Live state inspector — current `formData`, `patchHistory`, raw proposals

**Wiring:**

- Schema input drives `schemaResolver` and re-mounts the editor on change
- `adapter-local` for persistence (in-memory, resets on schema change)
- Real `proposalClient` via URL bar (same pattern as LiveApi story)
- Seed data input (JSON textarea) for pre-populating the record

## 🔲 Then: Real app with routing

`apps/equipment-inventory` (or similar):

- `/records` — DataGrid list view using `store.records.list()`
- `/records/:id` — `OperatorEditor` with real `adapter-drizzle` store
- Requires `@operator/adapter-drizzle` to be built first

## 🔲 Remaining gaps

- [ ] `@operator/adapter-drizzle` — Drizzle ORM adapter (placeholder exists, not implemented)
- [ ] `POST /derive/pdf` endpoint
- [ ] `DerivationClient` as a formal port type in `@operator/store`
- [ ] `AttachmentStorage` port (bytes out of DB — storageKey pattern)
- [ ] Storybook Playwright test runner (E2E)
- [ ] Multi-apply / bulk-apply UI in ProposalsPane
