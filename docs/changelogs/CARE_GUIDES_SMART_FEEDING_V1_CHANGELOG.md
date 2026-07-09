# Care Guides + Smart Feeding v1 Changelog

## Added

### Care Guides

- New `src/data/careGuides.js`
- Detailed starter guides for:
  - Ball Python
  - Corn Snake
  - Leopard Gecko
  - Bearded Dragon
  - Crested Gecko
  - Axolotl
- Fallback guide generator for every species in `ANIMAL_TAXONOMY`
- Source labels and last-reviewed labels
- Care Guide page redesign with search, category filter, and verified/fallback filter

### Smart Feeding

- New `src/data/feedingOptions.js`
- Species-aware feeding strategy detection
- Snake meal-size dropdowns
- Mouse, rat, bird prey, insect, produce, aquatic, and generic portion options
- Universal custom food entry
- Save custom food per animal
- Meal result tracking
- Refusal/context reason tracking
- Gut-loaded / calcium-dusted / vitamin-dusted tracking
- Structured `feedingLogs` on each pet record

## Updated

- `FeedModal.jsx`
  - Rebuilt into a two-panel smart feeding form

- `App.jsx`
  - Feeding logs now save structured feeding data
  - Custom food options save back to the animal
  - Refusals do not automatically update last-fed/next-feed

- `normalizePet.js`
  - Preserves `feedingLogs`
  - Preserves `customFoodOptions`

- `CareGuide.jsx`
  - Rebuilt into a real species-aware reference library

- `App.css`
  - Added care-guide and smart-feeding visual styles

## Preserved

- Real pet photos
- Premium UI styling
- Workspace system
- Data Center
- Workspace actions
- Share/revoke/regenerate
- Transfer ownership

## Not included yet

- Full species-specific research for every niche species
- Vet-reviewed medical treatment protocols
- Supabase tables dedicated to feeding logs
- AI health diagnosis
- Automated care recommendations based on weight trend
