import { useState } from "react";
import { supabase } from "../services/supabaseClient";

// =====================================================
// 🟢 Auth.jsx
//
// Real Supabase authentication screen.
//
// Current Responsibilities:
// • Email signup
// • Email login
// • Auth errors
//
// Future Responsibilities:
// • Phone auth
// • Password reset
// • Email verification messaging
// • OAuth login
//
// =====================================================

export default function Auth() {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =====================================================
  // 🟢 Event Handlers
  // =====================================================

  const handleAuth = async () => {
    setLoading(true);
    setMessage("");

    const authAction =
      mode === "signup"
        ? supabase.auth.signUp({
            email,
            password,
          })
        : supabase.auth.signInWithPassword({
            email,
            password,
          });

    const { error } = await authAction;

    if (error) {
      setMessage(error.message);
    } else if (mode === "signup") {
      setMessage("Check your email to confirm your account.");
    } else {
      setMessage("Logged in successfully.");
    }

    setLoading(false);
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="loginScreen onboardingScreen">
      <div className="card onboardingCard">
        <h1>🐍 PetPassport</h1>

        <h2>
          {mode === "signup"
            ? "Create Your Account"
            : "Welcome Back"}
        </h2>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={handleAuth}
        >
          {loading
            ? "Working..."
            : mode === "signup"
            ? "Create Account"
            : "Log In"}
        </button>

        <button
          onClick={() =>
            setMode(mode === "signup" ? "login" : "signup")
          }
        >
          {mode === "signup"
            ? "Already have an account? Log in"
            : "Need an account? Sign up"}
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}