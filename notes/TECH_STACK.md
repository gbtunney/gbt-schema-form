# TECH_STACK.md

This file lists **recommended defaults** for v1 and clarifies what is **swappable**.

---

## Frontend (Operator UI)

### Core

- **React + TypeScript**
- **@mui/material** for layout and controls
- **@mui/x-data-grid** for the “AppSheet-style” record picker table

### Schema Form Rendering

- **RJSF** (`@rjsf/core`)
- **AJV8 validator** (`@rjsf/validator-ajv8`)

Notes:

- JSON Schema is treated as _runtime input_.
- Zod is not required in the UI runtime path.

### Proposal UX / Filtering

- **Fuse.js** for proposal search/filter and de-duping UI affordances
- Normalization + equality checks happen in `@operator/core` (deterministic)
- Fuzzy similarity is used to collapse “near-duplicate” suggestions

---

## Schemas

### Authoring

- **Zod** (canonical authoring format for domain schemas)

### Generation

- Generate JSON Schema **offline**
- Commit generated JSON Schema to repo
- UI reads JSON Schema files directly

---

## Backend (API)

### Typed API Layer

- **express-zod-api**
  - typed request/response contracts
  - shared validation schemas
  - consistent error handling

### Proposal Engine

- LLM provider integration (OpenAI or alternative)
- LLM output must be validated against domain schema and proposal rules

### Derivations (optional v1; pluggable)

- OCR (image → text)
- Transcription (audio → text; ideally live recording)
- Scrape (url → text)
- PDF text extraction

All derivations feed evidence text. Evidence text feeds proposals.

---

## Persistence

### Database Access

- **Drizzle** (recommended)
  - clear SQL control
  - strong typing
  - composable adapters

### Database

- **Postgres** for production
- **SQLite** acceptable for local/demo

### Storage for bytes

- store metadata in DB
- store bytes in object storage or local file store
- DB keeps `storageKey` and derived text

---

## Optional Additions (later)

- **BullMQ** (or equivalent) if derivations become long-running async jobs
- **RFC6902 JSON Patch** (`fast-json-patch`) if you want standardized patch format
- **Dexie / IndexedDB** for offline local adapter

---

## Swappable Components

Safe to swap without changing `@operator/ui`:

- Drizzle ↔ Prisma ↔ REST backend
- Postgres ↔ SQLite
- OpenAI ↔ other LLM providers
- OCR/transcription/scrape implementations
- RJSF ↔ alternative form renderers (Uniforms/JSONForms), if desired

---

## Default “v1 stack” summary

- UI: React + TS + MUI + DataGrid
- Forms: RJSF + AJV8
- Schemas: Zod authoring → JSON Schema generated/committed
- Search: Fuse.js (UX filtering; not core equality)
- DB: Drizzle + Postgres
- API: express-zod-api + proposal/derivation endpoints
