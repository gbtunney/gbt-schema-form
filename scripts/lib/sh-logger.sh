#!/usr/bin/env bash
# Shared logging helpers. Source this file in other scripts.
# bug issue #80

if [ -z "${BASH_VERSION:-}" ]; then
    echo "Error: sh-logger.sh requires bash." >&2
    return 1 2> /dev/null || exit 1
fi

# Primary color codes
BLACK=$'\033[0;30m'
WHITE=$'\033[0;37m'
GREY=$'\033[0;90m'
MID_GREY=$'\033[0;38;5;187;49m'

MAGENTA=$'\033[0;35m'
BLUE=$'\033[0;34m'
CYAN=$'\033[0;36m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[1;33m'
ORANGE=$'\033[38;5;208m'
RED=$'\033[0;31m'

YELLOW=$'\033[1;33m'
DIM_YELLOW=$'\e[3;33m]'

# Bright variants
BRIGHT_WHITE=$'\033[0;97m'
BRIGHT_GREY=$'\033[0;37m'
BRIGHT_MAGENTA=$'\033[0;95m'
BRIGHT_BLUE=$'\033[0;94m'
BRIGHT_CYAN=$'\033[0;96m'
BRIGHT_GREEN=$'\033[0;92m'
BRIGHT_YELLOW=$'\033[0;93m'
BRIGHT_ORANGE=$'\033[38;5;214m'
BRIGHT_RED=$'\033[0;91m'

# Background colors
BG_BLACK=$'\033[40m'
BG_WHITE=$'\033[47m'
BG_GREY=$'\033[100m'
BG_MAGENTA=$'\033[45m'
BG_BLUE=$'\033[44m'
BG_CYAN=$'\033[46m'
BG_GREEN=$'\033[42m'
BG_YELLOW=$'\033[43m'
BG_ORANGE=$'\033[48;5;208m'
BG_RED=$'\033[41m'

# Bright background colors
BG_BRIGHT_BLACK=$'\033[100m'
BG_BRIGHT_WHITE=$'\033[107m'
BG_BRIGHT_GREY=$'\033[48;5;250m'
BG_BRIGHT_MAGENTA=$'\033[105m'
BG_BRIGHT_BLUE=$'\033[104m'
BG_BRIGHT_CYAN=$'\033[106m'
BG_BRIGHT_GREEN=$'\033[102m'
BG_BRIGHT_YELLOW=$'\033[103m'
BG_BRIGHT_ORANGE=$'\033[48;5;214m'
BG_BRIGHT_RED=$'\033[101m'

# aliases
GRAY="$GREY"
BG_GRAY="$BG_GREY"
BRIGHT_GRAY="$BRIGHT_GREY"
BG_BRIGHT_GRAY="$BG_BRIGHT_GREY"

# Styles
BOLD=$'\033[1m'
UNDERLINE=$'\033[4m'
REVERSE=$'\033[7m'
RESET=$'\033[0m'

# background ramp
BG_BLACK=$'\033[48;5;232m'
BG_DARK_GREY=$'\033[48;5;238m'
BG_MID_GREY=$'\033[48;5;244m'
BG_LIGHT_GREY=$'\033[48;5;250m'
BG_WHITE=$'\033[48;5;255m'

# foreground ramp
FG_BLACK=$'\033[38;5;232m'
FG_DARK_GREY=$'\033[38;5;238m'
FG_MID_GREY=$'\033[38;5;244m'
FG_LIGHT_GREY=$'\033[38;5;250m'
FG_WHITE=$'\033[38;5;255m'

colortable() {
    for x in {0..5}; do echo --- && for z in 0 10 60 70; do
        for y in {30..37}; do
            y=$((y + z)) && printf '\e[%d;%dm%-12s\e[0m' "$x" "$y" "$(printf ' \\e[%d;%dm] ' "$x" "$y")" && printf ' '
        done && printf '\n'
    done; done
}
#  white  = bright wlygrey = white  grey= dark grey = (bright black)
grey_ramp() {
    # total 24     blak = 0  232  \033[0;90;48;5;232m    dark grey     50% grey  light grey    256  white =\033[0;90;48;5;255m

    printf '%b---  %b----  %b  %b  %b%b\n' \
        "$BG_BLACK" \
        "$REVERSE$BG_BLACK" \
        "$BG_DARK_GREY" \
        "$BG_MID_GREY" \
        "$BG_LIGHT_GREY" \
        "$BG_WHITE" \
        "$RESET"

}
get_terminal_width() {
    local width="${COLUMNS:-}"

    if [[ "$width" =~ ^[0-9]+$ ]] && ((width > 0)); then
        printf '%s\n' "$width"
        return
    fi
    width="$(tput cols 2> /dev/null)"
    if [[ "$width" =~ ^[0-9]+$ ]] && ((width > 0)); then
        printf '%s\n' "$width"
        return
    fi
    printf '80\n'
}

resolve_width() {
    local width="$1"
    local term_width

    # trim leading/trailing whitespace
    width="${width#"${width%%[![:space:]]*}"}"
    width="${width%"${width##*[![:space:]]}"}"

    term_width="$(get_terminal_width)"

    if [[ -z "$width" || "$width" == "auto" ]]; then
        printf '%s\n' "$term_width"
        return
    fi

    if [[ "$width" =~ ^[0-9]+$ ]] && ((width > 0)); then
        printf '%s\n' "$width"
        return
    fi

    if [[ "$width" =~ ^([0-9]+)%$ ]]; then
        printf '%s\n' $((term_width * ${BASH_REMATCH[1]} / 100))
        return
    fi

    printf '%s\n' "$term_width"
}

rule() {
    local marker="${1:-=}"
    local width
    local repeat="${3:-1}"
    local newline="${4:-true}"
    local line=''
    local i

    width="$(resolve_width "$2")"

    if ! [[ "$repeat" =~ ^[0-9]+$ ]] || ((repeat < 1)); then
        repeat=1
    fi

    if [[ "$newline" != "true" && "$newline" != "false" ]]; then
        newline="true"
    fi

    # fast path for plain single-character markers
    if [[ ${#marker} -eq 1 ]]; then
        line="$(printf '%*s' "$width" '' | tr ' ' "$marker")"
    else
        while ((${#line} < width)); do
            line+="$marker"
        done
        line="${line:0:width}"
    fi

    for ((i = 0; i < repeat; i++)); do
        if [[ "$newline" == "true" || $i -lt $((repeat - 1)) ]]; then
            printf '%b\n' "$line"
        else
            printf '%b' "$line"
        fi
    done
}
# CLI dispatcher
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
    cmd="$1"
    shift

    if declare -F "$cmd" > /dev/null; then
        "$cmd" "$@"
    else
        echo "Unknown command: $cmd" >&2
        exit 1
    fi
fi
