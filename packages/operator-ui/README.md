<!-- Template-inspired header with badges and a succinct description. -->

# @operator/ui

> React components and hooks for the operator user interface

This package contains reusable React components and hooks implementing the evidence operator UI. It depends on
`@operator/core` and `@operator/store` but does not import any database or AI libraries. See `src/index.tsx`
for the entry point and placeholder implementation.

## Storybook Testing Guide

How to run and use each story to test the component system.

---

### Starting Storybook

```bash
cd packages/operator-ui
pnpm storybook
```

> [GO TO STORYBOOK-->](http://localhost:6006) _No server needed for most stories._

---

### Story Index

#### Testing/PatchHistory

**What it tests:** The core apply → undo loop. Verifies that applying a proposal writes a patch to the store
and that undo correctly rolls the field back.

#### ApplyAndUndo

The main patch test. Has two pre-seeded evidence items and a live patch log panel on the right.

1. The editor opens with an empty equipment record
2. Click **"Asset label (OCR)"** in the evidence panel — 4 proposals appear (model, manufacturer, serial,
   category)
3. Click **Apply** on any proposal — the field fills in the form and a patch entry appears in the right panel
   showing `— → "value"`
4. Apply a few more — each one stacks in the log with before/after values and a green `proposal` badge
5. Click **↩ Undo** on any patch — the field rolls back to its previous value and an inverted patch appears at
   the top of the log
6. Now click **"Repair note"** — 2 more proposals appear including a `/model` override
7. Apply the model override — you'll see `/model` appear twice in the patch log (original + override)
8. Undo the override — model rolls back to the first value

**What to verify:**

- Patches appear immediately when applied
- Before values are correct (not all showing `—`)
- Undo rolls the form field back visually
- Undo is traceable — it appends a new patch rather than deleting the old one

#### PreApplied

Same setup but all 4 label proposals are pre-applied on load. Start here if you want to test undo without
clicking through the apply flow first.

---

### Equipment/OperatorEditor (EquipmentDemo)

All stories use the equipment schema (serialNumber, model, manufacturer, category, status, location,
purchaseDate, warrantyExpiry, notes).

#### AssetLabelScan

Simulates OCR output from a physical asset tag. All 4 proposals are High confidence. Good for testing the
happy path — clear evidence, clean field values.

1. Click the evidence item to select it
2. Proposals appear in the middle pane
3. Apply individually or use **Apply All**

#### PurchaseOrderText

Richer evidence — a pasted purchase order. Tests that the proposal pane filters out fields already filled in.
The record has manufacturer/model pre-filled, so those proposals don't appear even though the evidence
contains them.

**What to verify:** Pre-filled fields are not proposed again.

#### VoiceNote

Transcribed audio note from a field tech. Conversational text, mixed confidence. Tests that Low/Medium
proposals display correctly and that the excerpt makes sense against the evidence.

#### PreFilledWithGaps

Record already has some fields filled. Only missing fields appear as proposals.

**What to verify:** The proposals pane shows 3 proposals (not 7). Existing values are suppressed correctly.

#### EmptyNewRecord

Blank state before any evidence is selected.

**What to verify:** The empty state message shows correctly. No proposals appear until an evidence item is
clicked.

#### LiveApi ⚠️ Requires server

Connects to a real running api-server and calls GPT-4o-mini for real proposals.

**Setup:**

```bash
# 1. Create packages/operator-api-server/.env
OPENAI_API_KEY=sk-...

# 2. Create packages/operator-ui/.env
VITE_API_URL=http://localhost:3001

# 3. Terminal 1 — API server
pnpm --filter @operator/api-server start

# 4. Terminal 2 — Storybook
pnpm --filter @operator/ui dev:sb

# 5. Restart Storybook (picks up the .env change)
```

**To test:**

1. Open the story — you get a blank record with no evidence
2. Add an evidence group (auto-created as "Notes")
3. Paste any text about equipment into the text area and click **+ Add**
4. Click the evidence item — real proposals come back in ~2s from GPT-4o-mini
5. Apply proposals and verify they match what's in your text

---

### Evidence/VoiceRecordButton

Tests the audio recording → transcription flow.

#### MockTranscription

No server needed. Click the button to start recording (mic indicator appears in your browser tab), click again
to stop. After ~1.2 seconds a mock transcript appears as a new evidence item in the group.

**What to verify:**

- Button state changes: idle → recording (red dot + pulsing border) → transcribing (spinner) → idle
- New evidence item appears with a timestamped title like "Voice note 14:32"
- Mic indicator in the browser tab disappears after stopping

**Note:** Browser will ask for microphone permission on first click.

#### RealWhisper ⚠️ Requires server

Same flow but sends real audio to OpenAI Whisper. Requires the server running with `OPENAI_API_KEY` set (same
setup as LiveApi above).

---

### Records/EquipmentManagement (RecordsWorkflow)

Full app-like workflow: a records list on the left, editor on the right. Tests navigation between records.

1. Click a record in the list to open it in the editor
2. Edit fields manually via the form
3. Switch to a different record — verify the form updates
4. Create a new record using the list

---

### OperatorEditor

Generic editor stories using a patient intake schema (not equipment). Tests the component in isolation.

#### Empty

Blank editor, no record ID, no evidence. Tests the loading and empty states.

#### WithExistingData

Pre-loaded with a record and evidence items. Tests that existing data renders correctly in the form.

---

## What doesn't need the server

Everything except the two stories marked ⚠️:

| Story                               | Needs server        |
| ----------------------------------- | ------------------- |
| PatchHistory/ApplyAndUndo           | ❌                  |
| PatchHistory/PreApplied             | ❌                  |
| Equipment/AssetLabelScan            | ❌                  |
| Equipment/PurchaseOrderText         | ❌                  |
| Equipment/VoiceNote                 | ❌                  |
| Equipment/PreFilledWithGaps         | ❌                  |
| Equipment/EmptyNewRecord            | ❌                  |
| Equipment/LiveApi                   | ✅ + OPENAI_API_KEY |
| VoiceRecordButton/MockTranscription | ❌                  |
| VoiceRecordButton/RealWhisper       | ✅ + OPENAI_API_KEY |
| Records/EquipmentManagement         | ❌                  |
| OperatorEditor/Empty                | ❌                  |
| OperatorEditor/WithExistingData     | ❌                  |

---

## Adding text evidence quickly

In any story with the evidence panel, you no longer need to type a title. Just:

1. Paste your text into the text area
2. Click **+ Add** (or press ⌘↵ / Ctrl↵)
3. The item gets a timestamped title automatically ("Note 14:32")
4. Click the item to select it and trigger proposals

The evidence panel also auto-creates a "Notes" group on first load so you never need to create one manually
for a single-group workflow.
