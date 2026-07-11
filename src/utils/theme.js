export const THEME_STORAGE_KEY = "petpassport-theme";
export const THEMES = Object.freeze({
  LIGHT: "light",
  DARK: "dark",
});

export function isTheme(value) {
  return value === THEMES.LIGHT || value === THEMES.DARK;
}

export function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return THEMES.DARK;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? THEMES.DARK
    : THEMES.LIGHT;
}

export function getStoredTheme() {
  if (typeof window === "undefined") return null;

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : null;
  } catch (error) {
    console.warn("AnyPetOS could not read the saved theme preference.", error);
    return null;
  }
}

export function getInitialTheme() {
  return getStoredTheme() || getSystemTheme();
}

export function applyTheme(theme) {
  const resolvedTheme = isTheme(theme) ? theme : getSystemTheme();

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
  }

  return resolvedTheme;
}

export function saveTheme(theme) {
  if (typeof window === "undefined" || !isTheme(theme)) return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn("AnyPetOS could not save the theme preference.", error);
  }
}
