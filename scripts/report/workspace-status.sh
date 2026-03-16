#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "${repo_root}/scripts/lib/sh-logger.sh"

section "WORKSPACE:: OUTDATED DEPENDENCIES" "$YELLOW"
if ! pnpm outdated -r; then
    subheader "TODO: package diff reporting in github action - move to here" "$CYAN"
fi
