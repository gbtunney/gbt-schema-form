#!/usr/bin/env bash
set -euo pipefail

node_version="22"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

node -v

# NOTE: `nvm` is a shell function defined by `nvm.sh`.
# It is usually loaded in interactive shells via ~/.bashrc, but scripts run in a
# non-interactive shell, so we must source it explicitly.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh"
elif [[ -s "/usr/local/nvm/nvm.sh" ]]; then
    export NVM_DIR="/usr/local/nvm"
    # shellcheck disable=SC1091
    . "/usr/local/nvm/nvm.sh"
else
    echo "nvm not found. Install nvm and ensure nvm.sh exists at \"$HOME/.nvm/nvm.sh\" (or set NVM_DIR)." >&2
    exit 1
fi

nvm -v
nvm install "$node_version"
nvm use "$node_version"
corepack enable
corepack prepare pnpm@latest --activate
corepack up
node -v
pnpm -v
pnpm install
#pnpm build
