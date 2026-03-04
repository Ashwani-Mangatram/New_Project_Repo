#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
echo "Starting local server from: $(pwd)"

python3 launch_server.py
