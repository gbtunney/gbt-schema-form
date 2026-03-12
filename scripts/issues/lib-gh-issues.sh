#!/usr/bin/env bash

# Shared GitHub helper functions for issue scripts.
# Expects these variables from the caller:
#   REPO, PROJECT_OWNER, ADD_TO_PROJECT

_gh_note_created() {
    local message="$1"
    if declare -F created > /dev/null 2>&1; then
        created "$message"
    else
        printf "created: %s\n" "$message"
    fi
}

_gh_note_skipped() {
    local message="$1"
    if declare -F skipped > /dev/null 2>&1; then
        skipped "$message"
    else
        printf "skipped: %s\n" "$message"
    fi
}

_gh_note_info() {
    local message="$1"
    if declare -F info > /dev/null 2>&1; then
        info "$message"
    else
        printf "info: %s\n" "$message"
    fi
}

create_label() {
    local name="$1" color="$2" description="$3"
    if gh label list --repo "$REPO" --limit 1000 --json name --jq '.[].name' | grep -qx "$name"; then
        _gh_note_skipped "label '$name'"
    else
        gh label create "$name" \
            --repo "$REPO" \
            --color "$color" \
            --description "$description"
        _gh_note_created "label '$name'"
    fi
}

create_issue() {
    local title="$1" labels="$2" body="$3"
    local issue_url
    issue_url=$(gh issue create \
        --repo "$REPO" \
        --title "$title" \
        --label "$labels" \
        --body "$body")
    echo "$issue_url"
}

add_to_project() {
    local issue_url="$1" project_id="$2"
    if [[ "$ADD_TO_PROJECT" != "true" ]]; then
        _gh_note_info "skipping project add (ADD_TO_PROJECT=false)"
        return
    fi
    gh project item-add "$project_id" \
        --owner "$PROJECT_OWNER" \
        --url "$issue_url" || true
}
