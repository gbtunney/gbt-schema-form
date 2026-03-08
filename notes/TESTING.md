# TESTING.md

Testing strategy for the operator system.

---

## Layers

### 1) Unit tests (vitest) — run in CI, no API key needed

Each package has `vitest` tests covering pure logic and in-memory behaviour:

| Package                   | What's tested                                                        |
| ------------------------- | -------------------------------------------------------------------- |
| `@operator/core`          | JSON pointer, patch apply/invert, equality, normalization            |
| `@operator/store`         | Port schema validation                                               |
| `@operator/adapter-local` | All store methods — records, evidence groups/items, patches          |
| `@operator/api-server`    | `htmlToText` conversion, scrape service, proposal service helpers    |
| `@operator/api-client`    | `createProposalClient`, `createApi` — fetch mocked, no server needed |

```bash
pnpm test          # all packages
pnpm test:coverage # with coverage report
```

Coverage reports: `packages/*/coverage/index.html`

---

### 2) Storybook — component + integration testing

Stories use `@operator/adapter-local` and mock proposal clients. No server needed except for the two LiveApi
stories.

See [`STORYBOOK.md`](STORYBOOK.md) for the full guide. Key scenarios:

- `PatchHistory/ApplyAndUndo` — apply proposals, verify patch log, undo rolls back field
- `Equipment/AssetLabelScan` — happy path with High-confidence proposals
- `Equipment/PreFilledWithGaps` — verifies already-filled fields are suppressed
- `Equipment/LiveApi` — real GPT-4o-mini proposals (requires server + `OPENAI_API_KEY`)
- `VoiceRecordButton/RealWhisper` — real Whisper transcription (requires server)

---

### 3) Integration tests — real OpenAI, opt-in only

```bash
pnpm --filter @operator/api-server test:integration
```

Requires `OPENAI_API_KEY` in `packages/operator-api-server/.env`. Not run in regular CI — only via the
`integration-tests.yml` workflow (manual trigger or PR touching server/client packages).

---

### 4) E2E — not yet

Playwright for multi-page navigation and full upload flows. Add when a real app with routing exists.

---

## What not to test where

- Drizzle/Postgres correctness → adapter-drizzle tests (when implemented)
- express-zod-api framework behaviour → not our responsibility
- RJSF rendering → Storybook visual inspection
- OpenAI output quality → manual review / evals

---

## Coverage targets

No hard thresholds enforced yet. Aim for:

- `@operator/core` — high (pure functions, easy to test)
- `@operator/adapter-local` — high (critical correctness path)
- `@operator/api-server` services — high (especially `htmlToText`, proposal helpers)
- `@operator/api-client` — medium (fetch is mocked; typed client handles most guarantees)
