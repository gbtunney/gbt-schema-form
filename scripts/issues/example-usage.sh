#!/usr/bin/env bash
# Creates labels and issues for the Operator Editor repository.
# Usage: bash scripts/issues/example-usage.sh
#
# Requires: gh CLI authenticated with issues:write scope.

set -euo pipefail

# shellcheck source=../lib/sh-logger.sh
source "$(dirname "$0")/../lib/sh-logger.sh"
# shellcheck source=./lib-gh-issues.sh
source "$(dirname "$0")/lib-gh-issues.sh"

REPO="$(gh repo view --json nameWithOwner --jq '.nameWithOwner')"

# ── 1. ensure labels exist ─────────────────────────────────────────────────────
# Label system: type / scope / category / domain / utility
# Colors per group — see docs/issue-and-project-workflow.md

log "Creating labels"

# type: kind of work
create_label "type:bug"      "70cc53" "Something broken or incorrect"
create_label "type:feature"  "70cc53" "New functionality"
create_label "type:task"     "70cc53" "General development work"
create_label "type:refactor" "70cc53" "Internal code restructuring"
create_label "type:docs"     "70cc53" "Documentation work"
create_label "type:chore"    "70cc53" "Maintenance or tooling work"
create_label "type:idea"     "70cc53" "Future concept or rough improvement"

# scope: where in the monorepo
create_label "scope:root"            "6f42c1" "Workspace root scripts or config"
create_label "scope:repo"            "6f42c1" "CI, build, or cross-package work"
create_label "scope:playground"      "6f42c1" "Playground application"
create_label "scope:adapter-drizzle" "6f42c1" "Drizzle adapter"
create_label "scope:adapter-local"   "6f42c1" "Local adapter"
create_label "scope:api-client"      "6f42c1" "API client or SDK"
create_label "scope:api-server"      "6f42c1" "API server"
create_label "scope:core"            "6f42c1" "Core logic"
create_label "scope:store"           "6f42c1" "Data or state layer"
create_label "scope:ui"              "6f42c1" "UI package"

# category: cross-cutting technical area (optional)
create_label "category:build"    "0e8a16" "Build system"
create_label "category:ci"       "0e8a16" "Continuous integration"
create_label "category:deps"     "0e8a16" "Dependency management"
create_label "category:dx"       "0e8a16" "Developer experience"
create_label "category:security" "0e8a16" "Security"
create_label "category:perf"     "0e8a16" "Performance"

# domain: product or feature area (optional)
create_label "domain:ui"              "e99695" "General UI / layout"
create_label "domain:evidence"        "e99695" "Evidence system"
create_label "domain:proposals"       "e99695" "Proposal system"
create_label "domain:patch-history"   "e99695" "Patch and history"
create_label "domain:attachments"     "e99695" "Attachments"
create_label "domain:schema-form"     "e99695" "Schema and form rendering"
create_label "domain:api"             "e99695" "API layer"
create_label "domain:dev-environment" "e99695" "Developer environment"
create_label "domain:storybook"       "e99695" "Storybook"

# utility: workflow and triage helpers (optional)
create_label "utility:stub"         "fbca04" "Placeholder issue"
create_label "utility:needs-triage" "fbca04" "Needs classification"
create_label "utility:blocked"      "fbca04" "Work cannot proceed"

log "Config"
info "repo=${REPO}"

# ── 2. create issues ──────────────────────────────────────────────────────────

log "Creating issues"

