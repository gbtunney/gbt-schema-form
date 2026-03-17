#!/usr/bin/env bash
# Creates labels and issues for the Operator Editor repository.
# Usage: pnpm exec scripts/issues/seed-issues.sh
#
# Requires: gh CLI authenticated with issues:write scope.

set -euo pipefail

# shellcheck source=../lib/sh-logger.sh
source "$(dirname "$0")/../lib/sh-logger.sh"
# shellcheck source=./repo-labels.sh
source "$(dirname "$0")/repo-labels.sh"

SCRIPT_DIR="$(dirname "$0")"

create_example_issue() {
    local title="$1"
    local type="$2"
    local scope="$3"
    local category="$4"
    local domain="$5"
    local summary="$6"
    local requirements="$7"
    local questions="$8"
    local notes="$9"

    local args=(
        --title "$title"
        --type "$type"
        --scope "$scope"
        --summary "$summary"
        --requirements "$requirements"
    )

    [[ -n "$category" ]] && args+=(--category "$category")
    [[ -n "$domain" ]] && args+=(--domain "$domain")
    [[ -n "$questions" ]] && args+=(--questions "$questions")
    [[ -n "$notes" ]] && args+=(--notes "$notes")

    bash "$SCRIPT_DIR/create.sh" "${args[@]}"
}

create_repo_labels

# -- 2. create issues ----------------------------------------------------------

log "Creating issues"

create_example_issue \
    "ui: dynamic table view" \
    "feature" \
    "ui" \
    "" \
    "ui" \
    "Provide a table-based view of all form fields generated dynamically from the schema. The table should give operators a compact, filterable overview of record data without opening the full form pane." \
    $'- [ ] Show all schema fields as table columns\n- [ ] Generate table dynamically from schema resolver\n- [ ] Provide compact overview of record data\n- [ ] Add filter / search\n- [ ] Support editable cells (future)\n- [ ] Allow users to show/hide columns\n- [ ] Allow users to reorder columns\n- [ ] Allow configurable visible fields for different workflows' \
    $'- What is the preferred column sort order: schema order or alphabetical?' \
    "Priority: Medium"

create_example_issue \
    "core: dictionary merge strategy for open-ended fields" \
    "refactor" \
    "core" \
    "" \
    "schema-form" \
    "The current proposal system assumes REPLACE behavior, which does not work well for dictionary (open-ended map) fields. A merge strategy is needed." \
    $'- [ ] Define strategy for dictionary proposals (REPLACE vs MERGE vs PATCH)\n- [ ] Evaluate REPLACE vs MERGE vs PATCH behavior per field type\n- [ ] Update UI to reflect merge strategy\n- [ ] Document the chosen strategy in the schema authoring guide' \
    $'- Should merge strategy be opt-in per field via a JSON Schema keyword?\n- How should conflicts be surfaced to the operator?' \
    "Priority: Medium"

create_example_issue \
    "ui: patch history panel redesign" \
    "feature" \
    "ui" \
    "" \
    "patch-history" \
    "Undo does not update the history panel correctly, and patch lists become confusing when large. The history panel needs a redesign." \
    $'- [ ] Investigate grouping patches by field\n- [ ] Explore deriving history from form state diffs\n- [ ] Add fuzzy distance filtering for noisy edits\n- [ ] Evaluate save-button model vs live patch generation\n- [ ] Fix undo not updating history correctly' \
    $'- Should history be per-field or global?\n- Is a save-button model better than live patch generation for this use case?' \
    "Priority: Medium"

create_example_issue \
    "ui: evidence system improvements" \
    "feature" \
    "ui" \
    "" \
    "evidence" \
    "The evidence item editor is missing several quality-of-life controls: edit, expand, save indicator, delete with confirmation, reorder, star/rating, whitespace cleanup, and propose buttons." \
    $'- [ ] Add Edit button\n- [ ] Add expand editor\n- [ ] Add save / unsaved indicator\n- [ ] Add delete button with confirmation\n- [ ] Add reorder arrow (UP only)\n- [ ] Add star / rating control\n- [ ] Add cleanup tool for whitespace\n- [ ] Add propose single button\n- [ ] Add propose group button\n- [ ] Add checkbox selection' \
    $'- Should star rating be 1-5 or a simple priority toggle?' \
    $'Evidence item structure: title, text body, optional attachment.\nPriority: Medium'

create_example_issue \
    "ui: proposal system improvements" \
    "feature" \
    "ui" \
    "" \
    "proposals" \
    "Proposals need grouping by form field label, deduplication via fuzzy comparison, apply-hides-proposal behavior, ranking, and provenance back to source evidence." \
    $'- [ ] Group proposals by form field label\n- [ ] Hide duplicates using fuzzy comparison\n- [ ] Apply should hide proposal instead of deleting\n- [ ] Add ranking / star inside proposal group\n- [ ] Maintain reference to source evidence' \
    $'- What fuzzy threshold should be used for duplicate detection?' \
    $'Proposal item rules: not editable, title = form field label, value = suggestion.\nPriority: Medium'

create_example_issue \
    "ui: evidence groups" \
    "feature" \
    "ui" \
    "" \
    "evidence" \
    "Evidence groups need editable titles, collapse/expand, delete with confirmation, select-all-children, default naming, and optional reorder." \
    $'- [ ] Editable group title\n- [ ] Collapse / expand groups\n- [ ] Delete group with confirmation\n- [ ] Select all children\n- [ ] Default name: Group <number>\n- [ ] Reorder groups (optional)' \
    $'- Should deleting a group also delete its items, or move them to an ungrouped section?' \
    "Priority: Medium"

create_example_issue \
    "ui: evidence attachment system" \
    "feature" \
    "ui" \
    "" \
    "attachments" \
    "Each evidence item supports one attachment. The attachment text becomes the evidence body. Six attachment types are planned: NOTE, TEXT FILE, PDF, WEB SCRAPE, IMAGE OCR, VOICE MEMO." \
    $'- [ ] Add Add-Evidence menu with attachment type picker\n- [ ] Add icons for each attachment type\n- [ ] Implement extraction pipelines (OCR, PDF, scrape, transcription)' \
    $'- Should multi-attachment support be considered in the data model even if the UI limits to one?' \
    $'Rules: one attachment per evidence item; attachment text becomes evidence body.\nSupported types: NOTE, TEXT FILE, PDF, WEB SCRAPE, IMAGE OCR, VOICE MEMO.\nPriority: Medium'

create_example_issue \
    "api-server: fix storybook cors failure for proposals endpoint" \
    "bug" \
    "api-server" \
    "dx" \
    "dev-environment" \
    "The API server does not return correct CORS headers, causing Cross-Origin Request Blocked errors in the browser when Storybook calls /v1/proposals/from-evidence." \
    $'- [ ] Verify server CORS configuration\n- [ ] Confirm preflight OPTIONS behavior returns correct headers\n- [ ] Ensure error responses (4xx/5xx) include CORS headers\n- [ ] Test from Storybook (dev origin)\n- [ ] Document allowed dev origins in ENVIRONMENTS.md' \
    $'- Should wildcard * be allowed in dev, or should origins be explicitly listed?' \
    $'Observed error: missing Access-Control-Allow-Origin header on /v1/proposals/from-evidence; observed status code 401.\nPriority: Medium'

# -- 4. done ------------------------------------------------------------------

log "Done"
success "Created the example issue set using create.sh"
