#!/bin/zsh
set -e

PROJECT_DIR="$( cd "$( dirname "$0" )/.." && pwd )"
PLIST_LABEL="com.garylinker"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_LABEL}.plist"
PORT=5173
URL="http://localhost:${PORT}"

die() { echo "Error: $*" >&2; exit 1; }

build() {
  echo "==> Building..."
  cd "$PROJECT_DIR"
  npm run build
}

write_plist() {
  local npm_bin npm_dir
  npm_bin="$(command -v npm)" || die "npm not found on PATH"
  npm_dir="$(dirname "$npm_bin")"

  echo "==> Writing LaunchAgent to ${PLIST_PATH}..."
  mkdir -p "$(dirname "$PLIST_PATH")"
  cat > "$PLIST_PATH" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${PLIST_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/zsh</string>
        <string>-c</string>
        <string>exec '${npm_bin}' run preview</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${PROJECT_DIR}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>${npm_dir}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    </dict>
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
}

reload() {
  echo "==> (Re)starting service..."
  launchctl unload "$PLIST_PATH" 2>/dev/null || true
  launchctl load "$PLIST_PATH"
}

verify() {
  sleep 3
  if curl -sf "$URL" >/dev/null; then
    echo ""
    echo "==> Done! Gary Linker is running at ${URL}"
  else
    echo ""
    echo "==> Service loaded but server not responding yet."
    echo "    Check logs: cat /tmp/garylinker.error.log"
  fi
}

cmd_deploy() {
  echo "==> Gary Linker deploy (project: ${PROJECT_DIR})"
  build
  write_plist
  reload
  verify
  echo "    It will start automatically at every login."
}

cmd_remove() {
  echo "==> Stopping Gary Linker service..."
  launchctl unload "$PLIST_PATH" 2>/dev/null || true
  if [ -f "$PLIST_PATH" ]; then
    rm "$PLIST_PATH"
    echo "==> Removed ${PLIST_PATH}"
  fi
  echo "==> Done. Gary Linker will no longer start at login."
}

case "${1:-}" in
  deploy) cmd_deploy ;;
  remove) cmd_remove ;;
  *) die "Usage: service.sh {deploy|remove}" ;;
esac
