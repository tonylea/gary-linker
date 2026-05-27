# Gary Linker

A local dashboard for organising links — dark, minimal, drag-and-drop.

## Setup & deploy

From the project folder:

```bash
npm install
npm run deploy
```

`deploy` builds the app, installs a LaunchAgent so the server starts
automatically at every login, and starts it immediately. It's idempotent —
run it again any time you change the source to rebuild and restart.

Then open **<http://localhost:5173>** in your browser. Set it as your homepage if you like.

## Remove

To stop the server and remove the auto-start service:

```bash
npm run remove
```

This removes the LaunchAgent. Your data (links/groups) stays in browser localStorage.

## Backup & restore

Use the **↓** (export) and **↑** (import) buttons in the header to save and restore your links as a JSON file.

## Troubleshooting

If the server isn't responding, check the logs:

```bash
cat /tmp/garylinker.error.log
cat /tmp/garylinker.log
```
