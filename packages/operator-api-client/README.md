# @operator/api-client

Typed HTTP client for `@operator/api-server`. Implements the port types from `@operator/store` so the UI can
call the server without knowing anything about HTTP.

---

## Usage

The consuming app (e.g. `operator-ui`) owns the server URL via a Vite env var:

```tsx
// apps/your-app/src/main.tsx
import { createProposalClient } from '@operator/api-client'

const proposalClient = createProposalClient({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
})

// Pass to OperatorEditor — satisfies the ProposalClient port from @operator/store
<OperatorEditor
    store={store}
    schemaResolver={resolver}
    proposalClient={proposalClient}
/>
```

The UI receives a `ProposalClient` function type. It has no idea whether the implementation is HTTP, a mock,
or anything else — that's the point.

---

## Environment

The server URL is set by the **consuming app**, not this package. Copy `.env.example` to `.env` in whichever
app imports this package:

```sh
cp .env.example .env
```

```sh
VITE_API_URL=http://localhost:3001 # development
# VITE_API_URL=https://api.yourapp.com  # production
```

`VITE_API_URL` is baked in at Vite build time via `import.meta.env.VITE_API_URL`. If it's not set, the client
falls back to `http://localhost:3001`.

---

## Exports

```ts
import { createProposalClient } from '@operator/api-client'
import { createApi } from '@operator/api-client'
import type { Api } from '@operator/api-client'
import type { ClientContext } from '@operator/api-client'
```

### `createProposalClient(ctx)`

Creates a `ProposalClient` (from `@operator/store`) backed by `POST /v1/proposals/from-evidence`.

```ts
const client = createProposalClient({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
})

const proposals = await client({ evidenceItem, recordData, schemaId })
// → FieldProposal[]
```

### `createApi(ctx)`

Lower-level typed API object if you need direct access to any endpoint:

```ts
const api = createApi({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
})

const result = await api.v1.proposals.fromEvidence.post(request)
const transcript = await api.derive.transcribe.post({ audioBase64, mimeType })
```

---

## Client regeneration

`src/generated/api.ts` is **auto-generated** — do not edit it manually.

To regenerate after changing server routes:

```sh
pnpm --filter @operator/api-server gen:client
```

This reads the server's routes and writes a fresh typed client directly into this package's
`src/generated/api.ts`.

---

## Structure

```sh
src/
generated/
api.ts # AUTO-GENERATED — do not edit
client/
api.ts     # buildApi() / createApi() — wraps generated types
runtime.ts # fetch implementation
index.ts
adapters.ts # createProposalClient() — implements ProposalClient port
index.ts
```

---

## Dependency graph

```text
@operator/core
      ↑
@operator/store        ← ProposalClient port lives here
      ↑
@operator/api-client   ← implements the port over HTTP
      ↑
@operator/ui           ← injects it, never sees HTTP
```

`@operator/api-server` is a **dev/type-only** dependency — used at build time to type the generated client.
Zero server code runs in the browser.
