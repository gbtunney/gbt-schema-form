#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
GRAY='\033[0;90m'
RESET='\033[0m'

# todo: add the section bars to reusable function
print_section() {
    printf "\n${YELLOW}=== %s ===${RESET}\n" "$1"
}
print_line() {
    printf "\n${CYAN}%s${RESET}\n" "$1"
}

print_section "WORKSPACE:: OUTDATED DEPENDENCIES"
if ! pnpm outdated -r; then
    print_line "TODO: package diff reporting in github action - move to here"
fi
