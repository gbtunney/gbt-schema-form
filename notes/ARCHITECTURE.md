# ARCHITECTURE.md

# Evidence-Driven Schema Editor — Architecture

## Big Picture Flow

```mermaid
flowchart LR
  A[Unstructured inputs\nnotes • OCR • audio • URLs • PDFs] --> B[Evidence Items\n(titled text blobs)]
  B --> C[Proposal Engine\n(LLM + validators)]
  C --> D[Field Proposals\n(per-field suggestions)]
  D --> E[Operator UI\nEvidence | Proposals | Form]
  E -->|Apply arrow| F[Patch]
  F --> G[Structured Record\n(Zod truth)]
  F --> H[Provenance\n(evidence refs)]
  F --> I[Undo/Redo\n(history)]
```

---

## Data Model

```mermaid
erDiagram
  EQUIPMENT_RECORD ||--o{ EVIDENCE_GROUP : has
  EVIDENCE_GROUP ||--o{ EVIDENCE_ITEM : contains
  EVIDENCE_ITEM ||--o{ EVIDENCE_ATTACHMENT : has

  EVIDENCE_ITEM ||--o{ PROPOSAL_RUN : generates
  PROPOSAL_RUN ||--o{ FIELD_PROPOSAL : includes
  EQUIPMENT_RECORD ||--o{ APPLIED_PATCH : history

  EQUIPMENT_RECORD {
    string id PK
    string schemaId
    json data
  }

  EVIDENCE_GROUP {
    string id PK
    string recordId FK
    string title
    string status
  }

  EVIDENCE_ITEM {
    string id PK
    string groupId FK
    string title
    text text
    bool pinned
    bool selected
  }

  EVIDENCE_ATTACHMENT {
    string id PK
    string itemId FK
    string kind
    string storageKey
    string url
    text derivedText
    string status
  }

  PROPOSAL_RUN {
    string id PK
    string evidenceItemId FK
    datetime createdAt
  }

  FIELD_PROPOSAL {
    string id PK
    string runId FK
    string path
    json valueJson
    string confidence
    bool valid
    text excerpt
  }

  APPLIED_PATCH {
    string id PK
    string recordId FK
    string path
    json beforeJson
    json afterJson
    string source
    string evidenceItemId
  }
```

---

## Operator UI Layout

```mermaid
flowchart LR
  subgraph UI[Operator Console]
    L[Evidence Pane]
    M[Proposals Pane]
    R[Form Pane]
  end

  L -->|generate| M
  M -->|apply| R
```

---

## Patch Lifecycle

```mermaid
sequenceDiagram
  participant U as User
  participant E as EvidenceItem
  participant AI as Proposal Engine
  participant P as Proposals
  participant F as Form
  participant H as Patch History

  U->>E: Edit evidence
  U->>AI: Generate proposals
  AI->>P: Field suggestions
  U->>P: Apply arrow
  P->>F: Update field
  P->>H: Record patch
  U->>H: Undo / Redo
  H->>F: Restore value
```

---

## Draft Groups

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Draft: add evidence
  Draft --> Attached: attach to record
  Attached --> Archived
  Archived --> [*]
```

---

## Philosophy

AI suggests.  
Humans commit.  
Every value has a receipt.
