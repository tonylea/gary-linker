#!/bin/bash

PLIST_LABEL="com.garylinker"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"

echo "==> Stopping Gary Linker service..."
launchctl unload "$PLIST_PATH" 2>/dev/null || true

if [ -f "$PLIST_PATH" ]; then
  rm "$PLIST_PATH"
  echo "==> Removed $PLIST_PATH"
fi

echo "==> Done. Gary Linker will no longer start at login."
