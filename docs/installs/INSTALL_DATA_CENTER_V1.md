# PetPassport Data Center v1 Install

This fixes the Data Center cards/buttons so they open real workflows instead of acting like placeholder cards.

## Adds

- Functional Data Center page
- MorphMarket CSV/export upload button
- Generic spreadsheet CSV upload button
- Source template selector
- Auto column mapping
- Manual column mapping
- Import preview before saving
- Duplicate detection
- Missing name/species validation
- Bulk import of valid, non-duplicate rows
- JSON backup export
- CSV collection export
- JSON backup restore preview
- Print / Save as PDF action

## Important

For Excel files, export/save the sheet as CSV first. This v1 import supports CSV, TSV, and TXT files.

For MorphMarket, use official exports/files. This does not scrape or log into MorphMarket.

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

1. Go to Breeder Workspace.
2. Open Data Center.
3. Click Import MorphMarket CSV or Import spreadsheet CSV.
4. Pick a CSV.
5. Confirm the mapping fields.
6. Confirm preview shows rows.
7. Click Import ready animals.
8. Confirm animals appear in collection.
9. Test Export JSON backup and Export collection CSV.
