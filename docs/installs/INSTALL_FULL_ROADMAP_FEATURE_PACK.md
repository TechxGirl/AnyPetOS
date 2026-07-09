# PetPassport Full Roadmap Feature Pack

Built from the working share/revoke/regenerate/transfer version.

## What this adds

This pack expands the roadmap into beta-safe working sections:

- Private beta banner
- Roadmap page
- Workspaces page
- Data Center
  - CSV/spreadsheet import preview
  - duplicate detection
  - bulk import valid rows
  - JSON backup download
  - CSV export
  - single Passport JSON export
  - browser print / Save as PDF workflow
  - local backup restore preview
- Professional Tools
  - Owner care planner
  - Breeder pipeline
  - Rescue intake/rehab
  - Veterinary patient notes
  - Education/Zoo program planning
  - Pet sitter visit planning
- Community foundation
  - public profile draft
  - breeder/rescue page foundation
  - achievements/reputation preview
- Launch Center
  - beta readiness checklist
  - beta tester invite copy
  - marketing website sections
  - growth roadmap visibility
- Dashboard, collection, Passport, and feedback improvements from the roadmap foundation pack

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

## No new SQL required

This pack uses the existing Supabase setup and local browser storage for beta-only planning tools.

## Test first

After install, test:
- create pet autofill
- feeding dropdown
- share/revoke/regenerate
- transfer with dummy pet
- Data Center export
- CSV import preview
- Workspaces
- Professional Tools
- Community
- Launch Center
