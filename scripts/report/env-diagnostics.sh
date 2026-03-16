#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

source "${repo_root}/scripts/lib/sh-logger.sh"

command_version() {
    local command_name="$1"
    local version_flag="${2:---version}"
    if command -v "$command_name" > /dev/null 2>&1; then
        "$command_name" "$version_flag" 2> /dev/null | head -n 1
    else
        echo "not installed"
    fi
}

section "Environment"
kv_pair "timestamp" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
kv_pair "cwd" "$(pwd)"
kv_pair "os" "$(uname -srvmo 2> /dev/null || uname -a)"
kv_pair "shell" "${SHELL:-unknown}"

section "Tool Versions"
kv_pair "node" "$(command_version node -v)"
kv_pair "pnpm" "$(command_version pnpm -v)"
kv_pair "git" "$(command_version git --version)"
kv_pair "gh" "$(command_version gh --version)"
