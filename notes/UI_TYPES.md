# UI_TYPES.md

## Purpose

This document defines the **Operator UI state and props**. It contains **types only** — no components, no
hooks, no JSX.

The UI consumes:

- store ports
- schema resolver
- proposal / derivation clients
- core helpers

---

## Editor props

```ts
export type OperatorEditorProps = {
  recordId: string
  store: OperatorStore
  schemaResolver: SchemaResolver
  proposalClient: ProposalClient
  derivationClient?: DerivationClient
}
```

---

## Editor state (conceptual)

```ts
export type OperatorState = {
  record: RecordSnapshot | null
  schema: {
    schemaId: string
    jsonSchema: unknown
    uiSchema?: unknown
  } | null

  evidenceGroups: EvidenceGroup[]
  evidenceItemsByGroup: Record<string, EvidenceItem[]>
  attachmentsByItem: Record<string, EvidenceAttachment[]>

  proposalsByItem: Record<string, ProposalViewModel[]>

  patches: AppliedPatch[]

  ui: {
    hideSame: boolean
    collapseSimilar: boolean
    selectedEvidenceItemId?: string
    loading: boolean
    error?: string
  }
}
```

---

## Proposal view model

```ts
export type ProposalViewModel = {
  proposalId: string
  path: string

  beforeJson: JsonValue | undefined
  afterJson: JsonValue

  status: 'same' | 'similar' | 'new' | 'invalid'
  confidence: 'High' | 'Medium' | 'Low'

  visible: boolean
  collapsed: boolean

  evidenceItemId: string
}
```

---

## UI events (conceptual)

```ts
export type OperatorEvents = {
  onRunProposals: (evidenceItemId: string) => Promise<void>
  onApplyProposal: (proposalId: string) => Promise<void>
  onUndo: () => Promise<void>
  onRedo?: () => Promise<void>

  onCreateEvidenceItem: (groupId: string) => Promise<void>
  onAttachDraftGroup: (groupId: string) => Promise<void>
}
```

---

## What does NOT live here

- persistence logic
- AI calls
- JSON comparison rules
- patch creation logic

Those live in:

- `@operator/core`
- `@operator/store`
