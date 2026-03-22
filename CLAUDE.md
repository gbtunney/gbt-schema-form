# CLAUDE.md — AI Assistant Guide for gbt-schema-form

This file provides essential context for AI assistants (Claude, etc.) working in this repository. Read it before making changes.

---

## Project Overview

**Evidence-Driven Schema Operator** — An AI-assisted structured data entry system.

Mental model: `Evidence → Proposals → Patches → Record`

- Users collect **evidence** (text, audio, images, URLs)
- AI generates **field-level proposals** from evidence
- Humans **explicitly apply** proposals
- Every applied value becomes a **patch** (RFC 6902 JSON Patch) with full provenance

Repository: https://github.com/gbtunney/gbt-boilerplate
Author: Gillian Tunney (gbtunney@mac.com)
License: MIT

---

## Monorepo Structure

**Package manager:** pnpm (v10.30+) — always use `pnpm`, never `npm` or `yarn`
**Task runner:** Nx v22+
**Node.js:** >=20.x (see `.nvmrc`)
**Module system:** ESM (`"type": "module"` in root package.json)

```
gbt-schema-form/
├── apps/
│   └── playground/              # Demo app — paste any JSON schema, get full editor
├── packages/
│   ├── operator-core/           # Pure logic: no React, no DB, no AI
│   ├── operator-store/          # Port/interface types (persistence contracts)
│   ├── operator-ui/             # React components + hooks
│   ├── operator-api-server/     # Express + Zod API (GPT-4o-mini, OCR, Whisper)
│   ├── operator-api-client/     # Typed HTTP client (auto-generated from server routes)
│   ├── operator-adapter-local/  # In-memory + IndexedDB adapter (demos/testing)
│   └── operator-adapter-drizzle/# Drizzle ORM adapter (placeholder, not yet implemented)
├── notes/                       # Design docs and architecture notes
├── scripts/                     # Utility scripts
├── .github/workflows/           # CI/CD pipelines
└── patches/                     # pnpm dependency patches
```

### Package Summary

| Package | npm scope | Role |
|---------|-----------|------|
| `operator-core` | `@operator/core` | Pure functions, Zod schemas, RFC 6902, no side effects |
| `operator-store` | `@operator/store` | TypeScript port types only (OperatorStore, ProposalClient, SchemaResolver) |
| `operator-ui` | `@operator/ui` | React 19 components + Storybook stories |
| `operator-api-server` | `@operator/api-server` | Express 5 REST API with AI integrations |
| `operator-api-client` | `@operator/api-client` | Build-time generated typed client |
| `operator-adapter-local` | `@operator/adapter-local` | In-memory / IndexedDB persistence |
| `operator-adapter-drizzle` | `@operator/adapter-drizzle` | Drizzle ORM (placeholder) |
| `playground` (app) | `@operator/playground` | Vite SPA demo app |

Workspace packages reference each other with `workspace:*` — e.g., `"@operator/core": "workspace:*"`.

---

## Development Commands

### Setup

```bash
pnpm install       # Install all workspace dependencies
pnpm build         # Build everything (tsc + nx build)
pnpm build:self    # Build root TypeScript only
```

### Testing

```bash
pnpm test                    # Run all tests via Nx
pnpm test:coverage           # Run all tests with coverage

# Per-package
cd packages/operator-core && pnpm test
cd packages/operator-api-server && pnpm test:integration  # Requires OPENAI_API_KEY
```

### Code Quality

```bash
pnpm check         # Lint + prettier check (non-destructive)
pnpm fix           # Lint fix + prettier write (destructive)
pnpm lint          # ESLint only
pnpm prettier      # Prettier only
pnpm lint:md       # Markdown lint
pnpm fix:md        # Markdown lint + fix
```

### Development Servers

```bash
# UI components
cd packages/operator-ui && pnpm dev:sb      # Storybook on :6006

# API server
cd packages/operator-api-server && pnpm dev  # Express on :3001

# Playground app (full stack)
cd apps/playground && pnpm dev:start        # Vite + API server concurrently
cd apps/playground && pnpm dev:vite         # Vite only (needs API separately)
```

