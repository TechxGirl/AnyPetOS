# Morph Library v1 Changelog

## Added

- `src/data/morphLibrary.js`
  - starter morph options
  - morph/species key helpers
  - dedupe/merge helpers

- `src/hooks/useMorphLibrary.js`
  - loads starter options
  - loads community options from Supabase
  - lets authenticated users add shared morphs

- `src/components/MorphSelector.jsx`
  - dropdown selector
  - custom morph input
  - Add for everyone action
  - SQL-missing warning state

- `PETPASSPORT_MORPH_LIBRARY_V1.sql`
  - shared `morph_options` table
  - RLS policies
  - starter seed morphs

## Updated

- `AddPet.jsx`
  - replaced plain morph text input with shared morph selector

- `EditPetModal.jsx`
  - replaced plain morph text input with shared morph selector

- `App.css`
  - morph selector layout and responsive styles

## Notes

This version focuses on reptile morphs first while keeping the field generic as Morph / Breed / Variety so it still works for mammals, birds, invertebrates, localities, lines, phases, and user-created traits.
