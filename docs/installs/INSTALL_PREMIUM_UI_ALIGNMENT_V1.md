# PetPassport Premium UI Alignment v1 Pack

This pack makes PetPassport visually align closer to the premium concept mockup while using real uploaded pet photos only.

## What this changes

- Dark premium SaaS app shell
- Role/workspace accent colors:
  - Owner: green
  - Breeder: purple
  - Rescue: amber
  - Veterinary: blue
  - Education/Zoo: cyan
  - Pet Sitter: rose/coral
  - Retail/Pet Shop: gold
- Sidebar polish
- Dashboard redesign
- Premium stat strip
- Real-photo animal preview cards
- Reminder panel
- Workspace pipeline board
- Pet card polish
- Module page polish
- Light mode kept, but dark mode is the primary visual direction

## Important design rule

No AI-generated animal photos are used in the app UI. Pet cards, profiles, shared Passports, and transfer previews use:
- user-uploaded real pet photos
- clean initials/species placeholders when no photo exists

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
4. Choose Replace when Windows asks.
5. Run:

```powershell
npm install
npm run build
npm run dev -- --host
```

## Test

1. Open each workspace.
2. Confirm the accent color changes:
   - Breeder should feel purple
   - Rescue should feel amber
   - Vet should feel blue
   - Education should feel cyan
   - Sitter should feel rose/coral
   - Retail should feel gold
3. Open Dashboard.
4. Confirm real pet photos show in cards.
5. Confirm placeholders are clean if no photo exists.
6. Open Collection.
7. Open Profile/Passport.
8. Test Share, Revoke, Regenerate, and Transfer.