### Nx Commands

```bash
pnpm nx:graph          # Visualize dependency graph
pnpm nx:affected       # Build/test only affected packages
pnpm inspect:nx        # Inspect Nx configuration
pnpm inspect:lint      # Inspect ESLint configuration
```

### Release

```bash
pnpm release           # Full release (build + fix + check + test + changeset)
pnpm commit            # Interactive commit via Commitizen
```

---

## Build System

### Compilation

- **TypeScript:** `tsc --build` with project references (incremental)
- **Libraries:** Rollup with `rollup-plugin-esbuild` + `rollup-plugin-dts`
- **Apps/UI:** Vite (library mode for `operator-ui`, SPA mode for `playground`)
- **Config base:** `@snailicide/build-config` package provides shared tsconfig + rollup config

### Output

- `dist/` — compiled JS (ESM)
- `types/` — `.d.ts` type declarations

### Build Dependencies (Nx)

- `build` depends on `^build` (build dependencies first)
- `test` depends on `build` and `^test`

---

## TypeScript Conventions

- **Module system:** ESM. Import paths use `.js` extensions even for `.ts` source files:
  ```ts
  import { something } from './module.js'  // correct
  import { something } from './module'      // wrong
  ```
- **Types vs interfaces:** Prefer `type` aliases; use Zod schemas and derive types with `z.infer<typeof schema>`
- **No classes** in `@operator/core` — pure functions and types only
- **No default exports** — use named exports everywhere
- **Barrel exports:** Each package exposes its API through `src/index.ts`
- **Strict mode:** Enabled via shared tsconfig base

### Package-level tsconfig pattern

```
packages/operator-core/
├── tsconfig.json          # References src/
└── src/
    └── tsconfig.json      # Actual compilation config
```

---

## Code Style & Linting

### ESLint (flat config — `eslint.config.js`)

- Version: eslint@^9 with typescript-eslint@^8
- **PascalCase** required for:
  - React component files (`*.tsx`) and functions
  - Storybook story files (`*.stories.ts/tsx`) and story functions
- **camelCase** required for React hook files (`use*.ts/tsx`)
- Type checking disabled for `*.js` and `*.d.*` files

### Prettier (`prettier.config.ts`)

- Plugins: xml, php, jsdoc, pkg, sh
- Markdown: `printWidth: 110`, `proseWrap: always`, `tabWidth: 2`

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| React components | PascalCase files + functions | `OperatorEditor.tsx` |
| React hooks | `use` prefix, camelCase file | `useAudioRecorder.ts` |
| Storybook stories | PascalCase files + functions | `OperatorEditor.stories.tsx` |
| Types/Zod schemas | PascalCase | `EvidenceItem`, `FieldProposal` |
| Services | camelCase + Service suffix | `proposalService` |
| Test files | Colocated, `.test.ts` suffix | `equality.test.ts` |

---

## Git & Commit Conventions

### Commit Format

Follows **Conventional Commits**: `type(scope): subject`

**Valid scopes:** `root`, `core`, `ui`, `playground`, `api-server`, `api-client`, `store`, `adapter-local`, `adapter-drizzle`, `notes`

```bash
pnpm commit         # Interactive Commitizen (recommended)
pnpm commit:cz      # Alias for above
```

### Hooks (Husky)

- **pre-commit:** Runs lint-staged (prettier + eslint on staged files)
- **commit-msg:** Validates commit message via commitlint

### In CI

`HUSKY=0` is set to skip hooks.

### Changesets

Use `pnpm changeset` to document changes for release. Changeset files live in `.changeset/`.

---

## Testing Conventions

**Framework:** Vitest@^4

- Tests are **colocated** with source: `src/equality.test.ts` next to `src/equality.ts`
- Coverage excludes: `index.ts`, `dist/`, `types/`, `node_modules/`
- **Integration tests** require `OPENAI_API_KEY` and are run with `INTEGRATION=true` env var
- Coverage reporters: text, json, html

### Storybook (operator-ui)

