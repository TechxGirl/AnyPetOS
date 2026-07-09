# Breed / Variety Library v1 Changelog

## Added

- Expanded starter option library for:
  - Mammals
  - Fish
  - Birds
  - Amphibians
  - Invertebrates
  - Additional reptiles
- New SQL seed file for global starter options:
  - `PETPASSPORT_BREED_VARIETY_LIBRARY_EXPANSION_V1.sql`

## Updated

- Morph selector label is now `Morph / Breed / Variety / Strain`.
- Placeholder text now supports custom morphs, breeds, varieties, strains, phases, localities, and lines.
- Toast language now says `Option shared` instead of only `Morph shared`.

## Preserved

- Existing morph library table
- Existing custom “Add for everyone” flow
- Existing create/edit animal flow
- Share/revoke/regenerate/transfer
- Smart feeding and care guide features
- Real pet photos and UI polish

## Notes

This still uses the existing `morph_options` database table. The table name is a little narrow, but the field is now intentionally broader at the product level. A future database cleanup can rename this concept to `trait_options` or `animal_variety_options` if desired.
