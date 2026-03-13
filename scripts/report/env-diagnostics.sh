#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
GRAY='\033[0;90m'
BOLD='\033[1m'
RESET='\033[0m'

print_section() {
    printf "\n${CYAN}=== %s ===${RESET}\n" "$1"
}

print_kv() {
    printf "${GRAY}%-24s${RESET} %s\n" "$1" "$2"
}

print_status() {
    local key="$1"
    local value="$2"
    local color="$GRAY"
    if [ "$value" = "clean" ]; then
        color="$GREEN"
    elif [ "$value" = "dirty" ]; then
        color="$YELLOW"
    elif [ "$value" = "command failed (non-blocking)" ]; then
        color="$YELLOW"
    elif [ "$value" = "pnpm not installed" ]; then
        color="$RED"
    fi
    printf "${GRAY}%-24s${RESET} ${color}%s${RESET}\n" "$key" "$value"
}

command_version() {
    local command_name="$1"
    local version_flag="${2:---version}"
    if command -v "$command_name" > /dev/null 2>&1; then
        "$command_name" "$version_flag" 2> /dev/null | head -n 1
    else
        echo "not installed"
    fi
}

print_section "Environment"
print_kv "timestamp" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
print_kv "cwd" "$(pwd)"
print_kv "os" "$(uname -srvmo 2> /dev/null || uname -a)"
print_kv "shell" "${SHELL:-unknown}"

print_section "Tool Versions"
print_kv "node" "$(command_version node -v)"
print_kv "pnpm" "$(command_version pnpm -v)"
print_kv "git" "$(command_version git --version)"
print_kv "gh" "$(command_version gh --version)"