- Stories in `src/stories/*.stories.tsx`
- Uses `@storybook/addon-vitest` for component tests in browser via Playwright
- Dev server: `pnpm dev:sb` (port 6006)

---

## Environment Variables

Copy `.env.example` to `.env` in the relevant package. Never commit `.env` files.

| Variable | Package | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | `operator-api-server` | Required for proposals + transcription. Format: `sk-...` |
| `PORT` | `operator-api-server` | Optional. Defaults to `3001` |
| `VITE_API_URL` | `operator-ui`, `playground` | API base URL. Defaults to `http://localhost:3001` |

---

## Architecture Patterns

### Port/Adapter Pattern

`@operator/store` defines **port types** (contracts). Adapters implement them:

```
@operator/store         → defines  OperatorStore, ProposalClient, SchemaResolver
@operator/adapter-local → implements OperatorStore (in-memory/IndexedDB)
@operator/adapter-drizzle → implements OperatorStore (Drizzle ORM, WIP)
@operator/api-client    → implements ProposalClient (HTTP)
```

### Data Flow

```
Evidence (text/audio/image/url)
  └─▶ POST /v1/proposals/from-evidence (api-server)
        └─▶ GPT-4o-mini generates FieldProposals
              └─▶ User reviews and selects proposals
                    └─▶ AppliedPatch (RFC 6902) written to store
                          └─▶ RecordSnapshot updated
```

### API Client Generation

`operator-api-client` is **auto-generated** from `operator-api-server` routes at build time. Do not hand-edit generated files. Re-run the generator after modifying server routes.

### Core Package Constraints

`@operator/core` must remain:
- No React imports
- No database imports
- No OpenAI/AI SDK imports
- No `fetch` calls or side effects
- Pure functions and Zod schemas only

---

## CI/CD

**GitHub Actions** workflows in `.github/workflows/`:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | PR / push to main | nx affected: lint, typecheck, test, build |
| `changeset-release.yml` | PR merge | Automated version bumps + npm publish |
| `integration-tests.yml` | Manual / schedule | Full integration tests (needs secret) |
| `autofix.yml` | Push | Auto-fix formatting, push changes |
| `build-all.yml` | Manual | Build all packages |

**Setup reuse:** `setup-node-pnpm.yml` is a reusable workflow for node/pnpm setup.

---

## Key File Locations

| File | Purpose |
|------|---------|
| `package.json` | Root workspace config + scripts |
| `pnpm-workspace.yaml` | Workspace package globs |
| `nx.json` | Nx task runner configuration |
| `tsconfig.json` | Root TS config (references) |
| `tsconfig.root.json` | Root TS compiler config |
| `eslint.config.js` | ESLint flat config |
| `prettier.config.ts` | Prettier config with plugins |
| `commitlint.config.ts` | Commit message rules |
| `.lintstagedrc.mts` | lint-staged file patterns |
| `.env.example` | Environment variable template |
| `notes/OVERVIEW.md` | High-level architecture overview |
| `notes/REFERENCE.md` | API reference documentation |
| `notes/CHECKLIST.md` | Development checklist |

---

## Common Pitfalls & Important Notes

1. **Always use `pnpm`** — the project uses pnpm workspaces; npm/yarn will break things.
2. **ESM import extensions** — TypeScript source files must use `.js` extensions in import paths.
3. **Do not edit generated files** — `operator-api-client/src/generated/` is auto-generated; modify the server routes instead.
4. **`operator-core` purity** — Never add framework or I/O dependencies to this package.
5. **Build order matters** — Nx handles this, but if building manually, build `core` → `store` → adapters/ui/api-client → apps.
6. **Integration tests need secrets** — `OPENAI_API_KEY` must be set; tests without it will be skipped.
7. **Storybook PascalCase rule** — Story files and functions must be PascalCase; ESLint enforces this.
8. **Changesets for releases** — Use `pnpm changeset` to create a changeset before merging features.
9. **Patches directory** — `patches/browserslist-generator@2.3.0.patch` must be applied; pnpm handles this automatically via `patchedDependencies` in package.json.
10. **React 19** — The project uses React 19; ensure any new UI code is compatible.
