# Evidence-Driven Schema Operator

AI-assisted structured data entry where **AI proposes** and **humans commit**.

A schema-first operator editor that turns messy inputs — OCR, audio, URLs, notes — into clean structured
records with field-level proposals, explicit apply arrows, provenance receipts, and undo/redo via patches.

> AI suggests. Humans commit. Every value has a receipt.

---

## Mental model

```txt
Evidence → Proposals → Patches → Record
```

Evidence is collected (text, OCR, audio, URLs). AI generates per-field proposals from a single evidence item.
The operator reviews and explicitly applies proposals. Every applied value creates a patch with full
provenance. Nothing is written silently.

---

## Packages

| Package                     | Description                                                                      |
| --------------------------- | -------------------------------------------------------------------------------- |
| `@operator/core`            | Pure logic — JSON pointer, patches, equality, normalization, Zod schemas         |
| `@operator/store`           | Port types — `OperatorStore`, `SchemaResolver`, `ProposalClient`                 |
| `@operator/ui`              | React components — `OperatorEditor`, `EvidencePane`, `ProposalsPane`, `FormPane` |
| `@operator/adapter-local`   | In-memory store for demos, Storybook, and tests                                  |
| `@operator/adapter-drizzle` | Drizzle ORM adapter (placeholder — not yet implemented)                          |
| `@operator/api-server`      | Express Zod API — proposals (GPT-4o-mini), OCR (Tesseract), Whisper, scrape      |
| `@operator/api-client`      | Typed HTTP client implementing `@operator/store` port types                      |

---

## Quick start

```bash
pnpm install
pnpm build

# Storybook (no server needed for most stories)
cd packages/operator-ui && pnpm storybook

# API server (needed for LiveApi + RealWhisper stories only)
cd packages/operator-api-server && pnpm dev
```

See [`notes/STORYBOOK.md`](notes/STORYBOOK.md) for a guide to each story and what it tests.  
See [`notes/ENVIRONMENTS.md`](notes/ENVIRONMENTS.md) for environment variable setup.

---

## Derivation endpoints

The API server exposes three endpoints for turning raw inputs into evidence text:

| Endpoint                           | Input                  | Output                                            |
| ---------------------------------- | ---------------------- | ------------------------------------------------- |
| `POST /derive/ocr`                 | Image (base64 or URL)  | Extracted text via Tesseract                      |
| `POST /derive/transcribe`          | Audio (base64)         | Transcript via OpenAI Whisper                     |
| `POST /derive/scrape`              | URL                    | Readable text (headings, lists, tables preserved) |
| `POST /v1/proposals/from-evidence` | Evidence item + schema | Field proposals via GPT-4o-mini                   |

---

## Running tests

```bash
pnpm test             # unit tests only — no API key needed
pnpm test:coverage    # with coverage report (opens coverage/index.html)
pnpm test:integration # hits real OpenAI — requires OPENAI_API_KEY
```

---

## Notes

Design and architecture docs live in [`notes/`](notes/):

- [`ARCHITECTURE.md`](notes/ARCHITECTURE.md) — data model, flow diagrams
- [`DESIGN.md`](notes/DESIGN.md) — design brief and principles
- [`DIRECTIONS.md`](notes/DIRECTIONS.md) — behaviour spec
- [`PACKAGES.md`](notes/PACKAGES.md) — package responsibilities and dependency rules
- [`STORE.md`](notes/STORE.md) — persistence contract
- [`ENVIRONMENTS.md`](notes/ENVIRONMENTS.md) — env vars for local/CI/staging/production
- [`STORYBOOK.md`](notes/STORYBOOK.md) — Storybook testing guide
- [`TESTING.md`](notes/TESTING.md) — testing strategy
