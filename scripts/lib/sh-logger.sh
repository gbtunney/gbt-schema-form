#!/usr/bin/env bash
# Compatibility entrypoint for scripts sourcing sh-logger.sh.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/sh-logger-non-corrupted.sh"
