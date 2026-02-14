<!-- Template-inspired header with badges and a succinct description. -->

# @operator/api Operator API (Express Zod API)

> (Express Zod API) – Architecture & Build Plan: Server-side API for AI proposals and derivations

This package scaffolds an Express-based API for integrating AI services such as proposal generation, OCR and
transcription. It depends on `@operator/core` but otherwise remains backend agnostic.

## Package Placement

Create:

`packages/operator-api`

This package is the **only place** that talks to:

- OpenAI (proposals + Whisper)
- OCR provider (Tesseract, Google Vision, etc.)
- Scraping services

UI never calls OpenAI directly.  
UI calls an injected `proposalClient` that points to this API.

---

## Contract Alignment (Dependency Injection)

`@operator/store` defines:

- `ProposalRequestSchema`
- `FieldProposalSchema`

`operator-api` should **import those schemas** and use them directly for request/response validation.

That guarantees:

- API and UI stay in sync
- No duplicated schemas
- No drift

---

## Minimal API Surface (v0)

## 1️⃣ Proposals (Core Loop)

### POST /proposals

Input:

```ts
ProposalRequest
```

Output:

```ts
FieldProposal[]
```

---

## 2️⃣ Evidence Derivations

These convert attachments into text for EvidenceItems.

- `POST /derive/ocr` → `{ text }`
- `POST /derive/whisper` → `{ text }`
- `POST /derive/scrape` → `{ text }`

These do NOT apply patches.  
They only generate text blobs.

---

## API (This Package)

Implements:

- `createProposalClient()`
- `createOcrClient()`
- `createTranscriptionClient()`

UI receives these via DI:

```tsx
<OperatorEditor store={store} schemaResolver={resolver} proposalClient={proposalClient} />
```

---

# Correct Architecture Flow

```sh
UI → proposalClient (injected)
proposalClient → operator-api
operator-api → OpenAI / OCR / Whisper
operator-api → returns structured proposals
UI → core helpers
UI → store
```

---

# Recommended Folder Structure

```sh
packages/operator-api/
src/
index.ts
server.ts
routes/
proposals.ts
derive-ocr.ts
derive-whisper.ts
derive-scrape.ts
services/
proposal-service.ts
ocr-service.ts
whisper-service.ts
scrape-service.ts
config/
env.ts
```

If using OpenAI later, install it only in `@operator/api`.

---

## Express Zod API Endpoint Shape

Example conceptual route definition:

```ts
import { z } from 'zod'
import { ProposalRequestSchema, FieldProposalSchema } from '@operator/store'

export const proposalsEndpoint = {
  input: ProposalRequestSchema,
  output: z.array(FieldProposalSchema),
  handler: async ({ input, ctx }) => {
    return ctx.services.proposals(input)
  },
}
```

Services are injected via `ctx.services`.

---

## Service Injection Pattern

In `server.ts`:

- `services.proposals`
- `services.ocr`
- `services.whisper`
- `services.scrape`

Routes never call OpenAI directly.  
They call injected services.

---

### File Upload Strategy (v0)

Do NOT implement multipart first.

Instead:

- OCR: `{ imageUrl }` or `{ base64 }`
- Whisper: `{ audioUrl }` or `{ base64 }`
- Scrape: `{ url }`

Later add:

- `POST /uploads`
- attachment storage

---

## Development Order

1. Finish `@operator/store` types
2. Build `@operator/adapter-local`
3. Build demo app
4. Implement mock proposal service in API
5. Wire UI → mock proposals
6. Only then integrate real OpenAI

---

## Fake Proposal Service (Recommended First Step)

Before real OpenAI:

Return one deterministic proposal.

Example:

If evidence contains "model", propose:

```json
{
  "path": "/model",
  "value": "Eheim 2211",
  "confidence": 0.9
}
```

Get apply/undo working first.

---

## Final Endpoint List

- `POST /proposals`
- `POST /derive/ocr`
- `POST /derive/whisper`
- `POST /derive/scrape`
- (later) `POST /uploads`
- (later) `GET /attachments/:id`

---
