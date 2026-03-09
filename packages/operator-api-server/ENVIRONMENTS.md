# Environment Setup & Configuration

Developer reference for managing environment variables across local dev, CI, staging, and production.

---

## The short version

| Where                | How                                                |
| -------------------- | -------------------------------------------------- |
| Local dev            | `.env` file in each package (gitignored)           |
| CI (GitHub Actions)  | Repository secrets                                 |
| Staging / Production | Environment variables set in your hosting platform |

Never commit real keys. Never put `.env` files on servers.

---

## Local development

Each package that needs secrets has a `.env.example` file committed to the repo. Copy it and fill in your
values:

```bash
# api-server (OpenAI key + port)
cp packages/operator-api-server/.env.example packages/operator-api-server/.env

# operator-ui (API server URL for Storybook LiveApi story)
cp packages/operator-ui/.env.example packages/operator-ui/.env
```

### operator-api-server/.env

```env
OPENAI_API_KEY=sk-... # required for proposals + Whisper transcription
PORT=3001             # optional, defaults to 3001
```

Get your key at [OpenAI API KEYs](https://platform.openai.com/api-keys)

### operator-ui/.env

```env
VITE_API_URL=http://localhost:3001
```

Only needed when using the **LiveApi** or **RealWhisper** Storybook stories. All other stories use mock
clients and work without this.

---

## Running the stack locally

```bash
# Terminal 1 — API server
pnpm --filter @operator/api-server start

# Terminal 2 — Storybook
pnpm --filter @operator/ui dev:sb
```

For unit tests and most Storybook stories, you only need Terminal 2. The server is only required for stories
that call real OpenAI.

---

## CI (GitHub Actions)

The regular build workflow (`workflow-build.yml`) runs `pnpm test` which only runs unit tests. These are fully
mocked — no API key needed, no server required.

### Setting secrets

1. Go to your GitHub repo
2. **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add `OPENAI_API_KEY` with your key value

### Integration tests

A separate `integration-tests.yml` workflow runs `test:integration` which hits real OpenAI. It only runs when:

- You manually trigger it via **Actions → Integration Tests → Run workflow**
- A PR touches `packages/operator-api-server/**` or `packages/operator-api-client/**`

The integration workflow reads the secret automatically:

```yaml
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

You don't need to change anything in the code — the server's `env.ts` reads `process.env.OPENAI_API_KEY` in
both cases.

---

## Staging and production

Set environment variables directly in your hosting platform — no `.env` files on servers.

### Server (operator-api-server)

| Variable         | Value                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| `OPENAI_API_KEY` | Your OpenAI key                                                        |
| `PORT`           | Whatever port your host assigns (e.g. Railway sets this automatically) |
| `NODE_ENV`       | `production`                                                           |

**Railway:** Dashboard → your service → Variables tab  
**Render:** Dashboard → your service → Environment tab  
**Fly.io:** `fly secrets set OPENAI_API_KEY=sk-...`  
**Docker:** Pass via `-e` flag or `environment:` in compose file

### UI (operator-ui)

`VITE_API_URL` is baked into the bundle at build time — it is not a runtime variable. Set it in your build
pipeline before running `pnpm build`:

```bash
# In your hosting platform's build settings:
VITE_API_URL=https://api.myapp.com pnpm build
```

Or in the platform's build environment variables UI (set before build, not runtime).

| Environment | VITE_API_URL                    |
| ----------- | ------------------------------- |
| Local       | `http://localhost:3001`         |
| Staging     | `https://api.staging.myapp.com` |
| Production  | `https://api.myapp.com`         |

---

## Test use DOTENV env cascade

```sh
pnpm --filter @operator/api-server exec dotenv -e ../../.env -e .env -- env
```

## Adapters: local vs Drizzle

### Right now: `operator-adapter-local`

The in-memory adapter is fully implemented and used everywhere — Storybook stories, tests, the demo app. It
resets on page reload. Perfect for development.

```ts
import { createInMemoryStore } from '@operator/adapter-local'
const store = createInMemoryStore()
```

No environment variables needed.

### Later: `operator-adapter-drizzle`

The Drizzle adapter is a placeholder (`export const adapterDrizzlePlaceholder = null`). It is **not ready
yet**.

When it is ready, it will need a database connection string:

```env
# future — not needed yet
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

And usage will look like:

```ts
import { createDrizzleStore } from '@operator/adapter-drizzle'
const store = createDrizzleStore({ connectionString: process.env.DATABASE_URL })
```

The `OperatorStore` interface is the same either way — you swap the adapter at the app boundary and nothing
else changes.

### When to switch

Switch from local → Drizzle when you need:

- Data to persist across page reloads
- Multiple users sharing the same records
- A real database (Postgres, SQLite, etc.)

For Storybook and demos, keep using the local adapter indefinitely — persistence isn't the point there.

---

## Quick reference: which variables does each package need?

| Package                    | Variable         | Required              | Notes                                |
| -------------------------- | ---------------- | --------------------- | ------------------------------------ |
| `operator-api-server`      | `OPENAI_API_KEY` | Yes (for AI features) | Warns but doesn't crash if missing   |
| `operator-api-server`      | `PORT`           | No                    | Defaults to 3001                     |
| `operator-ui`              | `VITE_API_URL`   | No                    | Only for LiveApi/RealWhisper stories |
| `operator-adapter-local`   | —                | —                     | No config needed                     |
| `operator-adapter-drizzle` | `DATABASE_URL`   | future                | Not implemented yet                  |
| `operator-core`            | —                | —                     | No config needed                     |
| `operator-store`           | —                | —                     | No config needed                     |
| `operator-api-client`      | —                | —                     | baseUrl passed in code, not env      |
