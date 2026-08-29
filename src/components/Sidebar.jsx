import { useTheme } from "../context/ThemeContextCore";
import { useWorkspace } from "../context/WorkspaceContextCore";
import { useFoundingBadges } from "../context/FoundingBadgeContext";
import { Icon } from "./ui";
import BrandLockup from "./brand/BrandLockup";
import "../styles/sidebar.css";

export default function Sidebar({ page, setPage, user }) {
  const { isDark, toggleTheme } = useTheme();
  const { workspace, enabledWorkspaceIds } = useWorkspace();
  const { getBadgeForRole } = useFoundingBadges();
  const activeFoundingBadge = getBadgeForRole(workspace.id);
  const displayName = user?.displayName || user?.username || "Morgan";
  const nextThemeLabel = isDark ? "Light" : "Dark";
  const enabledCount = enabledWorkspaceIds.length;
  const enabledCopy = `${enabledCount} workspace${enabledCount === 1 ? "" : "s"} enabled`;

  return (
    <aside
      className="pp-sidebar"
      aria-label="Main navigation"
      style={{ "--workspace-card-accent": workspace.accent }}
    >
      <div className="pp-sidebar__top">
        <button
          type="button"
          className="pp-sidebar__brand"
          onClick={() => setPage("Dashboard")}
          aria-label="Open dashboard"
        >
<BrandLockup compact />
        </button>

        <button
          type="button"
          className="pp-sidebar__workspace-card"
          onClick={() => setPage("Workspaces")}
          aria-label="Change active workspace"
        >
          <span className="pp-sidebar__workspace-kicker">Current workspace</span>
          <span className="pp-sidebar__workspace-row">
            <span className="pp-sidebar__workspace-icon" aria-hidden="true">
              <Icon name={workspace.icon} size={18} />
            </span>
            <span className="pp-sidebar__workspace-copy">
              <strong>{workspace.shortLabel}</strong>
              <small>{enabledCopy}</small>
            </span>
            <span className="pp-sidebar__workspace-arrow" aria-hidden="true">
              <Icon name="chevronRight" size={17} />
            </span>
          </span>
        </button>
      </div>

      <nav className="pp-sidebar__nav">
        {workspace.navigationGroups.map((group) => (
          <section className="pp-sidebar__section" key={group.label}>
            <p className="pp-sidebar__section-label">{group.label}</p>
            <div className="pp-sidebar__items">
              {group.items.map((item) => {
                const active = page === item.page;
                return (
                  <button
                    key={`${group.label}-${item.page}`}
                    type="button"
                    className={["pp-sidebar__item", active ? "is-active" : ""]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setPage(item.page)}
                  >
                    <span className="pp-sidebar__item-icon" aria-hidden="true">
                      <Icon name={item.icon} size={18} />
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
            <Icon name={isDark ? "sun" : "moon"} size={17} />
          </span>
          <span className="pp-sidebar__theme-copy">
            <strong>{nextThemeLabel} theme</strong>
            <small>Switch appearance</small>
          </span>
        </button>

        <div className="pp-sidebar__user-card" aria-label="Current user">
          <span className="pp-sidebar__user-avatar" aria-hidden="true">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
          <span className="pp-sidebar__user-copy">
            <strong>{displayName}</strong>
            <small>
              {activeFoundingBadge
                ? `Founding #${String(activeFoundingBadge.badgeNumber).padStart(3, "0")}`
                : `${workspace.shortLabel} workspace`}
            </small>
          </span>
        </div>
      </footer>
    </aside>
  );
}
