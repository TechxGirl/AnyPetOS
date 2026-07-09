# PetPassport True Workspace System Pack

Built from the working `petpassport-current-working.zip` version that already had share, revoke, regenerate, and transfer tested.

## What this pack adds

- Real workspace switcher
- Active workspace saved locally for beta testing
- Enabled workspace selection
- Role-specific sidebar navigation
- Role-specific dashboard hero, quick actions, cards, terminology, and pipeline snapshots
- Owner workspace
- Breeder workspace
- Rescue workspace
- Veterinary workspace
- Education / Zoo workspace
- Pet Sitter workspace
- Retail / Pet Shop workspace
- Workspaces page
- Settings workspace management
- Professional module pages for:
  - Care Planner
  - Health Watch
  - Sitter Access
  - Pairings
  - Hatchlings
  - Sales Pipeline
  - Expo Mode
  - Transfers
  - Intake
  - Quarantine
  - Rehab Plans
  - Adoptions
  - Foster Care
  - Medical Watch
  - Patients / shared records surfaces
  - Appointments
  - Treatment Notes
  - Medical History
  - Programs
  - Exhibits
  - Public Profiles
  - Visits
  - Clients
  - Care Reports
  - Emergency Cards
  - Inventory
  - Suppliers
  - Sale Ready
  - Customer Transfers
  - Data Center foundation
- Retail / Pet Shop role added to onboarding
- Professional icon additions
- Existing transport/share/transfer system kept intact

## Install

1. Stop Vite with Ctrl + C.
2. Extract this zip.
3. Copy these into your real `pet-passport` project folder:
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

## Test checklist

- App opens
- Dashboard loads
- Sidebar changes after switching workspace
- Workspaces page opens
- Settings has workspace switcher
- Owner workspace works
- Breeder workspace works
- Rescue workspace works
- Vet workspace works
- Education/Zoo workspace works
- Pet Sitter workspace works
- Retail workspace works
- Existing pets still load
- Create pet still works
- Feed modal still works
- Medications still work
- Share link still works
- Revoke still works
- Regenerate still works
- Transfer still works with a dummy pet

## Notes

Workspace switching is local-first for this beta pass. A later Supabase pass should add profile-level enabled workspaces, organization teams, staff permissions, temporary access, and audit logs.
