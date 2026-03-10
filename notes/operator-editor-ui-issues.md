# Operator Editor – UI / UX Issue Planning

This document is intended to be used to generate GitHub issues for the Operator Editor project.
Each section can become one or more issues.

---

## UI: Dynamic Table View

Goal: Provide a table-based view of all form fields generated dynamically from the schema.

### Tasks

- [ ] Show all schema fields
- [ ] Generate table dynamically from schema resolver
- [ ] Provide compact overview of record data
- [ ] Add filter / search
- [ ] Support editable cells (future)
- [ ] Allow users to show/hide columns
- [ ] Allow users to reorder columns
- [ ] Allow configurable visible fields for different workflows

---

## Schema: Dictionary / Open-ended fields

Current proposal system assumes REPLACE behavior, which does not work well for dictionary fields.

### Tasks

- [ ] Define strategy for dictionary proposals
- [ ] Evaluate REPLACE vs MERGE vs PATCH behavior
- [ ] Update UI to reflect merge strategy

---

## History: Patch / History Panel Redesign

### Problems

- Undo does not update history correctly
- Patch lists become confusing when large

### Tasks

- [ ] Investigate grouping patches by field
- [ ] Explore deriving history from form state diffs
- [ ] Add fuzzy distance filtering for noisy edits
- [ ] Evaluate save-button model vs live patch generation

---

## Evidence: Evidence System Improvements

### Evidence item structure

- title
- text body
- optional attachment

### Tasks

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

---

## Proposal: Proposal System Improvements

### Tasks

- [ ] Group proposals by form field label
- [ ] Hide duplicates using fuzzy comparison
- [ ] Apply should hide proposal instead of deleting
- [ ] Add ranking / star inside proposal group
- [ ] Maintain reference to source evidence

### Proposal item rules

- Not editable
- Title = form field label
- Value = suggestion

---

## Evidence: Evidence Groups

### Tasks

- [ ] Editable group title
- [ ] Collapse / expand groups
- [ ] Delete group with confirmation
- [ ] Select all children
- [ ] Default name: Group <number>
- [ ] Reorder groups (optional)

---

## Attachments: Evidence Attachment System

### Rules

- One attachment per evidence item
- Attachment text becomes evidence body

### Supported types

- NOTE
- TEXT FILE
- PDF
- WEB SCRAPE
- IMAGE OCR
- VOICE MEMO

### Tasks

- [ ] Add Add-Evidence menu
- [ ] Add icons for attachment types
- [ ] Implement extraction pipelines

---

## Dev Environment: CORS Issue

### Observed error

- Cross-Origin Request Blocked
- Missing header: Access-Control-Allow-Origin
- Endpoint: /v1/proposals/from-evidence
- Status code observed: 401

### Tasks

- [ ] Verify server CORS configuration
- [ ] Confirm preflight OPTIONS behavior
- [ ] Ensure error responses include CORS headers
- [ ] Test from Storybook
- [ ] Document allowed dev origins
