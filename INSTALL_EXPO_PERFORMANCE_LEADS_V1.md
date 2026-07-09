# PetPassport Expo Performance + Lead Pipeline Polish v1

This pack improves Expo load behavior and cleans up the breeder-side lead pipeline.

## Install

1. Stop Vite by holding Ctrl and tapping C.
2. Extract this zip.
3. Copy these items into the real `pet-passport` project:
   - `src`
   - `public`
   - `package.json`
   - `package-lock.json`
   - `vite.config.js`
   - `index.html`
4. Choose **Replace** when Windows asks.
5. Run:

```powershell
npm install
Remove-Item .\node_modules\.vite -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\dist -Recurse -Force -ErrorAction SilentlyContinue
npm run build
npm run dev -- --host
```

6. Press **Ctrl + Shift + R** in the browser.

No Supabase SQL is required for this pack.

## Performance test

1. Open Dashboard.
2. Open Expo Mode.
3. Switch to another workspace or page.
4. Return to Expo Mode.
5. Confirm the previous Expo data appears quickly while PetPassport refreshes quietly.
6. Open Kiosk & Print.
7. Confirm QR codes generate only after that tab is opened.
8. Open Community and return again.

## Lead pipeline test

1. Open Expo Mode.
2. Open **Leads & holds**.
3. Confirm the count says `1 lead` when there is one.
4. Confirm emails and listing codes wrap instead of clipping.
5. Confirm Open details and Create hold are fully visible.
6. Use the stage chips to jump across the board.
7. Open a lead and test Email visitor, Call visitor, stage changes, and Create hold.
8. Resize the browser and confirm the lead board remains usable.
