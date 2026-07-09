# PetPassport Care Guides + Smart Feeding v1 Pack

This pack adds expanded care-guide coverage and a species-aware feeding modal.

## What this adds

- Expanded care guide system
- Verified starter guides for common/core species
- Fallback starter guides for every species listed in the app taxonomy
- Last-reviewed labels
- Source notes inside care-guide cards
- Care guide search/filter by species, category, and guide type
- Species-aware feeding modal
- Snake prey-size dropdowns
- Mouse sizes: pinky, fuzzy, hopper, weaned, small, adult, large, jumbo
- Rat sizes: rat pinky, rat fuzzy, rat pup, weaned, small, medium, large, jumbo
- Bird prey sizes for chicks/quail
- Insect-size dropdowns for insect eaters
- Amount/portion options for omnivores, herbivores, aquatic animals, birds, and mammals
- Universal custom food entry for every species
- Save custom foods to that animal's food list
- Meal result tracking: ate, partial, refused, regurgitated, skipped intentionally
- Refusal/context reasons
- Gut-loaded, calcium-dusted, and vitamin-dusted toggles where applicable
- Structured feedingLogs stored on the pet record

## Important beta note

The app now covers every species in the current taxonomy, but not every species has a full species-specific verified guide yet.

- Verified starter guide = researched v1 species guide
- Fallback guide = category/group scaffold until a deeper species guide is added

This is intentional. It avoids pretending that niche species have fully custom husbandry data before we review them properly.

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

1. Open Care Guides.
2. Search for Ball Python, Leopard Gecko, Bearded Dragon, Corn Snake, Crested Gecko, and Axolotl.
3. Confirm verified starter guides show for those species.
4. Search a niche species, such as Carpet Python or Red-Eyed Crocodile Skink.
5. Confirm it shows a fallback starter guide instead of no result.
6. Open a snake and click Feed.
7. Choose Mouse or Rat and confirm the size dropdown changes.
8. Add a custom food and save it.
9. Open Feed again and confirm the custom food appears.
10. Log Refused and confirm the reason dropdown appears.
11. Test a lizard/gecko and confirm insect/portion options appear.
12. Confirm Share Passport and Transfer still work.
