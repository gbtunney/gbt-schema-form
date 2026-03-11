#!/usr/bin/env bash
# Shared logging helpers. Source this file in other scripts:
#   source "$(dirname "$0")/../lib/sh-logger.sh"

CYAN='\033[0;36m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
REDBG='\033[41m'
GRAY='\033[0;90m'
BOLD='\033[1m'
RESET='\033[0m'

log() { printf "\n${CYAN}=== %s ===${RESET}\n" "$1"; }
success() { printf "${GREEN}✓ %s${RESET}\n" "$1"; }
info() { printf "${GRAY}ℹ %s${RESET}\n" "$1"; }
warn() { printf "\n${YELLOW}[warn] %s${RESET}\n" "$1"; }
critical() { printf "\n${REDBG}=== [WARN] %s ===${RESET}\n" "$1"; }
step() { printf "${BOLD}  → %s${RESET}\n" "$1"; }
created() { printf "${GREEN}  ✓ created:${RESET} %s\n" "$1"; }
skipped() { printf "${GRAY}  – skipped:${RESET} %s\n" "$1"; }
err() { printf "${RED}[error] %s${RESET}\n" "$1" >&2; }
