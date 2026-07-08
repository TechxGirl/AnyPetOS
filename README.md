# PetPassport complete source with light and dark themes

This package contains the full `src` folder from the professional PetPassport build, now updated with a persistent light/dark appearance system.

## Theme features

- Professional light theme and dark theme
- Theme selector on the Settings page
- Quick theme switcher in the desktop sidebar
- Quick theme switcher in the mobile header
- The selected theme is stored in browser local storage
- A first-time user starts with their operating-system preference
- The theme is applied before React renders, preventing a bright/dark startup flash
- No Supabase migration or new dependency is required

## Installation

1. Stop the Vite development server.
2. Back up the current project `src` folder.
3. Extract this package.
4. Replace the project's current `src` folder with the included `src` folder.
5. Keep the existing `.env`, `package.json`, `vite.config.*`, and Supabase configuration.
6. Restart the application:

```powershell
npm install
npm run dev
```

7. Hard refresh the browser with `Ctrl + Shift + R`.

## Where users change the theme

- Desktop: the theme control is at the bottom of the sidebar.
- Mobile: the sun/moon button is in the top header.
- Settings: open **Settings → Appearance** and choose Light or Dark.

## Main theme files

```text
src/context/ThemeContext.jsx
src/utils/theme.js
src/styles/tokens.css
src/components/ui/ThemeSelector.jsx
```

The color palette is centralized in `src/styles/tokens.css`. Components should continue using `--pp-*` variables rather than hard-coded light or dark colors.

## Preference storage

The selected theme is stored under:

```text
petpassport-theme
```

This is currently a per-browser/device preference. A future account-synced preference can be stored in the user's Supabase profile without changing the component API.

## Verification checklist

- Sign in and confirm the dashboard loads normally.
- Switch to Light in Settings and visit every page.
- Refresh the browser and confirm Light remains active.
- Switch to Dark from the sidebar.
- Test the mobile header theme button.
- Open feeding, weight, medication, shed, edit, profile, share, and confirmation modals in both themes.
- Confirm inputs, dropdowns, badges, disabled buttons, and toast messages remain readable.
- Confirm the navigation drawer still opens and closes on mobile.

## Validation completed

- JavaScript/JSX syntax parsing
- Relative import-path validation
- CSS variable definition validation
- Archive integrity validation

A full live Supabase test still requires the project's own environment variables and installed dependencies.
