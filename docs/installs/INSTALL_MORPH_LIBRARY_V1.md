# PetPassport Morph Library v1

This pack adds a shared morph / breed / variety selector.

## What it adds

- Starter morph lists for common reptile species.
- Dropdown selection for known morphs.
- Custom morph input.
- “Add for everyone” button.
- Supabase-backed global morph options.
- Example: if a user adds “Banana Spider” for Ball Python, that option becomes available to all users.

## Important

Run `PETPASSPORT_MORPH_LIBRARY_V1.sql` in Supabase first so community morphs can be shared globally.

If you do not run the SQL, users can still type a custom morph for their own animal, but it will not update the shared library.

## Install

1. Stop Vite with Ctrl + C.
2. Extract this zip.
3. Copy these into your real `pet-passport` folder:
   - `src`
   - `public`
   - `package.json`
   - `package-lock.json`
   - `vite.config.js`
   - `index.html`
4. In Supabase SQL Editor, run:

```txt
PETPASSPORT_MORPH_LIBRARY_V1.sql
```

5. Run:

```powershell
npm install
npm run build
npm run dev -- --host
```

## Test

1. Create a Ball Python.
2. Open Morph / Breed / Variety.
3. Confirm options like Banana, Spider, Clown, Pied, and Banana Spider show.
4. Type a custom morph that is not listed.
5. Click Add for everyone.
6. Refresh the app.
7. Create/edit another animal of the same species and confirm the new option appears.
