#!/usr/bin/env bash
# Makes a shell script executable (chmod +x).
# Usage: bash scripts/lib/sh-make-executable.sh <path/to/script.sh>
set -euo pipefail

if [[ $# -eq 0 ]]; then
    echo "Error: no target specified." >&2
    echo "Usage: bash scripts/lib/sh-make-executable.sh <path/to/script.sh>" >&2
    exit 1
fi

target="$1"

ls -l "$target"
chmod +x "$target"
ls -l "$target"
