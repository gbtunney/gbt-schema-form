#!/usr/bin/env bash

if [ -z "${BASH_VERSION:-}" ]; then
    exec bash "$0" "$@"
fi

. "$(dirname "$0")/sh-logger-old.sh"

header "Logger UsageDefault Examples"
header "Logger Usage Examples" 6
subheader "Section: Headers and lines"
log "Testing sh-logger.sh"

success "Build completed"
info "Running tests"
warn "This is a warning"
warning "This is a warning alias"
critical "System failure"
err "An error occurred"

created "/path/to/file"
skipped "Already done"

step "Processing step"
step "Next step"
step "Custom color step" "$CYAN"

subheader "Section: Headers and lines"
line "-" 32
line "*" 24 "$YELLOW"
hrule "=" 32
hrule "#" 24 "$RED"

hrule "*" 40 "$BG_RED"
header "Width fallback example" "invalid-width"
spacer
subheader "Section: Spacer and repeater height"
line "~" 24 "$CYAN" 2
hrule "=" 24 "$YELLOW" 2
spacer 2

subheader "[SECTION]: COLORS"
# Order: Color, Bright Color, BG Color, BG Bright Color, spacer
# Sequence: red, orange, yellow, green, cyan, blue, magenta, white, black, gray
log "RED" "$RED"
log "BRIGHT_RED" "$BRIGHT_RED"
log "BG_RED" "$BG_RED"
log "BG_BRIGHT_RED" "$BG_BRIGHT_RED"
spacer

log "ORANGE" "$ORANGE"
log "BRIGHT_ORANGE" "$BRIGHT_ORANGE"
log "BG_ORANGE" "$BG_ORANGE"
log "BG_BRIGHT_ORANGE" "$BG_BRIGHT_ORANGE"
spacer

log "YELLOW" "$YELLOW"
log "BRIGHT_YELLOW" "$BRIGHT_YELLOW"
log "BG_YELLOW" "$BG_YELLOW"
log "BG_BRIGHT_YELLOW" "$BG_BRIGHT_YELLOW"
spacer

log "GREEN" "$GREEN"
log "BRIGHT_GREEN" "$BRIGHT_GREEN"
log "BG_GREEN" "$BG_GREEN"
log "BG_BRIGHT_GREEN" "$BG_BRIGHT_GREEN"
spacer

log "CYAN" "$CYAN"
log "BRIGHT_CYAN" "$BRIGHT_CYAN"
log "BG_CYAN" "$BG_CYAN"
log "BG_BRIGHT_CYAN" "$BG_BRIGHT_CYAN"
spacer

log "BLUE" "$BLUE"
log "BRIGHT_BLUE" "$BRIGHT_BLUE"
log "BG_BLUE" "$BG_BLUE"
log "BG_BRIGHT_BLUE" "$BG_BRIGHT_BLUE"
spacer

log "MAGENTA" "$MAGENTA"
log "BRIGHT_MAGENTA" "$BRIGHT_MAGENTA"
log "BG_MAGENTA" "$BG_MAGENTA"
log "BG_BRIGHT_MAGENTA" "$BG_BRIGHT_MAGENTA"
spacer

log "WHITE" "$WHITE"
log "BRIGHT_WHITE" "$BRIGHT_WHITE"
log "BG_WHITE" "$BG_WHITE"
log "BG_BRIGHT_WHITE" "$BG_BRIGHT_WHITE"
spacer

log "BLACK" "$BLACK"
log "BRIGHT_BLACK" "$BRIGHT_BLACK"
log "BG_BLACK" "$BG_BLACK"
log "BG_BRIGHT_BLACK" "$BG_BRIGHT_BLACK"
spacer

log "GRAY" "$GRAY"
log "BRIGHT_GRAY" "$BRIGHT_GRAY"
log "BG_GRAY" "$BG_GRAY"
log "BG_BRIGHT_GRAY" "$BG_BRIGHT_GRAY"
spacer 2

#subheader "SECTION: Styles"
kv_pair "SECTION" "Styles" ":" "$BG_GREY" "$GREY"
line "-" 32 "$GREY"
log "UNDERLINE" "$UNDERLINE$YELLOW"
log "BOLD" "$BOLD"
log "REVERSE" "$REVERSE$YELLOW" #idk is this the equiv a bg color??
spacer 2

subheader "Section: Key/value output"
kv_pair "branch" "main"
kv_pair "dirty files" "0" ":" "$GREEN"
kv_pair "schema version" "v2" ""
kv_pair "cwd" "$PWD" " -> "
kv_pair "git" "not installed" ":" "$RED" "$YELLOW"

subheader "Section: Raw log helper"
log "stdout default"
log "stderr output" "$RED" "stderr"

log "Test complete"

#hrepeater [marker] 4 30 #\n at end
line "-" 2 "$CYAN" #ok, this basically is equiv of hrepeater(horizontal repeater) function lets order it [content] [count] [color]

line "-" 2 "$CYAN" #ok, this should have same args as (horizontal repeater) function lets order it [content] [count] [color]

success "All logger functions working"
