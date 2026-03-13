# Operator Editor Issue Spec

This document is the planning spec for the example issue set. Each section maps directly to the new issue system:

- `type:*`
- `scope:*`
- optional `category:*`
- optional `domain:*`

The bulk script in `scripts/issues/seed-issues.sh` should stay aligned with this file.

---

## ui: dynamic table view

Type: `feature`
Scope: `ui`
Domain: `ui`

### Summary

Provide a table-based view of all form fields generated dynamically from the schema. The table should give operators a compact, filterable overview of record data without opening the full form pane.

### Requirements

- [ ] Show all schema fields as table columns
- [ ] Generate table dynamically from schema resolver
- [ ] Provide compact overview of record data
- [ ] Add filter / search
- [ ] Support editable cells (future)
- [ ] Allow users to show/hide columns
- [ ] Allow users to reorder columns
- [ ] Allow configurable visible fields for different workflows

### Open Questions

- What is the preferred column sort order: schema order or alphabetical?

### Notes

Priority: Medium

---

## core: dictionary merge strategy for open-ended fields

Type: `refactor`
Scope: `core`
Domain: `schema-form`

### Summary

The current proposal system assumes REPLACE behavior, which does not work well for dictionary fields. A merge strategy is needed.

### Requirements

- [ ] Define strategy for dictionary proposals (REPLACE vs MERGE vs PATCH)
- [ ] Evaluate REPLACE vs MERGE vs PATCH behavior per field type
- [ ] Update UI to reflect merge strategy
- [ ] Document the chosen strategy in the schema authoring guide

### Open Questions

- Should merge strategy be opt-in per field via a JSON Schema keyword?
- How should conflicts be surfaced to the operator?

### Notes

Priority: Medium

---

## ui: patch history panel redesign

Type: `feature`
Scope: `ui`
Domain: `patch-history`

### Summary

Undo does not update the history panel correctly, and patch lists become confusing when large. The history panel needs a redesign.

### Requirements

- [ ] Investigate grouping patches by field
- [ ] Explore deriving history from form state diffs
- [ ] Add fuzzy distance filtering for noisy edits
- [ ] Evaluate save-button model vs live patch generation
- [ ] Fix undo not updating history correctly

### Open Questions

- Should history be per-field or global?
- Is a save-button model better than live patch generation for this use case?

### Notes

Priority: Medium

---

## ui: evidence system improvements

Type: `feature`
Scope: `ui`
Domain: `evidence`

### Summary

The evidence item editor is missing several quality-of-life controls: edit, expand, save indicator, delete with confirmation, reorder, star or rating, whitespace cleanup, and propose buttons.

### Requirements

- [ ] Add Edit button
- [ ] Add expand editor
- [ ] Add save / unsaved indicator
- [ ] Add delete button with confirmation
- [ ] Add reorder arrow (UP only)
- [ ] Add star / rating control
- [ ] Add cleanup tool for whitespace
- [ ] Add propose single button
- [ ] Add propose group button
- [ ] Add checkbox selection

### Open Questions

- Should star rating be 1-5 or a simple priority toggle?

### Notes

Evidence item structure: title, text body, optional attachment.
Priority: Medium

---

## ui: proposal system improvements

Type: `feature`
Scope: `ui`
Domain: `proposals`

### Summary

Proposals need grouping by form field label, deduplication via fuzzy comparison, apply-hides-proposal behavior, ranking, and provenance back to source evidence.

### Requirements

- [ ] Group proposals by form field label
- [ ] Hide duplicates using fuzzy comparison
- [ ] Apply should hide proposal instead of deleting
- [ ] Add ranking / star inside proposal group
- [ ] Maintain reference to source evidence

### Open Questions

- What fuzzy threshold should be used for duplicate detection?

### Notes

Proposal item rules: not editable, title = form field label, value = suggestion.
Priority: Medium

---

## ui: evidence groups

Type: `feature`
Scope: `ui`
Domain: `evidence`

### Summary

Evidence groups need editable titles, collapse or expand, delete with confirmation, select-all-children, default naming, and optional reorder.

### Requirements

- [ ] Editable group title
- [ ] Collapse / expand groups
- [ ] Delete group with confirmation
- [ ] Select all children
- [ ] Default name: Group <number>
- [ ] Reorder groups (optional)

### Open Questions

- Should deleting a group also delete its items, or move them to an ungrouped section?

### Notes

Priority: Medium

---

## ui: evidence attachment system

Type: `feature`
Scope: `ui`
Domain: `attachments`

### Summary

Each evidence item supports one attachment. The attachment text becomes the evidence body. Six attachment types are planned: NOTE, TEXT FILE, PDF, WEB SCRAPE, IMAGE OCR, VOICE MEMO.

### Requirements

- [ ] Add Add-Evidence menu with attachment type picker
- [ ] Add icons for each attachment type
- [ ] Implement extraction pipelines (OCR, PDF, scrape, transcription)

### Open Questions

- Should multi-attachment support be considered in the data model even if the UI limits to one?

### Notes

Rules: one attachment per evidence item; attachment text becomes evidence body.
Supported types: NOTE, TEXT FILE, PDF, WEB SCRAPE, IMAGE OCR, VOICE MEMO.
Priority: Medium

---

## api-server: fix storybook cors failure for proposals endpoint

Type: `bug`
Scope: `api-server`
Category: `dx`
Domain: `dev-environment`

### Summary

The API server does not return correct CORS headers, causing Cross-Origin Request Blocked errors in the browser when Storybook calls `/v1/proposals/from-evidence`.

### Requirements

- [ ] Verify server CORS configuration
- [ ] Confirm preflight OPTIONS behavior returns correct headers
- [ ] Ensure error responses (4xx/5xx) include CORS headers
- [ ] Test from Storybook
- [ ] Document allowed dev origins in `ENVIRONMENTS.md`

### Open Questions

- Should wildcard `*` be allowed in dev, or should origins be explicitly listed?

### Notes

Observed error: missing `Access-Control-Allow-Origin` header on `/v1/proposals/from-evidence`; observed status code `401`.
Priority: Medium
