#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "${repo_root}/scripts/lib/sh-logger.sh"

section "Repository"
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    current_branch="$(git branch --show-current 2> /dev/null || true)"
    [ -n "$current_branch" ] || current_branch="detached"
    kv_pair "branch" "$current_branch"

    repo_remote="$(git remote get-url origin 2> /dev/null || echo "none")"
    kv_pair "origin" "$repo_remote"

    if git diff --quiet && git diff --cached --quiet; then
        repo_status="clean"
    else
        repo_status="dirty"
    fi
    status_pair "REPO status" "$repo_status"

    staged_count="$(git diff --cached --name-only | wc -l | tr -d ' ')"
    unstaged_count="$(git diff --name-only | wc -l | tr -d ' ')"
    untracked_count="$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')"
    total_tracked_files="$(git ls-files | wc -l | tr -d ' ')"
    total_dirty_files="$(git status --porcelain | wc -l | tr -d ' ')"
    kv_pair "total tracked files" "$total_tracked_files"
    kv_pair "total dirty files" "$total_dirty_files"
    kv_pair "staged files" "$staged_count"
    kv_pair "unstaged files" "$unstaged_count"
    kv_pair "untracked files" "$untracked_count"

    upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2> /dev/null || true)"
    if [ -n "$upstream" ]; then
        ahead_behind="$(git rev-list --left-right --count "$upstream...HEAD" 2> /dev/null || echo "0 0")"
        behind_count="${ahead_behind%% *}"
        ahead_count="${ahead_behind##* }"
        kv_pair "upstream" "$upstream"
        kv_pair "ahead" "$ahead_count"
        kv_pair "behind" "$behind_count"
    else
        kv_pair "upstream" "not set"
    fi

    last_commit="$(git log -1 --pretty=format:'%h %ad %s' --date=iso 2> /dev/null || echo "none")"
    kv_pair "last commit" "$last_commit"

    if [ "$repo_status" = "dirty" ]; then
        section "Dirty File Preview"
        git status --short | head -n 20
    fi
else
    kv_pair "git" "not a repository"
fi
