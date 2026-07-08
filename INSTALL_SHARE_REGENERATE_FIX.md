# PetPassport Share Regenerate Fix

This fixes the beta issue where a revoked share link stays dead, but the "Refresh/Regenerate share link" button may not create a usable fresh link.

## Install

1. Copy the `src` folder from this patch into your PetPassport project folder.
2. Choose Replace when Windows asks.
3. In Supabase SQL Editor, run `PETPASSPORT_SHARE_REGENERATE_SQL.sql`.
4. In the VS Code terminal, restart Vite:

```powershell
Ctrl + C
npm run dev -- --host
```

## Test

1. Open a pet.
2. Open Transport Passport.
3. Create share link.
4. Copy it and test in incognito.
5. Revoke it.
6. Confirm old incognito link is dead.
7. Click Regenerate share link.
8. Copy the new link.
9. Open a new incognito tab and paste the new link.

Expected:
- Old link stays dead.
- New link opens.
