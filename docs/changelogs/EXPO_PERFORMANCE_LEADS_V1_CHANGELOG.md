# Expo Performance + Lead Pipeline Polish v1 Changelog

## Performance

- Expo Mode is lazy-loaded instead of being included in the initial PetPassport page bundle.
- Community Expo Discovery is lazy-loaded.
- The public Expo catalog is lazy-loaded for public routes.
- Added feature loading panels while lazy chunks open.
- Added a two-minute in-memory Expo session cache.
- Returning to Expo Mode can display cached event data immediately while refreshing in the background.
- Expo mutations refresh quietly instead of blanking the entire page.
- Community discovery uses a short public-event cache.
- Public Expo catalogs reuse a short memory cache during the current browser session.
- Public auto-refresh now pauses while the tab is hidden.
- Reduced Expo scan and update history fetch limits used by the live dashboard.
- Expired-hold cleanup no longer blocks the visible dashboard.
- QR generation is deferred until Kiosk & Print is opened.
- QRCode is dynamically imported for Expo and Passport sharing.
- Event, animal, vendor, care, and transfer QR generation still work.

## Lead pipeline

- Wider, cleaner lead cards.
- Contact details wrap instead of clipping.
- Animal photo, name, listing code, and contact preference are clearer.
- Open details and Create hold buttons use a reliable grid layout.
- Added pipeline stage navigation chips with live counts.
- Added smooth horizontal stage navigation.
- Sticky column headers.
- Lighter custom horizontal scrollbar.
- Empty stages use a more compact layout.
- Correct singular/plural lead counts.
- Expanded lead detail modal.
- Added quick email and phone actions.
- Added stage editing inside lead details.
- Added Create hold from the detail modal.
- Improved small-screen behavior.

## Build result

- Production build passed.
- Expo, Community, public Expo, Expo hooks, and QR tooling now build into separate chunks.
- Main JavaScript bundle changed from approximately 898.95 kB to 759.67 kB before gzip, a reduction of about 15.5% from the previous Expo build.
- The existing Vite 500 kB main-chunk warning remains because other PetPassport features are still bundled together. It is not a build failure.