# Issue 1 ─────────────────────────────────────────────────────────────────────
ISSUE_1=$(create_issue \
    "UI: Dynamic Table View" \
    "ui,feature" \
    "## Summary

Provide a table-based view of all form fields generated dynamically from the schema. The table should give operators a compact, filterable overview of record data without opening the full form pane.

## Area

UI

## Why

Operators who manage many records need to scan and compare field values at a glance. The current form-only view does not scale.

## Requirements

- [ ] Show all schema fields as table columns
- [ ] Generate table dynamically from schema resolver
- [ ] Provide compact overview of record data
- [ ] Add filter / search
- [ ] Support editable cells (future)
- [ ] Allow users to show/hide columns
- [ ] Allow users to reorder columns
- [ ] Allow configurable visible fields for different workflows

## Open Questions

- What is the preferred column sort order - schema order vs alphabetical?

## Notes

Subsystem: UI
Priority: Medium")
created "$ISSUE_1"
[ -n "$PROJECT_ID" ] && add_to_project "$ISSUE_1" "$PROJECT_ID"

# Issue 2 ─────────────────────────────────────────────────────────────────────
ISSUE_2=$(create_issue \
    "Schema: Dictionary / Open-ended fields" \
    "schema,architecture" \
    "## Summary

The current proposal system assumes REPLACE behavior, which does not work well for dictionary (open-ended map) fields. A merge strategy is needed.

## Area

Schema

## Why

Replacing a dictionary field overwrites all existing keys. Operators expect additive or patch-style updates when the field is a map.

## Requirements

- [ ] Define strategy for dictionary proposals (REPLACE vs MERGE vs PATCH)
- [ ] Evaluate REPLACE vs MERGE vs PATCH behavior per field type
- [ ] Update UI to reflect merge strategy
- [ ] Document the chosen strategy in schema authoring guide

## Open Questions

- Should merge strategy be opt-in per field via a JSON Schema keyword?
- How should conflicts be surfaced to the operator?

## Notes

Subsystem: Schema
Priority: Medium")
created "$ISSUE_2"
[ -n "$PROJECT_ID" ] && add_to_project "$ISSUE_2" "$PROJECT_ID"

# Issue 3 ─────────────────────────────────────────────────────────────────────
ISSUE_3=$(create_issue \
    "History: Patch / History Panel Redesign" \
    "history,ux" \
    "## Summary

Undo does not update the history panel correctly, and patch lists become confusing when large. The history panel needs a redesign.

## Area

History

## Why

Operators rely on history to audit and reverse changes. A broken or noisy history panel erodes trust in the undo-redo system.

## Requirements

- [ ] Investigate grouping patches by field
- [ ] Explore deriving history from form state diffs
- [ ] Add fuzzy distance filtering for noisy edits
- [ ] Evaluate save-button model vs live patch generation
- [ ] Fix undo not updating history correctly

## Open Questions

- Should history be per-field or global?
- Is a save-button model better than live patch generation for this use case?

## Notes

Subsystem: History
Priority: Medium")
created "$ISSUE_3"
[ -n "$PROJECT_ID" ] && add_to_project "$ISSUE_3" "$PROJECT_ID"

# Issue 4 ─────────────────────────────────────────────────────────────────────
ISSUE_4=$(create_issue \
    "Evidence: Evidence System Improvements" \
    "evidence,ui,ux" \
    "## Summary

The evidence item editor is missing several quality-of-life controls: edit, expand, save indicator, delete with confirmation, reorder, star/rating, whitespace cleanup, and propose buttons.

## Area

Evidence

## Why

Operators spend most of their time in the evidence pane. Missing controls slow down the workflow and reduce the quality of evidence captured.

## Requirements

Evidence item structure: title · text body · optional attachment.

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

## Open Questions

- Should star rating be 1-5 or a simple priority toggle?

## Notes

Subsystem: Evidence
Priority: Medium")
created "$ISSUE_4"
[ -n "$PROJECT_ID" ] && add_to_project "$ISSUE_4" "$PROJECT_ID"

# Issue 5 ─────────────────────────────────────────────────────────────────────
ISSUE_5=$(create_issue \
    "Proposal: Proposal System Improvements" \
    "proposal,ux" \
    "## Summary

Proposals need grouping by form field label, deduplication via fuzzy comparison, apply-hides-proposal behavior, ranking, and provenance back to source evidence.

## Area

Proposal

## Why

The current flat proposal list is hard to scan when many proposals exist. Duplicates and already-applied values create noise.

## Requirements

Proposal item rules: not editable · title = form field label · value = suggestion.

- [ ] Group proposals by form field label
- [ ] Hide duplicates using fuzzy comparison
- [ ] Apply should hide proposal instead of deleting
- [ ] Add ranking / star inside proposal group
- [ ] Maintain reference to source evidence

## Open Questions

- What fuzzy threshold should be used for duplicate detection?

## Notes

Subsystem: Proposal
Priority: Medium")
created "$ISSUE_5"
[ -n "$PROJECT_ID" ] && add_to_project "$ISSUE_5" "$PROJECT_ID"

# Issue 6 ─────────────────────────────────────────────────────────────────────
ISSUE_6=$(create_issue \
    "Evidence: Evidence Groups" \
    "evidence,ui" \
    "## Summary

Evidence groups need editable titles, collapse/expand, delete with confirmation, select-all-children, default naming, and optional reorder.

## Area

Evidence

## Why

As the number of evidence items grows, groups are the primary way operators organize their research. Without proper group management the pane becomes unworkable.

## Requirements

- [ ] Editable group title
- [ ] Collapse / expand groups
- [ ] Delete group with confirmation
- [ ] Select all children
- [ ] Default name: Group \<number\>
- [ ] Reorder groups (optional)

## Open Questions

- Should deleting a group also delete its items, or move them to an ungrouped section?

## Notes

Subsystem: Evidence
Priority: Medium")
created "$ISSUE_6"
[ -n "$PROJECT_ID" ] && add_to_project "$ISSUE_6" "$PROJECT_ID"

# Issue 7 ─────────────────────────────────────────────────────────────────────
ISSUE_7=$(create_issue \
    "Attachments: Evidence Attachment System" \
    "attachments,feature" \
    "## Summary

Each evidence item supports one attachment. The attachment text becomes the evidence body. Six attachment types are planned: NOTE, TEXT FILE, PDF, WEB SCRAPE, IMAGE OCR, VOICE MEMO.

## Area

Attachments

## Why

Operators collect evidence from many sources. A unified attachment system lets them import content directly instead of copy-pasting.

## Requirements

Rules: one attachment per evidence item · attachment text becomes evidence body.

Supported types: NOTE · TEXT FILE · PDF · WEB SCRAPE · IMAGE OCR · VOICE MEMO.

- [ ] Add Add-Evidence menu with attachment type picker
- [ ] Add icons for each attachment type
- [ ] Implement extraction pipelines (OCR, PDF, scrape, transcription)

## Open Questions

- Should multi-attachment support be considered in the data model even if the UI limits to one?

## Notes

Subsystem: Attachments
Priority: Medium")
created "$ISSUE_7"
[ -n "$PROJECT_ID" ] && add_to_project "$ISSUE_7" "$PROJECT_ID"

# Issue 8 ─────────────────────────────────────────────────────────────────────
ISSUE_8=$(create_issue \
    "Dev Environment: CORS Issue" \
    "dev-env,bug" \
    "## Summary

The API server does not return correct CORS headers, causing Cross-Origin Request Blocked errors in the browser when the UI (Storybook) calls \`/v1/proposals/from-evidence\`.

## Area

Dev Env

## Why

Developers cannot test the full proposal flow from Storybook without a working CORS configuration. This blocks local development and Codespaces workflows.

## Requirements

Observed error: Cross-Origin Request Blocked · missing \`Access-Control-Allow-Origin\` header · endpoint \`/v1/proposals/from-evidence\` · status code 401.

- [ ] Verify server CORS configuration
- [ ] Confirm preflight OPTIONS behavior returns correct headers
- [ ] Ensure error responses (4xx/5xx) include CORS headers
- [ ] Test from Storybook (dev origin)
- [ ] Document allowed dev origins in ENVIRONMENTS.md

## Open Questions

- Should wildcard \`*\` be allowed in dev, or should origins be explicitly listed?

## Notes

Subsystem: Dev Env
Priority: Medium")
created "$ISSUE_8"
[ -n "$PROJECT_ID" ] && add_to_project "$ISSUE_8" "$PROJECT_ID"

# ── 4. done ───────────────────────────────────────────────────────────────────

log "Done"
success "1. $ISSUE_1"
success "2. $ISSUE_2"
success "3. $ISSUE_3"
success "4. $ISSUE_4"
success "5. $ISSUE_5"
success "6. $ISSUE_6"
success "7. $ISSUE_7"
success "8. $ISSUE_8"
