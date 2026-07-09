# PetPassport Workspace Actions v1 Pack

This pack turns the placeholder workspace module cards into working beta tools.

## What this fixes

Before this pack, workspace module pages like Rehab Plans, Intake, Quarantine, Sales, Pairings, Visits, and other role pages showed informational cards that did not do anything.

Now those pages include:

- Working module action buttons
- Quick action templates
- A create-record form
- Animal assignment
- Type/status/priority/due date fields
- Notes
- Module-specific workflow boards
- Status lanes
- Complete / reopen / delete actions
- Module CSV export
- Data Center links
- Add Animal links

## Important beta note

These module workflow records are saved in browser local storage for beta testing. They do not require new SQL.

A later backend phase should move these records into Supabase tables so they sync across devices and accounts.

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

1. Open a workspace, for example Rescue.
2. Open Rehab Plans.
3. Click Create rehab milestone.
4. Fill out a record and save.
5. Move the card to another status lane.
6. Mark it complete.
7. Reopen it.
8. Export module CSV.
9. Confirm Share Passport and Transfer still work.
