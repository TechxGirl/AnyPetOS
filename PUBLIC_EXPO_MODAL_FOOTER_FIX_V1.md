# Public Expo Modal Footer Fix v1

## What happened

The shared modal gave its scrollable body a fixed maximum height without making the
header, body, and footer part of one constrained flex layout. On shorter browser windows,
the body consumed nearly the entire modal height and pushed the action buttons below the
visible area.

## What this fixes

- Keeps modal headers visible.
- Makes only the middle content area scroll.
- Keeps footer actions visible at the bottom.
- Allows action buttons to wrap safely.
- Improves mobile and short-window behavior.
- Accounts for browser safe areas.
- Applies to the public Expo animal modal and every shared PetPassport modal.
- Requires no Supabase SQL.

## Install

Replace exactly:

```text
src/styles/ui.css
```

Then run:

```powershell
Remove-Item .\node_modules\.vite -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\dist -Recurse -Force -ErrorAction SilentlyContinue
npm run build
npm run dev -- --host
```

Press Ctrl + Shift + R in both the normal and InPrivate browser windows.

## Test

1. Open the public Expo catalog in InPrivate.
2. Open an animal.
3. Scroll the animal details.
4. Confirm Show at booth and I'm interested remain visible.
5. Resize the browser shorter and confirm the buttons remain reachable.
