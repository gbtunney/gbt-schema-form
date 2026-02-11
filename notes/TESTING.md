# TESTING.md

This project benefits from **scenario-driven UI testing**.

---

## Recommended layers

### 1) Storybook (scenario library)

Use Storybook to model hard-to-reproduce states:

- empty record
- draft group unattached
- evidence item with derived OCR text
- proposals with: same/hidden, similar/collapsed, conflicts
- invalid proposal (fails schema)
- patch history present
- undo/redo effects
- loading/error states

Inject:

- `OperatorStore` using `@operator/adapter-local`
- mocked `proposalClient` returning canned proposals
- mocked `derivationClient` returning canned derived text

This gives you “integration-ish” confidence without the full app.

### 2) Demo app (routing)

Use `apps/operator-demo` for:

- DataGrid → editor routing
- schema playground page
- manual exploratory testing

### 3) E2E (later)

Add Playwright when you need:

- multi-page navigation
- real backend wiring
- attachment upload flows

---

## What to automate first

If you use Storybook test-runner (Playwright):

- Apply arrow updates form field
- Undo restores previous value
- Hide-same toggle affects proposal list
- Similar proposals collapse/expand correctly

---

## What not to test in Storybook

- Drizzle/Postgres correctness
- express-zod-api correctness
- object storage integrations

Those belong to adapter/api tests and E2E.

---

## Summary

Use Storybook for UI state coverage. Use demo app for routing. Add Playwright later for full workflows.
