# NX_DECISION.md

This project can be a pnpm-workspaces monorepo without Nx.

---

## Recommendation

**Start without Nx.** Add it only if you need caching/affected builds at scale.

---

## When Nx is worth adding

Use Nx if you have:

- many packages + many apps
- slow CI builds/tests
- need “affected” commands (only build/test changed graph)
- want caching across CI runs
- want generators for consistent package scaffolding

---

## When Nx is NOT worth it

Skip Nx if:

- you have < ~10 packages
- builds/tests are fast
- you prefer minimal tooling
- pnpm recursive scripts are enough

---

## Minimal alternative (recommended now)

- pnpm workspaces
- `pnpm -r build/test/lint`
- TypeScript project refs if needed
- Vite for app builds

Add Nx later if pain appears.
