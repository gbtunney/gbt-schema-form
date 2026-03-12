#!/usr/bin/env bash
# Add a single issue to the repo using the Operator Editor Work Item template.
# Usage: bash scripts/issues/create.sh --title "UI: My issue" --type Feature --subsystem UI \
#          --package "@operator/ui" --summary "Short desc" \
#          [--why "..."] [--requirements "- [ ] task"] [--questions "..."] [--notes "..."]
#
# Requires: gh CLI authenticated with issues:write scope.
# Optional: set ADD_TO_PROJECT=false to skip project add (default: true).

set -euo pipefail

# shellcheck source=../lib/sh-logger.sh
source "$(dirname "$0")/../lib/sh-logger.sh"
# shellcheck source=./lib-gh-issues.sh
source "$(dirname "$0")/lib-gh-issues.sh"

REPO="$(gh repo view --json nameWithOwner --jq '.nameWithOwner')"
PROJECT_OWNER="${REPO%%/*}"
PROJECT_ID="8"
ADD_TO_PROJECT="${ADD_TO_PROJECT:-true}"

# ── arg parsing ───────────────────────────────────────────────────────────────

TITLE=""
ISSUE_TYPE=""
SUBSYSTEM=""
PACKAGE="Not sure"
SUMMARY=""
WHY=""
REQUIREMENTS=""
QUESTIONS=""
NOTES=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --title)
            TITLE="$2"
            shift 2
            ;;
        --type)
            ISSUE_TYPE="$2"
            shift 2
            ;;
        --subsystem)
            SUBSYSTEM="$2"
            shift 2
            ;;
        --package)
            PACKAGE="$2"
            shift 2
            ;;
        --summary)
            SUMMARY="$2"
            shift 2
            ;;
        --why)
            WHY="$2"
            shift 2
            ;;
        --requirements)
            REQUIREMENTS="$2"
            shift 2
            ;;
        --questions)
            QUESTIONS="$2"
            shift 2
            ;;
        --notes)
            NOTES="$2"
            shift 2
            ;;
        *)
            err "Unknown arg: $1"
            exit 1
            ;;
    esac
done

if [[ -z "$TITLE" || -z "$ISSUE_TYPE" || -z "$SUBSYSTEM" || -z "$SUMMARY" ]]; then
    err "--title, --type, --subsystem, and --summary are required."
    echo ""
    echo "Usage: bash scripts/issues/create.sh \\"
    echo "  --title \"UI: My issue\" \\"
    echo "  --type Feature \\"
    echo "  --subsystem UI \\"
    echo "  --summary \"Short description\" \\"
    echo "  [--package \"@operator/ui\"] \\"
    echo "  [--why \"...\"] \\"
    echo "  [--requirements \"- [ ] task\"] \\"
    echo "  [--questions \"...\"] \\"
    echo "  [--notes \"...\"]"
    exit 1
fi

# ── derive label from type ────────────────────────────────────────────────────

label_for_type() {
    case "$1" in
        Feature) echo "feature" ;;
        Bug) echo "bug" ;;
        "UX Improvement") echo "ux" ;;
        Architecture) echo "architecture" ;;
        "Dev Environment") echo "dev-env" ;;
        Documentation) echo "documentation" ;;
        *) echo "" ;;
    esac
}

label_for_subsystem() {
    case "$1" in
        UI) echo "ui" ;;
        "Evidence System") echo "evidence" ;;
        "Proposal System") echo "proposal" ;;
        "Patch / History") echo "history" ;;
        Attachments) echo "attachments" ;;
        "Schema / Form") echo "schema" ;;
        API) echo "api" ;;
        "Dev Environment") echo "dev-env" ;;
        Storybook) echo "storybook" ;;
        *) echo "" ;;
    esac
}

TYPE_LABEL="$(label_for_type "$ISSUE_TYPE")"
SUBSYSTEM_LABEL="$(label_for_subsystem "$SUBSYSTEM")"

LABELS=""
[[ -n "$TYPE_LABEL" ]] && LABELS="$TYPE_LABEL"
[[ -n "$SUBSYSTEM_LABEL" && "$SUBSYSTEM_LABEL" != "$TYPE_LABEL" ]] && LABELS="${LABELS:+$LABELS,}$SUBSYSTEM_LABEL"

# ── build body ────────────────────────────────────────────────────────────────

BODY="## Issue Type
${ISSUE_TYPE}

## Subsystem
${SUBSYSTEM}

## Package (Monorepo)
${PACKAGE}

## Summary
${SUMMARY}"

[[ -n "$WHY" ]] && BODY="${BODY}

## Why is this needed?
${WHY}"

[[ -n "$REQUIREMENTS" ]] && BODY="${BODY}

## Requirements / Tasks
${REQUIREMENTS}"

[[ -n "$QUESTIONS" ]] && BODY="${BODY}

## Open Questions
${QUESTIONS}"

[[ -n "$NOTES" ]] && BODY="${BODY}

## Additional Notes
${NOTES}"

# ── create issue ──────────────────────────────────────────────────────────────

log "Creating issue"
step "${TITLE}"
info "repo=${REPO}  labels=${LABELS:-none}"

if [[ -n "$LABELS" ]]; then
    ISSUE_URL=$(create_issue "$TITLE" "$LABELS" "$BODY")
else
    ISSUE_URL=$(gh issue create \
        --repo "$REPO" \
        --title "$TITLE" \
        --body "$BODY")
fi

ISSUE_NUMBER="${ISSUE_URL##*/}"

success "issue created"
info "title=${TITLE}"
info "number=#${ISSUE_NUMBER}"
info "url=${ISSUE_URL}"

# ── optionally add to project ─────────────────────────────────────────────────

if [[ "$ADD_TO_PROJECT" == "true" ]]; then
    add_to_project "$ISSUE_URL" "$PROJECT_ID"
    success "added to project #${PROJECT_ID}"
else
    info "skipping project add (ADD_TO_PROJECT=false)"
fi
