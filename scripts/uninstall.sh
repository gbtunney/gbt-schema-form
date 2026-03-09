#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"

# Color codes
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
REDBG='\033[41m'
RESET='\033[0m'
GRAY='\033[0;90m'
log() {
    printf "\n${CYAN}=== %s ===${RESET}\n" "$1"
}

warn() {
    printf "\n${YELLOW}[warn] %s${RESET}\n" "$1"
}

critical() {
    printf "\n${REDBG}=== [WARN] %s} ===${RESET}\n" "$1"
}

info() {
    printf "${GRAY}ℹ %s${RESET}\n" "$1"
}

success() {
    printf "${GREEN}✓ %s${RESET}\n" "$1"
}

remove_if_exists() {
    local target="$1"

    if [ -e "$target" ]; then
        printf "${RED}Removing${RESET} %s\n" "$target"
        rm -rf "$target"
    else
        info "not found: $target"
    fi
}

# ============================================================================
# Repo Status Check
# ============================================================================

log "uninstall: start"
if [ ! -d "node_modules" ]; then
    critical "repo not installed"
fi

# ============================================================================
# Reset NX Cache
# ============================================================================

log "reset nx cache"
if command -v nx &> /dev/null; then
    pnpm exec nx reset || warn "nx reset failed"
else
    warn "nx not found"
fi

# ============================================================================
# Clean Build
# ============================================================================

log "clean builds"
if command -v tsc &> /dev/null; then
    pnpm run clean || warn "pnpm clean failed"
else
    warn "tsc not found"
fi

# ============================================================================
# Remove node_modules
# ============================================================================

log "remove node_modules"
MODULE_COUNT=$(find "$ROOT_DIR" -type d -name node_modules 2> /dev/null | wc -l)
if [ "$MODULE_COUNT" -gt 0 ]; then
    find "$ROOT_DIR" -type d -name node_modules -prune -print0 | while IFS= read -r -d '' dir; do
        printf "${RED}Removing${RESET} %s\n" "$dir"
        rm -rf "$dir"
    done
else
    info "no node_modules found"
fi

# ============================================================================
# Remove Lockfiles
# ============================================================================

log "remove lockfiles"
remove_if_exists "$ROOT_DIR/pnpm-lock.yaml"
remove_if_exists "$ROOT_DIR/package-lock.json"
remove_if_exists "$ROOT_DIR/yarn.lock"

printf "\n${GREEN}✨ done ✨${RESET}\n"
