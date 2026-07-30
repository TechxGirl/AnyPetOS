import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  applyTheme,
  getInitialTheme,
  getStoredTheme,
  getSystemTheme,
  isTheme,
  saveTheme,
  THEME_STORAGE_KEY,
  THEMES,
} from "../utils/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY || !isTheme(event.newValue)) return;
      setThemeState(event.newValue);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (!getStoredTheme()) {
        setThemeState(getSystemTheme());
      }
    };

    mediaQuery.addEventListener?.("change", handleSystemChange);
    return () => mediaQuery.removeEventListener?.("change", handleSystemChange);
  }, []);

  const setTheme = useCallback((nextTheme) => {
    if (!isTheme(nextTheme)) return;
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) =>
      currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    );
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === THEMES.DARK,
      isLight: theme === THEMES.LIGHT,
      setTheme,
      toggleTheme,
    }),
    [setTheme, theme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
