# Expo Modal Typing Focus Fix v1

## What happened

Every time you typed into the Expo form, the controlled form state updated and re-rendered the page.

The shared Modal component treated the inline `onClose` function as a new dependency on every render. Its focus-management effect therefore cleaned itself up and ran again after every keystroke. Cleanup restored focus to the close button, so typing appeared to jump to the X.

## What this fixes

- Keeps the latest close callback in a stable ref.
- Prevents the modal focus effect from restarting after every keystroke.
- Automatically focuses the first form input instead of the X button.
- Fixes the behavior globally for Expo forms and other shared PetPassport modals.
- Requires no Supabase SQL.

## Install

1. Stop Vite with Ctrl + C.
2. Extract this zip.
3. Replace exactly:

```text
src/components/ui/Modal.jsx
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

1. Open Create an Expo Command Center.
2. Type a complete event name.
3. Tab through Venue, City, State/Region, booth, and dates.
4. Confirm focus stays in the field instead of jumping to the X.
5. Confirm Escape still closes the modal.
6. Confirm Tab and Shift+Tab remain trapped inside the modal.
