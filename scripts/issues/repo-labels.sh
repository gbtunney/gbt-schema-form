#!/usr/bin/env bash
# Creates repository labels for the Operator Editor workflow.
# Usage:
#   pnpm exec bash scripts/issues/repo-labels.sh
#
# Optional:
#   REPO="owner/name" pnpm exec bash scripts/issues/repo-labels.sh
#
# Requires: gh CLI authenticated with issues:write scope.

set -euo pipefail

# shellcheck source=../lib/sh-logger.sh
source "$(dirname "$0")/../lib/sh-logger.sh"
# shellcheck source=./lib-gh-issues.sh
source "$(dirname "$0")/lib-gh-issues.sh"

REPO="$(gh repo view --json nameWithOwner --jq '.nameWithOwner')"

create_repo_labels() {
    log "Creating labels"

    # type: kind of work
    create_label "type:bug" "70cc53" "Something broken or incorrect"
    create_label "type:feature" "70cc53" "New functionality"
    create_label "type:task" "70cc53" "General development work"
    create_label "type:refactor" "70cc53" "Internal code restructuring"
    create_label "type:docs" "70cc53" "Documentation work"
    create_label "type:chore" "70cc53" "Maintenance or tooling work"
    create_label "type:idea" "70cc53" "Future concept or rough improvement"

    # scope: where in the monorepo
    create_label "scope:root" "6f42c1" "Workspace root scripts or config"
    create_label "scope:repo" "6f42c1" "CI, build, or cross-package work"
    create_label "scope:scripts" "6f42c1" "Generic tooling, utility scripts, or temporary helpers"
    create_label "scope:playground" "6f42c1" "Playground application"
    create_label "scope:adapter-drizzle" "6f42c1" "Drizzle adapter"
    create_label "scope:adapter-local" "6f42c1" "Local adapter"
    create_label "scope:api-client" "6f42c1" "API client or SDK"
    create_label "scope:api-server" "6f42c1" "API server"
    create_label "scope:core" "6f42c1" "Core logic"
    create_label "scope:store" "6f42c1" "Data or state layer"
    create_label "scope:ui" "6f42c1" "UI package"

    # category: cross-cutting technical area (optional)
    create_label "category:build" "0e8a16" "Build system"
    create_label "category:ci" "0e8a16" "Continuous integration"
    create_label "category:deps" "0e8a16" "Dependency management"
    create_label "category:dx" "0e8a16" "Developer experience"
    create_label "category:security" "0e8a16" "Security"
    create_label "category:perf" "0e8a16" "Performance"

    # domain: product or feature area (optional)
    create_label "domain:ui" "e99695" "General UI / layout"
    create_label "domain:evidence" "e99695" "Evidence system"
    create_label "domain:proposals" "e99695" "Proposal system"
    create_label "domain:patch-history" "e99695" "Patch and history"
    create_label "domain:attachments" "e99695" "Attachments"
    create_label "domain:schema-form" "e99695" "Schema and form rendering"
    create_label "domain:api" "e99695" "API layer"
    create_label "domain:dev-environment" "e99695" "Developer environment"
    create_label "domain:storybook" "e99695" "Storybook"

    # utility: workflow and triage helpers (optional)
    create_label "utility:stub" "fbca04" "Placeholder issue"
    create_label "utility:needs-triage" "fbca04" "Needs classification"
    create_label "utility:blocked" "fbca04" "Work cannot proceed"

    log "Config"
    info "repo=${REPO}"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
    create_repo_labels
fi
