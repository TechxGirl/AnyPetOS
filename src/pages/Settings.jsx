// =====================================================
// 🟢 Settings.jsx
//
// Application settings.
//
// Current Responsibilities:
// • User account
// • Logout
//
// Future Responsibilities:
// • Role selection
// • Theme
// • Notifications
// • Backup & Restore
// • Data Export
// • Account Settings
//
// =====================================================

export default function Settings({ user, setUser }) {
  // =====================================================
  // 🟢 Derived Data
  // =====================================================

  const displayName =
    user?.displayName ||
    user?.username ||
    user?.email ||
    user?.phone ||
    "Guest";

  // =====================================================
  // 🟢 Event Handlers
  // =====================================================

  const logout = () => {
    setUser(null);
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="feed">
      {/* =====================================================
          🟢 Page Header
      ===================================================== */}

      <div className="pageHeader">
        <h2>⚙️ Settings</h2>

        <p>Manage your PetPassport preferences.</p>
      </div>

      {/* =====================================================
          🟢 Account
      ===================================================== */}

      <div className="card">
        <h3>👤 Account</h3>

        <p>
          <strong>Logged in as:</strong> {displayName}
        </p>

        {user?.username && (
          <p>
            <strong>Username:</strong> @{user.username}
          </p>
        )}

        {user?.primaryRole && (
          <p>
            <strong>Current Mode:</strong>{" "}
            {user.primaryRole}
          </p>
        )}

        <button onClick={logout}>
          Log Out
        </button>
      </div>

      {/* =====================================================
          🟢 User Mode
      ===================================================== */}

      <div className="card">
        <h3>🧭 User Mode</h3>

        <p>
          This feature is coming soon.
        </p>

        <ul>
          <li>🐾 Pet Owner</li>
          <li>🧬 Breeder</li>
          <li>🦎 Rescue</li>
          <li>🩺 Veterinarian</li>
          <li>🏫 Education / Zoo</li>
          <li>🐶 Pet Sitter</li>
        </ul>
      </div>

      {/* =====================================================
          🟢 Planned Settings
      ===================================================== */}

      <div className="card">
        <h3>🚀 Planned Settings</h3>

        <ul>
          <li>🌙 Dark / Light Theme</li>
          <li>🔔 Reminder Notifications</li>
          <li>☁️ Cloud Sync</li>
          <li>💾 Backup & Restore</li>
          <li>📤 Export Data</li>
          <li>🔒 Privacy Settings</li>
          <li>🎟 Expo Mode</li>
        </ul>
      </div>
    </div>
  );
}