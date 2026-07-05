// =====================================================
// 🟢 Sidebar.jsx
//
// Main navigation for PetPassport.
//
// Includes:
// • Navigation buttons
// • Current page highlighting
// • App branding
//
// =====================================================

// 🟢 Navigation Items
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

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      {/* 🟢 Logo */}
      <div className="logo">
        <h2>🐍 PetPassport</h2>
        <p>Animal care command center</p>
      </div>

      {/* 🟢 Navigation */}
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