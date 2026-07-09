# PetPassport Beta Transport Pack

## What this pack adds

This update keeps the current React/Vite + Supabase structure and adds the beta version of Passport transport.

### Transport features

- Read-only Passport share links
- QR code generation for shared Passport links
- Copy link button
- Native device share button when supported
- Text link
- Email link
- Revoke shared Passport link
- Transfer invite link
- Transfer preview without signup
- Accept transfer after signup/sign-in
- Server-side Supabase RPC for public share lookup
- Server-side Supabase RPC for accepting ownership transfer

### Beta regression fixes

- Create Pet autofill now uses a care profile resolver instead of exact species-name guessing.
- Species without a specific care profile now receive a safe generic group profile.
- Feeding log dropdown is restored with fallbacks from `foodOptions`, `foodList`, and `diet`.
- `normalizePet` now preserves `cloudId`, `share`, and `transfer`.
- `.gitignore` now protects `.env` and `.env.*`.

## Files changed or added

### Added

- `src/utils/careProfileResolver.js`
- `src/utils/passportTransport.js`
- `src/pages/PublicPassportView.jsx`
- `src/pages/TransferPassportView.jsx`
- `PETPASSPORT_BETA_TRANSPORT_SUPABASE.sql`
- `BETA_TRANSPORT_TEST_CHECKLIST.md`

### Updated

- `src/App.jsx`
- `src/App.css`
- `src/components/AddPet.jsx`
- `src/components/FeedModal.jsx`
- `src/components/SharePassportModal.jsx`
- `src/components/app/AppModalRenderer.jsx`
- `src/hooks/usePets.js`
- `src/utils/normalizePet.js`
- `package.json`
- `package-lock.json`
- `.gitignore`

## Dependency added

This pack adds the `qrcode` package so QR codes are generated locally in the browser instead of sending private Passport links to a third-party QR API.

```powershell
npm install
```

Running `npm install` from this package will install the new dependency.

## Supabase required

Before testing share or transfer, run:

```text
PETPASSPORT_BETA_TRANSPORT_SUPABASE.sql
```

in the Supabase SQL Editor.

The app will still build before the SQL is run, but the share and transfer buttons will error until the tables and RPC functions exist.

## Build validation

`npm install` completed successfully.

`npm run build` completed successfully.

Vite gave a chunk-size warning only. That is not a beta blocker.
