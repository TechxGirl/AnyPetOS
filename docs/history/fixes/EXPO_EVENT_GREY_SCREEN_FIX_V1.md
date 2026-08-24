# Expo Event Grey Screen Fix v1

## What happened

After the first expo was created, Supabase returned the new event before React had finished
setting the active event ID. Expo Mode briefly had an event list but no selected event.

The page then tried to read the selected event's public slug and kiosk settings during that
small timing gap. That caused a runtime crash and left the browser showing the dark app
background.

## What this patch changes

- Resolves the first available event immediately.
- Compares Supabase IDs safely whether they arrive as numbers or strings.
- Keeps event animals, exhibitors, leads, holds, scans, and updates connected to the resolved event.
- Adds a defensive loading state instead of allowing a blank-screen crash.
- Normalizes the analytics response before rendering it.
- Preserves the Expo modal typing-focus fix.
- Requires no new Supabase SQL.

## Install

1. Stop Vite with Ctrl + C.
2. Extract this zip.
3. Replace exactly:

```text
src/pages/ExpoMode.jsx
```

4. Run:

```powershell
Remove-Item .\node_modules\.vite -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\dist -Recurse -Force -ErrorAction SilentlyContinue
npm run build
npm run dev -- --host
```

5. Press Ctrl + Shift + R in the browser.

## Test

1. Open Expo Mode.
2. Confirm the newly created event dashboard loads.
3. Switch away from Expo Mode and return.
4. Refresh the browser while Expo Mode is open.
5. Confirm Overview, Animals, Exhibitors, Leads & Holds, Kiosk & Print, and Settings all open.
