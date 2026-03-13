```bash
#!/usr/bin/env bash
# Shared logging helpers. Source this file in other scripts:
# bug issue #80 
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
REDBG='\033[41m'
GRAY='\033[0;90m'
BOLD='\033[1m'
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

success() { log "[success] ✓ $1" "$GREEN"; }
info() { log "[info] ℹ $1" "$GRAY"; }
warn() { log "\n[warn] $1" "$YELLOW"; }
critical() { log "\n[critical] $1" "$REDBG"; }
err() { log "[error] $1" "$RED" "stderr"; }

warning() { log "[warning] $1" "$YELLOW"; }
created() { printf "${GREEN}  ✓ created:${RESET} %s\n" "$1"; }
skipped() { printf "${GRAY}  – skipped:${RESET} %s\n" "$1"; }


# --- basic tokens ---
step() { log "  → $1" "${2:-$BOLD}"; }

header() {
  local message="$1"
  local width="${2:-3}"
  local color="${3:-$CYAN}"
  local marker=""

  if ! [[ "$width" =~ ^[0-9]+$ ]] || [[ "$width" -lt 1 ]]; then
    width=3
  fi

  printf -v marker '%*s' "$width" ''
  marker="${marker// /=}"

  log "\n${marker} ${message} ${marker}" "$color"
}

subheader() { log "\n$1" "${2:-$BOLD}"; }
line() { log "\n$1" "${2:-$CYAN}"; }
hrule() { line "$1" "$2"; }


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