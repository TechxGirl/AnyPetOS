# Data Center v1 Changelog

## Fixed

- Data Center cards/buttons now trigger real actions.
- Data Center no longer acts as a passive roadmap placeholder.

## Added

- New `DataCenter.jsx` page.
- New `importExport.js` utility module.
- PageRenderer routes Data Center to the functional page.
- CSV/TSV parser.
- Source templates for MorphMarket, breeder sheets, rescue sheets, and generic CSV.
- Auto-mapping based on common column names.
- Manual mapping selectors.
- Import preview table.
- Duplicate warning system.
- Bulk import for valid non-duplicate animals.
- JSON backup download.
- CSV collection export.
- JSON backup restore preview.
- Print/Save as PDF action.

## Notes

- No new Supabase SQL is required.
- This v1 supports files the user uploads. It does not scrape external websites.
- True official API integrations can be added later if those platforms support/allow them.
