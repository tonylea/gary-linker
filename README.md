# Gary Linker

A local dashboard for organising links — dark, minimal, drag-and-drop.

## First-time setup

Run this once from the project folder:

```bash
./setup.sh
```

This will:
1. Build the app
2. Generate `start.sh` with the correct paths for your machine
3. Install a LaunchAgent so the server starts automatically at every login
4. Start the server immediately

Then open **http://localhost:5173** in your browser. Set it as your homepage if you like.

## After making code changes

If you edit the source and want to deploy the changes:

```bash
./rebuild.sh
```

This rebuilds the app and restarts the server.

## Uninstall

To remove the auto-start service:

```bash
./uninstall.sh
```

This stops the server and removes the LaunchAgent. Your data (links/groups) stays in browser localStorage.

## Backup & restore

Use the **↓** (export) and **↑** (import) buttons in the header to save and restore your links as a JSON file.

## Troubleshooting

If the server isn't responding, check the logs:

```bash
cat /tmp/garylinker.error.log
cat /tmp/garylinker.log
```
