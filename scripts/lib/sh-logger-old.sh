#!/usr/bin/env bash
# Shared logging helpers. Source this file in other scripts.
# bug issue #80

if [ -z "${BASH_VERSION:-}" ]; then
    echo "Error: sh-logger.sh requires bash." >&2
    return 1 2> /dev/null || exit 1
fi

# Primary color codes
BLACK='\033[0;30m'
WHITE='\033[0;37m'
GREY='\033[0;90m'
MAGENTA='\033[0;35m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
ORANGE='\033[38;5;208m'
RED='\033[0;31m'

# Bright variants
BRIGHT_WHITE='\033[0;97m'
BRIGHT_GREY='\033[0;37m' # no true bright gray, use white
BRIGHT_MAGENTA='\033[0;95m'
BRIGHT_BLUE='\033[0;94m'
BRIGHT_CYAN='\033[0;96m'
BRIGHT_GREEN='\033[0;92m'
BRIGHT_YELLOW='\033[0;93m'
BRIGHT_ORANGE='\033[38;5;214m'
BRIGHT_RED='\033[0;91m'

# Background colors
BG_BLACK='\033[40m'
BG_WHITE='\033[47m'
BG_GREY='\033[100m' #idk??
BG_MAGENTA='\033[45m'
BG_BLUE='\033[44m'
BG_CYAN='\033[46m'
BG_GREEN='\033[42m'
BG_YELLOW='\033[43m'
BG_ORANGE='\033[48;5;208m'
BG_RED='\033[41m'

# Bright background colors
BG_BRIGHT_BLACK='\033[100m'
BG_BRIGHT_WHITE='\033[107m'
BG_BRIGHT_GREY='\033[48;5;250m'
BG_BRIGHT_MAGENTA='\033[105m'
BG_BRIGHT_BLUE='\033[104m'
BG_BRIGHT_CYAN='\033[106m'
BG_BRIGHT_GREEN='\033[102m'
BG_BRIGHT_YELLOW='\033[103m'
BG_BRIGHT_ORANGE='\033[48;5;214m'
BG_BRIGHT_RED='\033[101m'
# alias
GRAY="$GREY"
BG_GRAY="$BG_GREY"
BRIGHT_GRAY="$BRIGHT_GREY"
BG_BRIGHT_GRAY="$BG_BRIGHT_GREY"

# Styles
BOLD='\033[1m'
UNDERLINE='\033[4m'
REVERSE='\033[7m'
RESET='\033[0m'

# system logging helpers
log() {
    local message="$1"
    local color="${2:-$RESET}"
    local output="${3:-stdout}"

    if [[ "$output" == "stderr" ]]; then
        printf "${color}%s${RESET}\n" "$message" >&2
        return
    fi

    printf "${color}%s${RESET}\n" "$message"
}

success() { log "[success] OK $1" "$GREEN"; }
info() { log "[info] i $1" "$GRAY"; }
warn() { log $'\n'"[warn] $1" "$YELLOW"; }
critical() { log $'\n'"[critical] $1" "$BG_RED"; }
err() { log "[error] $1" "$RED" "stderr"; }

warning() { log "[warning] $1" "$YELLOW"; }
created() { printf "${GREEN}  OK created:${RESET} %s\n" "$1"; }
skipped() { printf "${GRAY}  - skipped:${RESET} %s\n" "$1"; }

# --- basic tokens ---
step() { log "  -> $1" "${2:-$BOLD}"; }
spacer() {
    local height="${1:-1}"

    if ! [[ "$height" =~ ^[0-9]+$ ]] || [[ "$height" -lt 1 ]]; then
        height=1
    fi

    for ((index = 0; index < height; index++)); do
        printf '\n'
    done
}

build_rule() {
    local marker="${1:--}"
    local width="${2:-40}"
    local rule=""

    if ! [[ "$width" =~ ^[0-9]+$ ]] || [[ "$width" -lt 1 ]]; then
        width=40
    fi

    printf -v rule '%*s' "$width" ''
    printf '%s' "${rule// /$marker}"
}

hrepeater() {
    local marker="${1:--}"
    local width="${2:-40}"
    local height="${3:-1}"
    local repeated_line=""
    local output=""

    if ! [[ "$height" =~ ^[0-9]+$ ]] || [[ "$height" -lt 1 ]]; then
        height=1
    fi

    repeated_line="$(build_rule "$marker" "$width")"

    for ((index = 0; index < height; index++)); do
        output+="$repeated_line"
        if ((index < height - 1)); then
            output+=$'\n'
        fi
    done

    printf '%s' "$output"
}

header() {
    local message="$1"
    local width="${2:-3}"
    local color="${3:-$CYAN}"
    local marker="${4:-=}"
    local height="${5:-1}"
    local rule=""

    if ! [[ "$width" =~ ^[0-9]+$ ]] || [[ "$width" -lt 1 ]]; then
        width=3
    fi

    rule="$(hrepeater "$marker" "$width" "$height")"

    log $'\n'"${rule} ${message} ${rule}" "$color"
}

subheader() { log $'\n'"$1" "${2:-$BOLD}"; }
line() {
    local marker_or_text="${1:--}"
    local width="${2:-40}"
    local color="${3:-$CYAN}"
    local height="1"
    local include_newline="false"
    local output=""
    local fourth_arg="${4:-}"

    if [[ "$fourth_arg" == "true" || "$fourth_arg" == "false" ]]; then
        include_newline="$fourth_arg"
    else
        height="${4:-1}"
        include_newline="${5:-false}"
    fi

    if [[ ${#marker_or_text} -gt 1 ]] && { [[ $# -eq 1 ]] || ! [[ "$2" =~ ^[0-9]+$ ]]; }; then
        output="$marker_or_text"
        color="${2:-$CYAN}"
    else
        output="$(hrepeater "$marker_or_text" "$width" "$height")"
    fi

    if [[ "$include_newline" == "true" ]]; then
        log $'\n'"$output" "$color"
        return
    fi

    log "$output" "$color"
}

hrule() { line "${1:--}" "${2:-40}" "${3:-$CYAN}" "${4:-1}" true; }

# --- key/value helpers ---
# Print a padded "key<delimiter> value" line (great for diagnostics tables).
#
# Examples:
#   kv_pair "branch" "main"
#   kv_pair "dirty files" "0" ":" "$GREEN"
#   kv_pair "schema version" "v2" ""        # no delimiter
#   kv_pair "cwd" "/Users/me/repo" " -> "
#   kv_pair "git" "not installed" ":" "$RED" "$YELLOW"   # yellow key, red value
#
# Signature:
#   kv_pair <key> <value> [delimiter] [value_color] [key_color]
#
# Defaults:
#   delimiter=":"
#   value_color="$RESET" (no special color)
#   key_color="$GRAY"
kv_pair() {
    local key="$1"
    local value="$2"
    local delimiter="${3:-:}"
    local value_color="${4:-$RESET}"
    local key_color="${5:-$GRAY}"

    printf "${key_color}%-24s${RESET} ${value_color}%s${RESET}\n" "${key}${delimiter}" "$value"
}
