# REFERENCE.md

## Package structure

```txt
packages/
  operator-core          — pure logic, Zod schemas, no React/DB/AI
  operator-store         — port type definitions only (no implementations)
  operator-ui            — React components, consumes ports
  operator-adapter-local — in-memory OperatorStore (demos, Storybook, playground)
  operator-adapter-drizzle — Drizzle ORM adapter (placeholder, not yet built)
  operator-api-server    — Express + OpenAI + OCR/Whisper endpoints
  operator-api-client    — typed HTTP client implementing port types
```

Import rules:

- `operator-core` → `zod` only
- `operator-store` → `operator-core` (types only)
- `operator-ui` → `operator-core`, `operator-store` (ports only — never Drizzle/OpenAI/Express)
- `operator-adapter-*` → `operator-core`, `operator-store`, DB libs
- `operator-api-server` → `operator-core`, `operator-store`, OpenAI, Express
- `apps/*` → anything needed

---

## Port types (`@operator/store`)

### OperatorStore

```ts
type OperatorStore = {
  records: {
    list?: () => Promise<RecordDoc[]>
    load: (recordId: string) => Promise<RecordDoc | null>
    save: (record: RecordDoc) => Promise<void>
  }
  evidenceGroups: {
    list: (owner: EvidenceOwner) => Promise<EvidenceGroup[]>
    create: (args: { owner: EvidenceOwner; title: string }) => Promise<EvidenceGroup>
  }
  evidenceItems: {
    list: (groupId: string) => Promise<EvidenceItem[]>
    create: (args: { groupId: string; title: string; text: string }) => Promise<EvidenceItem>
    update?: (args: { id: string; patch: Partial<...> }) => Promise<EvidenceItem>
  }
  patches: {
    list: (recordId: string) => Promise<AppliedPatch[]>
    append: (patch: AppliedPatch) => Promise<void>
  }
}
```

### SchemaResolver

```ts
type SchemaResolver = (schemaId: string) => Promise<{ schemaId: string; jsonSchema: unknown }>
```

### ProposalClient

```ts
type ProposalClient = (request: ProposalRequest) => Promise<FieldProposal[]>

// ProposalRequest shape:
{
  evidenceItem: EvidenceItem
  jsonSchema?: unknown      // send this — improves AI accuracy significantly
  recordData: RecordDoc['data']
  recordId?: RecordId
  schemaId: SchemaId
}
```

### DerivationClient (api-server only, not yet a formal port)

```text
ocr(attachmentId)        → derivedText
transcribe(attachmentId) → transcriptText
scrape(url)              → scrapedText
extractPdf(attachmentId) → extractedText
```

---

## Core types (`@operator/core`)

All types are inferred from Zod schemas — no separate type declarations.

Key schemas:

- `evidenceGroupSchema`, `evidenceItemSchema`, `evidenceAttachmentSchema`, `evidenceOwnerSchema`
- `recordDocSchema`, `recordSnapshotSchema`
- `fieldProposalSchema`
- `appliedPatchSchema`
- `jsonValueSchema`, `jsonBoundarySchema`
- ID schemas: `recordIdSchema`, `schemaIdSchema`, `evidenceGroupIdSchema`, `evidenceItemIdSchema`,
  `attachmentIdSchema`

Key pure functions:

- `getPointer(data, path)` / `setPointer(data, path, value)`
- `normalizePointerValue(path, value)`
- `isEffectivelySame(a, b)` / `jsonEquals(a, b)`
- `makeAppliedPatch(args)` / `invertAppliedPatch(patch)` / `applyAppliedPatch(data, patch)`
- `applyRfc6902Patch(data, ops)`

Constraints enforced everywhere in core:

- No classes, no `interface`, no `any`
- `unknown` only at true boundaries
- ESM TypeScript with `.js` extensions on local imports

---

## OperatorEditor props

```tsx
<OperatorEditor
  schemaId="equipment.v1" // required
  schemaResolver={schemaResolver} // required
  store={store} // required
  recordId="rec-001" // optional — omit for new record
  proposalClient={proposalClient} // optional — enables 3-pane mode
  transcribeUrl="http://..." // optional — Whisper endpoint base URL
/>
```

