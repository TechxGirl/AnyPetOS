# PetPassport Access Invite Link Display Fix v1

## What happened

The invite itself was created correctly. The link was being rendered inside an HTML `code` element, which allowed the browser to choose a broken or incompatible monospace font. That made normal URL characters look like symbols.

## What this patch changes

- Replaces the `code` block with a normal read-only URL field.
- Uses a dependable Windows/browser font stack.
- Forces left-to-right URL rendering.
- Selects the full link when clicked.
- Keeps the Copy Again button.
- Adds an Open Invite button.
- Does not require any new Supabase SQL.

## Install

1. Stop Vite with Ctrl + C.
2. Extract this zip.
3. Copy the `src` folder into the real PetPassport project.
4. Choose Replace.
5. Run:

```powershell
npm run build
npm run dev -- --host
```

## Test

1. Create another temporary access invite.
2. Confirm the URL displays in normal English characters.
3. Click Copy Again.
4. Click Open Invite.
5. Open the copied link in an incognito window.
