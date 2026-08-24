# PetPassport Temporary Access Fix v1

## What this fixes

The Access form could visually show the first animal while its internal value was still `none`. That made the form look ready even though no animal had actually been selected.

This patch:

- Automatically selects the first available animal.
- Shows a real disabled `Choose an animal` placeholder.
- Keeps the selected animal valid after creating an invite.
- Prevents invite creation when no animal exists.
- Validates that the selected animal has a real Supabase cloud ID.
- Keeps a successfully created invite even when browser clipboard copying is blocked.
- Improves error messages for cloud-sync and animal-selection issues.

## Install

1. Stop Vite with Ctrl + C.
2. Extract this zip.
3. Copy `src` into the real PetPassport project and choose Replace.
4. Run:

```powershell
npm run build
npm run dev -- --host
```

No additional SQL is required for this patch.

## Test

1. Open Access Center.
2. Confirm an animal is visibly selected.
3. Enter an optional recipient email.
4. Choose an access level and expiration.
5. Click Create and copy invite.
6. Confirm the invite appears in the list and the link appears below the form.
7. Open the link in an incognito window.