Without `proposalClient`: two-pane layout (Evidence + Form).  
With `proposalClient`: three-pane layout (Evidence + Proposals + Form).

---

## API server endpoints

```txt
POST /v1/proposals/from-evidence   — GPT-4o-mini proposals from one evidence item
POST /derive/ocr                   — Tesseract OCR (image → text)
POST /derive/transcribe            — OpenAI Whisper (audio → transcript)
POST /derive/scrape                — node-html-parser (URL → extracted text)
```

PDF extraction endpoint (`POST /derive/pdf`) is not yet built.

---

## Tech stack

| Concern                   | Choice                             |
| ------------------------- | ---------------------------------- |
| UI framework              | React + TypeScript                 |
| Form rendering            | RJSF + AJV8                        |
| Schema authoring          | Zod → `z.toJSONSchema()`           |
| Proposal search/filter UX | Fuse.js                            |
| API layer                 | express-zod-api                    |
| AI proposals              | GPT-4o-mini                        |
| Transcription             | OpenAI Whisper                     |
| OCR                       | Tesseract                          |
| DB adapter (production)   | Drizzle + Postgres                 |
| Local/demo adapter        | in-memory (operator-adapter-local) |
| Monorepo                  | pnpm workspaces + Nx               |
| Component dev             | Storybook (react-vite)             |
| Testing                   | Vitest                             |

Swappable without touching `@operator/ui`: DB (Drizzle ↔ Prisma ↔ REST), LLM provider, OCR/transcription impl,
Postgres ↔ SQLite.

---

## Environment variables

### `packages/operator-api-server/.env`

```env
OPENAI_API_KEY=sk-... # required for proposals + Whisper
PORT=3001             # optional, default 3001
```

### `packages/operator-ui/.env`

```env
VITE_API_URL=http://localhost:3001
```

Only needed for LiveApi and RealWhisper Storybook stories.  
**In Codespaces:** use the URL bar in the LiveApi story UI instead — no env var or restart needed.

---

## Running locally

```sh
# Terminal 1 — API server
cd packages/operator-api-server && pnpm dev

# Terminal 2 — Storybook
cd packages/operator-ui && pnpm storybook

# All unit tests
pnpm test

# Integration tests (requires OPENAI_API_KEY, opt-in)
pnpm --filter @operator/api-server test:integration
```

---

## Testing layers

| Layer               | Command                 | Needs server?        |
| ------------------- | ----------------------- | -------------------- |
| Unit tests (vitest) | `pnpm test`             | No                   |
| Storybook stories   | `pnpm storybook`        | No (except LiveApi)  |
| Integration tests   | `pnpm test:integration` | Yes + OPENAI_API_KEY |
| E2E (Playwright)    | not yet built           | —                    |

Stories to verify manually:

- `Testing/PatchHistory/ApplyAndUndo` — core apply + undo loop
- `Equipment/AssetLabelScan` — happy path, high-confidence proposals
- `Equipment/PreFilledWithGaps` — already-filled fields should be suppressed
- `Equipment/LiveApi` — real GPT-4o-mini (requires server)
- `VoiceRecordButton/RealWhisper` — real Whisper transcription (requires server)

---

## Troubleshooting

**Proposals don't disappear after applying**  
Re-run `prepareProposals({ proposals, currentData })` after apply. Use `isEffectivelySame` with normalization,
not `===`.

**Undo feels wrong**  
Capture `before = getAtPath(data, path)` _before_ mutating data. Check path format consistency (pointer vs
dot).

**RJSF shows errors on load**  
Data contains `undefined` — sanitize at boundaries, type as `JsonValue`. Confirm
`schemaResolver(record.schemaId)` matches the rendered schema.

**Proposals return nothing in Codespaces**  
Port 3001 must be set to **Public** in the Ports tab. Paste the forwarded URL into the LiveApi story's URL bar
and click Connect.

**`@operator/ui` accidentally importing DB/OpenAI**  
`operator-ui` must only import from `@operator/core` and `@operator/store`. Run `pnpm nx graph` to inspect the
dependency graph.

**Tempted to auto-merge evidence into the form**  
Don't. Keep the flow: evidence → proposals → patches. For speed, add multi-apply or bulk-apply UI, not silent
writes.
