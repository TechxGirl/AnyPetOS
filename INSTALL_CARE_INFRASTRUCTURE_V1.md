# PetPassport Care Infrastructure v1 Pack

This pack adds the four connected infrastructure systems:

1. Enclosures + Equipment
2. Smart Reminders
3. Supabase Storage files/photos/documents
4. Permission-based access invites

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
   - `PETPASSPORT_CARE_INFRASTRUCTURE_V1.sql`
4. Choose Replace when Windows asks.
5. In Supabase SQL Editor, run:

```txt
PETPASSPORT_CARE_INFRASTRUCTURE_V1.sql
```

6. Then run:

```powershell
npm install
npm run build
npm run dev -- --host
```

## Test order

1. Confirm existing pets still load.
2. Test Share Passport, revoke, regenerate, and transfer with a dummy pet.
3. Open Enclosures and create an enclosure.
4. Assign an animal to that enclosure.
5. Open Equipment and create a UVB bulb or thermostat record.
6. Open Smart Reminders and create a reminder.
7. Complete the reminder.
8. Open Files and upload a small image or PDF.
9. Open that uploaded file.
10. Open Access Center and create a temporary access invite.
11. Open the invite in incognito.
12. Sign in with a second account and accept the invite.

## Important beta notes

- Files are uploaded to a private Supabase Storage bucket named `pet-files`.
- File opening uses a temporary signed URL.
- Access invites can be created, opened, accepted, and revoked.
- In this v1, access acceptance is tracked in Supabase. Full shared editing/cross-account care logging will be the next permissions phase.
- Existing Passport share/transfer behavior is preserved.
