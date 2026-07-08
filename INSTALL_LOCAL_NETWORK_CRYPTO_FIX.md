# PetPassport Local Network Crypto Fix

This fixes local testing from a Network URL such as:

```txt
http://192.168.x.x:5173/
```

## Why this happened

`crypto.randomUUID()` works on `localhost` and on deployed HTTPS websites, but it can fail on local network HTTP addresses. That made the share button look like it did nothing.

## Install

1. Extract this zip.
2. Copy the `src` folder into your main `pet-passport` project folder.
3. Choose **Replace** when Windows asks.
4. Restart Vite:

```powershell
Ctrl + C
npm run dev -- --host
```

5. Hard refresh the browser:

```txt
Ctrl + Shift + R
```

## Test

1. Open Transport Passport.
2. Click Create share link.
3. It should create a link again.
4. Copy it.
5. Open a new incognito tab and paste it.

Expected:
- A new active share row is created.
- The public Passport opens.
- Old revoked links stay dead.
