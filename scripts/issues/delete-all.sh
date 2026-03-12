#!/usr/bin/env bash

# Delete all repo issues and/or labels.
# Usage:
#   pnpm exec scripts/issues/delete-all.sh labels
#   pnpm exec scripts/issues/delete-all.sh issues
#   pnpm exec scripts/issues/delete-all.sh all
#   pnpm exec scripts/issues/delete-all.sh all --yes
#
# Optional:
#   REPO="owner/name" pnpm exec scripts/issues/delete-all.sh all

set -euo pipefail

# shellcheck source=../lib/sh-logger.sh
source "$(dirname "$0")/../lib/sh-logger.sh"

REPO="${REPO:-gbtunney/gbt-schema-form}"
MODE="${1:-all}"
ASSUME_YES="${2:-}"

confirm_delete() {
    if [[ "$ASSUME_YES" == "--yes" ]]; then
        info "Confirmation bypassed via --yes"
        return
    fi

    local response
    warn "About to delete '${MODE}' in repo '${REPO}'."
    step "Type 'yes' to continue"
    read -r response
    if [[ "$response" != "yes" ]]; then
        warn "Aborted."
        exit 1
    fi
}

delete_all_labels() {
    local label_names
    label_names="$(gh label list -R "$REPO" --limit 1000 --json name --jq '.[].name')"

    if [[ -z "$label_names" ]]; then
        info "No labels found to delete."
        return
    fi

    log "Deleting labels"
    while IFS= read -r name; do
        [[ -z "$name" ]] && continue
        step "Deleting label: $name"
        gh label delete -R "$REPO" "$name" --yes
    done <<< "$label_names"
    success "Labels deleted"
}

delete_all_issues() {
    local issue_numbers
    issue_numbers="$(gh issue list -R "$REPO" --limit 1000 --state all --json number --jq '.[].number')"

    if [[ -z "$issue_numbers" ]]; then
        info "No issues found to delete."
        return
    fi

    log "Deleting issues"
    while IFS= read -r issue_number; do
        [[ -z "$issue_number" ]] && continue
        step "Deleting issue #$issue_number"
        gh issue delete "$issue_number" -R "$REPO" --yes
    done <<< "$issue_numbers"
    success "Issues deleted"
}

case "$MODE" in
    labels)
        confirm_delete
        delete_all_labels
        ;;
    issues)
        confirm_delete
        delete_all_issues
        ;;
    all)
        confirm_delete
        delete_all_issues
        delete_all_labels
        ;;
    *)
        err "Usage: pnpm exec scripts/issues/delete-all.sh [labels|issues|all] [--yes]"
        exit 1
        ;;
esac
