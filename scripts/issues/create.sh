#!/usr/bin/env bash
# Add a single issue to the repo.
# Usage: pnpm exec scripts/issues/create.sh \
#          --title "ui: my issue" \
#          --type feature \
#          --scope ui \
#          --summary "Short desc" \
#          [--category build] \
#          [--domain evidence] \
#          [--requirements "- [ ] task"] \
#          [--questions "..."] \
#          [--notes "..."]
#
# type   : bug | feature | task | refactor | docs | chore | idea
# scope  : root | repo | scripts | playground | adapter-drizzle |
#          adapter-local | api-client | api-server | core | store | ui
# category (optional): build | ci | deps | dx | security | perf
# domain   (optional): ui | evidence | proposals | patch-history |
#                      attachments | schema-form | api | dev-environment | storybook
#
# Requires: gh CLI authenticated with issues:write scope.

set -euo pipefail

# shellcheck source=../lib/sh-logger.sh
source "$(dirname "$0")/../lib/sh-logger.sh"
# shellcheck source=./lib-gh-issues.sh
source "$(dirname "$0")/lib-gh-issues.sh"

REPO="$(gh repo view --json nameWithOwner --jq '.nameWithOwner')"

# ── arg parsing ───────────────────────────────────────────────────────────────

TITLE=""
TYPE=""
SCOPE=""
CATEGORY=""
DOMAIN=""
SUMMARY=""
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
            TYPE="$2"
            shift 2
            ;;
        --scope)
            SCOPE="$2"
            shift 2
            ;;
        --category)
            CATEGORY="$2"
            shift 2
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --summary)
            SUMMARY="$2"
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

if [[ -z "$TITLE" || -z "$TYPE" || -z "$SCOPE" || -z "$SUMMARY" ]]; then
    err "--title, --type, --scope, and --summary are required."
    echo ""
    echo "Usage: pnpm exec scripts/issues/create.sh \\"
    echo "  --title \"ui: my issue\" \\"
    echo "  --type feature \\"
    echo "  --scope ui \\"
    echo "  --summary \"Short description\" \\"
    echo "  [--category build] \\"
    echo "  [--domain evidence] \\"
    echo "  [--requirements \"- [ ] task\"] \\"
    echo "  [--questions \"...\"] \\"
    echo "  [--notes \"...\"]"
    exit 1
fi

# ── validate type and scope ───────────────────────────────────────────────────

valid_types="bug feature task refactor docs chore idea"
valid_scopes="root repo scripts playground adapter-drizzle adapter-local api-client api-server core store ui"
valid_categories="build ci deps dx security perf"
valid_domains="ui evidence proposals patch-history attachments schema-form api dev-environment storybook"

validate_value() {
    local field="$1" value="$2" allowed="$3"
    if ! echo "$allowed" | grep -qw "$value"; then
        err "Invalid --${field} '${value}'. Allowed: ${allowed}"
        exit 1
    fi
}

validate_value "type" "$TYPE" "$valid_types"
validate_value "scope" "$SCOPE" "$valid_scopes"
[[ -n "$CATEGORY" ]] && validate_value "category" "$CATEGORY" "$valid_categories"
[[ -n "$DOMAIN" ]] && validate_value "domain" "$DOMAIN" "$valid_domains"

# ── build label list ──────────────────────────────────────────────────────────

LABELS="type:${TYPE},scope:${SCOPE}"
[[ -n "$CATEGORY" ]] && LABELS="${LABELS},category:${CATEGORY}"
[[ -n "$DOMAIN" ]] && LABELS="${LABELS},domain:${DOMAIN}"

# ── build body ────────────────────────────────────────────────────────────────

BODY="## Summary
${SUMMARY}"

[[ -n "$REQUIREMENTS" ]] && BODY="${BODY}

## Requirements
${REQUIREMENTS}"

[[ -n "$QUESTIONS" ]] && BODY="${BODY}

## Open Questions
${QUESTIONS}"

[[ -n "$NOTES" ]] && BODY="${BODY}

## Notes
${NOTES}"

# ── create issue ──────────────────────────────────────────────────────────────

log "Creating issue"
info "repo=${REPO}"
info "labels=${LABELS}"

ISSUE_URL=$(create_issue "$TITLE" "$LABELS" "$BODY")
ISSUE_NUMBER="${ISSUE_URL##*/}"

success "issue created"
info "title=${TITLE}"
info "number=#${ISSUE_NUMBER}"
info "url=${ISSUE_URL}"
