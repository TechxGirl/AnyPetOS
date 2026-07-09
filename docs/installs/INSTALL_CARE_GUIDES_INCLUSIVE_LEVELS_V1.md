# PetPassport Care Guides Inclusive Levels v1 Pack

This pack fixes the cramped care guide cards and expands the guide system so every species category feels included, especially invertebrates.

## What this fixes

- Care guide metric tiles no longer overlap or squeeze together.
- Environment, feeding strategy, and substrate text wraps cleanly.
- Care levels are now standardized to:
  - Beginner
  - Intermediate
  - Advanced
- Added a care level filter.
- Added quick care-level chips with counts.
- Added more group-aware fallback guides for:
  - Isopods
  - Millipedes
  - Centipedes
  - Mantises
  - Beetles
  - Roaches
  - Snails
  - Aquatic invertebrates
  - Tarantulas
  - Spiders
  - Scorpions
  - Frogs/toads
  - Custom/unknown animals

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

Open Care Guides and search/filter:

- Dairy Cow Isopod
- Powder Orange Isopod
- Giant African Millipede
- Vietnamese Centipede
- Orchid Mantis
- Death Feigning Beetle
- Hissing Cockroach
- Mystery Snail
- Cherry Shrimp
- Mexican Fire Leg
- Regal Jumping Spider
- Emperor Scorpion

Then test the care level filters:

- Beginner
- Intermediate
- Advanced
