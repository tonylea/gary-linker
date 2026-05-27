#!/bin/bash
set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLIST_LABEL="com.garylinker"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"
START_SCRIPT="$PROJECT_DIR/start.sh"
NPM_PATH=$(which npm)

echo "==> Gary Linker setup"
echo "    Project: $PROJECT_DIR"
echo "    npm:     $NPM_PATH"
echo ""

# Build the app
echo "==> Building..."
cd "$PROJECT_DIR"
npm run build
echo ""

# Write start.sh
echo "==> Writing start.sh..."
cat > "$START_SCRIPT" <<STARTSCRIPT
#!/bin/bash
export PATH="$(dirname "$NPM_PATH"):/usr/local/bin:\$PATH"
cd "$PROJECT_DIR"
npm run preview
STARTSCRIPT
chmod +x "$START_SCRIPT"

# Write the LaunchAgent plist
echo "==> Writing LaunchAgent plist to $PLIST_PATH..."
cat > "$PLIST_PATH" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${PLIST_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>${START_SCRIPT}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${PROJECT_DIR}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/garylinker.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/garylinker.error.log</string>
</dict>
</plist>
PLIST

# Unload if already loaded (ignore errors)
launchctl unload "$PLIST_PATH" 2>/dev/null || true

# Load it
echo "==> Starting service..."
launchctl load "$PLIST_PATH"

# Wait and verify
sleep 3
if curl -sf http://localhost:5173 >/dev/null; then
  echo ""
  echo "==> Done! Gary Linker is running at http://localhost:5173"
  echo "    It will start automatically at every login."
else
  echo ""
  echo "==> Service loaded but server not responding yet."
  echo "    Check logs: cat /tmp/garylinker.error.log"
fi
