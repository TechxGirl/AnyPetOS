// =====================================================
// 🟢 AppLayout.jsx
//
// Main application layout.
//
// =====================================================

export default function AppLayout({ sidebar, children }) {
  return (
    <div className="appShell">
      {sidebar}

      <main className="mainContent">{children}</main>
    </div>
  );
}