import { useTheme } from "../context/ThemeContext";
import { Icon } from "./ui";
import "../styles/sidebar.css";

const NAVIGATION_GROUPS = [
  {
    label: "Overview",
    items: [
      { page: "Dashboard", label: "Dashboard", icon: "dashboard" },
      { page: "Pets", label: "Pets", icon: "paw" },
      { page: "Favorites", label: "Favorites", icon: "star" },
      { page: "Add Pet", label: "Add Pet", icon: "plus" },
    ],
  },
  {
    label: "Care management",
    items: [
      { page: "Timeline", label: "Timeline", icon: "history" },
      { page: "Medications", label: "Medications", icon: "pill" },
      { page: "Calendar", label: "Calendar", icon: "calendar" },
      { page: "Care Guides", label: "Care Guides", icon: "book" },
    ],
  },
  {
    label: "Tools",
    items: [
      { page: "AI Assistant", label: "AI Assistant", icon: "bot" },
      { page: "Settings", label: "Settings", icon: "settings" },
    ],
  },
];

function formatRole(role) {
  if (!role) return "Owner";
  return String(role)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function Sidebar({ page, setPage, user }) {
  const { isDark, toggleTheme } = useTheme();
  const displayName = user?.displayName || user?.username || "Pet Keeper";
  const role = formatRole(user?.primaryRole);
  const nextThemeLabel = isDark ? "Light" : "Dark";

  return (
    <aside className="pp-sidebar" aria-label="Main navigation">
      <div className="pp-sidebar__brand">
        <div className="pp-sidebar__brand-mark" aria-hidden="true">
          <Icon name="scan" size={22} />
        </div>
        <div>
          <p className="pp-sidebar__brand-name">PetPassport</p>
          <p className="pp-sidebar__brand-subtitle">Animal care workspace</p>
        </div>
      </div>

      <section className="pp-sidebar__profile" aria-label="Current workspace">
        <p className="pp-sidebar__profile-label">Welcome back</p>
        <p className="pp-sidebar__profile-name">{displayName}</p>
        <span className="pp-sidebar__role">
          <Icon name="shield" size={14} />
          {role} workspace
        </span>
      </section>

      <nav className="pp-sidebar__nav">
        {NAVIGATION_GROUPS.map((group) => (
          <section className="pp-sidebar__section" key={group.label}>
            <p className="pp-sidebar__section-label">{group.label}</p>
            <div className="pp-sidebar__items">
              {group.items.map((item) => {
                const active = page === item.page;
                return (
                  <button
                    key={item.page}
                    type="button"
                    className={["pp-sidebar__item", active ? "is-active" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setPage(item.page)}
                  >
                    <span className="pp-sidebar__item-icon" aria-hidden="true">
                      <Icon name={item.icon} size={19} />
                    </span>
                    <span className="pp-sidebar__item-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <footer className="pp-sidebar__footer">
        <button
          type="button"
          className="pp-sidebar__theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${nextThemeLabel.toLowerCase()} theme`}
        >
          <span className="pp-sidebar__theme-icon" aria-hidden="true">
            <Icon name={isDark ? "sun" : "moon"} size={18} />
          </span>
          <span className="pp-sidebar__theme-copy">
            <strong>{nextThemeLabel} theme</strong>
            <small>Change workspace appearance</small>
          </span>
        </button>

        <p className="pp-sidebar__footer-note">
          Care records, schedules, and health details in one organized workspace.
        </p>
      </footer>
    </aside>
  );
}
