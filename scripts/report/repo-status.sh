#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
GRAY='\033[0;90m'
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

print_section "Repository"
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    current_branch="$(git branch --show-current 2> /dev/null || true)"
    [ -n "$current_branch" ] || current_branch="detached"
    print_kv "branch" "$current_branch"

    repo_remote="$(git remote get-url origin 2> /dev/null || echo "none")"
    print_kv "origin" "$repo_remote"

    if git diff --quiet && git diff --cached --quiet; then
        repo_status="clean"
    else
        repo_status="dirty"
    fi
    print_status "REPO status" "$repo_status"

    staged_count="$(git diff --cached --name-only | wc -l | tr -d ' ')"
    unstaged_count="$(git diff --name-only | wc -l | tr -d ' ')"
    untracked_count="$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')"
    total_tracked_files="$(git ls-files | wc -l | tr -d ' ')"
    total_dirty_files="$(git status --porcelain | wc -l | tr -d ' ')"
    print_kv "total tracked files" "$total_tracked_files"
    print_kv "total dirty files" "$total_dirty_files"
    print_kv "staged files" "$staged_count"
    print_kv "unstaged files" "$unstaged_count"
    print_kv "untracked files" "$untracked_count"

    upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2> /dev/null || true)"
    if [ -n "$upstream" ]; then
        ahead_behind="$(git rev-list --left-right --count "$upstream...HEAD" 2> /dev/null || echo "0 0")"
        behind_count="${ahead_behind%% *}"
        ahead_count="${ahead_behind##* }"
        print_kv "upstream" "$upstream"
        print_kv "ahead" "$ahead_count"
        print_kv "behind" "$behind_count"
    else
        print_kv "upstream" "not set"
    fi

    last_commit="$(git log -1 --pretty=format:'%h %ad %s' --date=iso 2> /dev/null || echo "none")"
    print_kv "last commit" "$last_commit"

    if [ "$repo_status" = "dirty" ]; then
        print_section "Dirty File Preview"
        git status --short | head -n 20
    fi
else
    print_kv "git" "not a repository"
fi
