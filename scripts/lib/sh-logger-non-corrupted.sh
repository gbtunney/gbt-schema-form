
****** Result for Image/Page 1 ******
#!/usr/bin/env bash
# Shared logging helpers. Source this file in other scripts.

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
REDBG='\033[41m'
GRAY='\033[0;90m'
BOLD='\033[1m'
RESET='\033[0m'

log() {
	local message="${1:-}"
	local color="${2:-$RESET}"
	local output="${3:-stdout}"

	if [[ "$output" == "stderr" ]]; then
		printf "%b%s%b\n" "$color" "$message" "$RESET" >&2
		return
	fi

	printf "%b%s%b\n" "$color" "$message" "$RESET"
}

success() { log "[success] $1" "$GREEN"; }
info() { log "[info] $1" "$GRAY"; }
warn() { log "[warn] $1" "$YELLOW"; }
critical() { log "[critical] $1" "$REDBG"; }
err() { log "[error] $1" "$RED" "stderr"; }

warning() { log "[warning] $1" "$YELLOW"; }
created() { printf "%b%s%b %s\n" "$GREEN" "created:" "$RESET" "$1"; }
skipped() { printf "%b%s%b %s\n" "$GRAY" "skipped:" "$RESET" "$1"; }

step() { log "-> $1" "${2:-$BOLD}"; }

header() {
	local message="${1:-}"
	local width="${2:-3}"
	local color="${3:-$CYAN}"
	local marker=''

	if ! [[ "$width" =~ ^[0-9]+$ ]] || [[ "$width" -lt 1 ]]; then
		width=3
	fi

	printf -v marker '%*s' "$width" ''
	marker="${marker// /=}"

	log "${marker} ${message} ${marker}" "$color"
}

subheader() { log "$1" "${2:-$BOLD}"; }
line() { log "$1" "${2:-$CYAN}"; }
hrule() { line "$1" "$2"; }

kv_pair() {
	local key="${1:-}"
	local value="${2:-}"
	local delimiter="${3:-:}"
	local value_color="${4:-$RESET}"
	local key_color="${5:-$GRAY}"

	printf "%b%-24s%b %b%s%b\n" "$key_color" "${key}${delimiter}" "$RESET" "$value_color" "$value" "$RESET"
}
