# @operator/api-server

Express Zod API server for AI proposals and evidence derivations.

This is the **only package** that talks to OpenAI. The UI never calls OpenAI directly — it calls an injected
`ProposalClient` or `DerivationClient` that points here.

---

## Endpoints

| Method | Path                          | Description                                                       |
| ------ | ----------------------------- | ----------------------------------------------------------------- |
| `POST` | `/v1/proposals/from-evidence` | Generate `FieldProposal[]` from one evidence item via GPT-4o-mini |
| `POST` | `/derive/ocr`                 | Extract text from an image via Tesseract                          |
| `POST` | `/derive/transcribe`          | Transcribe audio via OpenAI Whisper                               |
| `GET`  | `/hello`                      | Health check                                                      |

### POST `/v1/proposals/from-evidence`

Input (`ProposalRequest` from `@operator/store`):

```ts
{
    evidenceItem: EvidenceItem   // the text blob to analyse
    recordData:   JsonValue      // current form data
    schemaId:     string
    recordId?:    string
}
```

Output:

```ts
{ proposals: FieldProposal[] }
```

### POST `/derive/transcribe`

Input:

```ts
{
    audioBase64: string   // base64-encoded audio from MediaRecorder
    mimeType:    string   // "audio/webm", "audio/mp4", etc.
    language?:   string   // BCP-47 hint e.g. "en" — Whisper auto-detects if omitted
}
```

Output:

```ts
{
  text: string
}
```

### POST `/derive/ocr`

Input: `{ base64?: string, imageUrl?: string, langs?: string }`  
Output: `{ text: string, confidence: number }`

---

## Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
OPENAI_API_KEY=sk-... # required
PORT=3001             # optional, defaults to 3001
```

`.env` is gitignored. Never commit real keys.

---

## Development

```bash
# Start dev server
pnpm dev

# Regenerate the typed client in @operator/api-client
pnpm gen:client
```

### Client regeneration

`gen:client` runs three steps automatically:

1. `build:client:ts` — compiles only `src/client/generator.ts`
2. `node src/client/generator.js` — reads routes + config, writes to
   `../operator-api-client/src/generated/api.ts`
3. `build:client:ts --clean` — removes the compiled generator artifact

Re-run whenever you add or change a route schema. You do **not** need to re-run it for changes to services or
internal logic.

---

## Structure

```sh
src/
routes/
proposals.ts         # POST /v1/proposals/from-evidence
derive-ocr.ts        # POST /derive/ocr
derive-transcribe.ts # POST /derive/transcribe
hello-world.ts       # GET  /hello
services/
proposal-service.ts # GPT-4o-mini → FieldProposal[]
whisper-service.ts  # Whisper → transcript string
ocr-service.ts      # Tesseract → text + confidence
client/
generator.ts # build-time script, writes to @operator/api-client
config/
env.ts
routes.ts       # routing table
server.ts       # getConfig() + buildServer()
start-server.ts # entrypoint
```

---

## Dependency graph

```text
@operator/core
      ↑
@operator/store
      ↑
@operator/api-server   →(type-only at build time)→   @operator/api-client
```

The client package has a **dev/type-only** dependency on this package for the router types. At runtime it only
makes fetch calls — no server code is bundled into the client.

---

## TODO

- `POST /derive/scrape` — URL → extracted text
- `POST /derive/pdf` — PDF → extracted text
- Extract shared `createDerivationEndpoint()` factory once 3+ derivation routes exist
