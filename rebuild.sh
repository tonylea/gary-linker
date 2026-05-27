#!/bin/bash
set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLIST_LABEL="com.garylinker"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"

echo "==> Rebuilding Gary Linker..."
cd "$PROJECT_DIR"
npm run build

echo "==> Restarting service..."
launchctl unload "$PLIST_PATH" 2>/dev/null || true
launchctl load "$PLIST_PATH"

sleep 3
if curl -sf http://localhost:5173 >/dev/null; then
  echo "==> Done! Running at http://localhost:5173"
else
  echo "==> Not responding yet. Check logs: cat /tmp/garylinker.error.log"
fi
