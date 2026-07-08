import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Icon, IconButton } from "../components/ui";
import "../styles/app-layout.css";

export default function AppLayout({ sidebar, children }) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setNavigationOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div
      className={[
        "pp-app-shell",
        navigationOpen ? "is-navigation-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="pp-app-shell__backdrop"
        aria-label="Close navigation"
        onClick={() => setNavigationOpen(false)}
      />

      <div
        className="pp-app-shell__sidebar"
        onClick={(event) => {
          if (event.target.closest(".pp-sidebar__item")) {
            setNavigationOpen(false);
          }
        }}
      >
        {sidebar}
      </div>

      <div className="pp-app-shell__content">
        <header className="pp-app-shell__mobile-header">
          <div className="pp-app-shell__mobile-brand">
            <Icon name="scan" size={21} />
            <span>PetPassport</span>
          </div>

          <div className="pp-app-shell__mobile-actions">
            <IconButton
              variant="ghost"
              label={`Switch to ${isDark ? "light" : "dark"} theme`}
              icon={<Icon name={isDark ? "sun" : "moon"} size={20} />}
              onClick={toggleTheme}
            />
            <IconButton
              variant="ghost"
              label={navigationOpen ? "Close navigation" : "Open navigation"}
              icon={
                <Icon name={navigationOpen ? "close" : "menu"} size={21} />
              }
              onClick={() => setNavigationOpen((current) => !current)}
            />
          </div>
        </header>

        <main className="pp-app-shell__main">{children}</main>
      </div>
    </div>
  );
}
