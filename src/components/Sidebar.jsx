// =====================================================
// 🟢 Sidebar.jsx
//
// Main navigation for PetPassport.
//
// Current Responsibilities:
// • Application branding
// • User greeting
// • Current role display
// • Navigation
//
// Future Responsibilities:
// • Workspace Switcher
// • Notifications
// • Profile Menu
// • Quick Actions
//
// =====================================================

// =====================================================
// 🟢 Navigation Items
// =====================================================

const NAVIGATION = [
  { name: "Dashboard", icon: "🏠" },
  { name: "Pets", icon: "🐾" },
  { name: "Favorites", icon: "⭐" },
  { name: "Add Pet", icon: "➕" },
  { name: "Timeline", icon: "📜" },
  { name: "Medications", icon: "💊" },
  { name: "Calendar", icon: "📅" },
  { name: "Care Guides", icon: "📖" },
  { name: "AI Assistant", icon: "🤖" },
  { name: "Settings", icon: "⚙️" },
];

export default function Sidebar({
  page,
  setPage,
  user,
}) {
  // =====================================================
  // 🟢 Derived Data
  // =====================================================

  const displayName =
    user?.displayName ||
    user?.username ||
    "Guest";

  const roleName =
    user?.primaryRole || "Owner";

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <aside className="sidebar">

      {/* =====================================================
          🟢 Branding
      ===================================================== */}

      <div className="logo">
        <h2>🐍 PetPassport</h2>

        <p>
          Welcome back,
          <br />
          <strong>{displayName}</strong>
        </p>

        <small>
          {roleName.charAt(0).toUpperCase() +
            roleName.slice(1)} Mode
        </small>
      </div>

      {/* =====================================================
          🟢 Navigation
      ===================================================== */}

      <nav>
        {NAVIGATION.map((item) => (
          <button
            key={item.name}
            className={
              page === item.name
                ? "navButton active"
                : "navButton"
            }
            onClick={() => setPage(item.name)}
          >
            <span className="navIcon">
              {item.icon}
            </span>

            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}