#!/usr/bin/env bash
set -euo pipefail

target="${1:-scripts/uninstall.sh}"

ls -l "$target"
chmod +x "$target"
ls -l "$target"
