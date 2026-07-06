import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { USER_ROLES } from "../constants/roles";

// =====================================================
// 🟢 CreateProfile.jsx
//
// Creates the user's permanent PetPassport profile.
//
// =====================================================

export default function CreateProfile({ session }) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    role: "owner",
    avatarUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =====================================================
  // 🟢 Event Handlers
  // =====================================================

  const createProfile = async () => {
    setLoading(true);
    setMessage("");

    if (!form.displayName.trim()) {
      setMessage("Please enter a display name.");
      setLoading(false);
      return;
    }

    if (!form.username.trim()) {
      setMessage("Please choose a username.");
      setLoading(false);
      return;
    }

    const cleanUsername = form.username
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

    const { error } = await supabase.from("profiles").insert({
      id: session.user.id,
      display_name: form.displayName.trim(),
      username: cleanUsername,
      role: form.role,
      avatar_url: form.avatarUrl.trim() || null,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    window.location.reload();
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="loginScreen onboardingScreen">
      <div className="card onboardingCard">
        <h1>🐍 Welcome to PetPassport</h1>

        <p>
          Let’s build your workspace and create your permanent cloud profile.
        </p>

        <label>Display Name</label>
        <input
          placeholder="Example: Morgan"
          value={form.displayName}
          onChange={(e) =>
            setForm({
              ...form,
              displayName: e.target.value,
            })
          }
        />

        <label>Username</label>
        <input
          placeholder="Example: senpaimorgan"
          value={form.username}
          onChange={(e) =>
            setForm({
              ...form,
              username: e.target.value,
            })
          }
        />

        <label>Choose Your Workspace</label>

        <div className="roleGrid">
          {USER_ROLES.map((role) => (
            <button
              key={role.id}
              className={
                form.role === role.id
                  ? "roleCard selectedRoleCard"
                  : "roleCard"
              }
              onClick={() =>
                setForm({
                  ...form,
                  role: role.id,
                })
              }
              type="button"
            >
              <h3>
                {role.icon} {role.label}
              </h3>

              <p>{role.description}</p>
            </button>
          ))}
        </div>

        <label>Avatar URL</label>
        <input
          placeholder="Optional for now"
          value={form.avatarUrl}
          onChange={(e) =>
            setForm({
              ...form,
              avatarUrl: e.target.value,
            })
          }
        />

        <button disabled={loading} onClick={createProfile}>
          {loading ? "Creating..." : "✨ Create Workspace"}
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}