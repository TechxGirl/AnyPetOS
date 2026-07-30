import { useState } from "react";
import { USER_ROLES } from "../constants/roles";
import { Icon } from "./ui";
import { createId } from "../utils/id";

// =====================================================
// 🟢 Onboarding.jsx
//
// First-time onboarding experience.
//
// Responsibilities:
// • Welcome new users
// • Create account (UI)
// • Create profile
// • Choose role
// • Preview role experience
//
// Future:
// • Supabase Authentication
// • Email / Phone Verification
// • Profile Photos
// • Password Recovery
//
// =====================================================

export default function Onboarding({ setUser }) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [step, setStep] = useState("welcome");

  const [account, setAccount] = useState({
    loginMethod: "email",
    email: "",
    phone: "",
    username: "",
    displayName: "",
    primaryRole: "",
    roles: [],
  });

  // =====================================================
  // 🟢 Derived Data
  // =====================================================

  const selectedRole = USER_ROLES.find(
    (role) => role.id === account.primaryRole
  );
  const STEP_PROGRESS = {
  welcome: 0,
  account: 20,
  profile: 40,
  role: 60,
  rolePreview: 80,
};

const progress = STEP_PROGRESS[step] || 0;

  // =====================================================
  // 🟢 Event Handlers
  // =====================================================

  const chooseRole = (roleId) => {
    setAccount({
      ...account,
      primaryRole: roleId,
      roles: [roleId],
    });

    setStep("rolePreview");
  };

  const finishOnboarding = () => {
    setUser({
      id: createId("profile"),
      ...account,
      createdAt: Date.now(),
    });
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="loginScreen onboardingScreen">
    <div className="progressContainer">
  <small>
  {step === "welcome" && "Welcome!"}

  {step === "account" && "Creating your account..."}

  {step === "profile" && "Building your profile..."}

  {step === "role" && "Choosing your experience..."}

  {step === "rolePreview" && "Almost ready..."}
</small>

  <div className="progressBar">
    <div
      className="progressFill"
      style={{ width: `${progress}%` }}
    />
  </div>

  <small>{progress}% Complete</small>
</div>

      {/* =====================================================
          🟢 Welcome
      ===================================================== */}

      {step === "welcome" && (
        <div className="card onboardingCard">
          <h1 className="onboardingTitle"><Icon name="scan" size={30} /> Welcome to AnyPetOS</h1>

          <p>
            Build digital passports, track care, manage records,
            and keep every animal's history in one place.
          </p>

          <button onClick={() => setStep("account")}>
            Get Started
          </button>
        </div>
      )}

      {/* =====================================================
          🟢 Account Setup
      ===================================================== */}

      {step === "account" && (
        <div className="card onboardingCard">
          <h2>Create Your Account</h2>

          <div className="buttonRow">
            <button
              className={
                account.loginMethod === "email"
                  ? "activeButton"
                  : ""
              }
              onClick={() =>
                setAccount({
                  ...account,
                  loginMethod: "email",
                })
              }
            >
              Email
            </button>

            <button
              className={
                account.loginMethod === "phone"
                  ? "activeButton"
                  : ""
              }
              onClick={() =>
                setAccount({
                  ...account,
                  loginMethod: "phone",
                })
              }
            >
              Phone
            </button>
          </div>

          {account.loginMethod === "email" ? (
            <input
              placeholder="Email address"
              value={account.email}
              onChange={(e) =>
                setAccount({
                  ...account,
                  email: e.target.value,
                })
              }
            />
          ) : (
            <input
              placeholder="Phone number"
              value={account.phone}
              onChange={(e) =>
                setAccount({
                  ...account,
                  phone: e.target.value,
                })
              }
            />
          )}

          <input
            type="password"
            placeholder="Password"
          />

          <div className="buttonRow">
  <button onClick={() => setStep("welcome")}>
    ← Back
  </button>

  <button onClick={() => setStep("profile")}>
    Continue →
  </button>
</div>
        </div>
      )}

      {/* =====================================================
          🟢 Profile Setup
      ===================================================== */}

      {step === "profile" && (
        <div className="card onboardingCard">
          <h2>Create Your Identity</h2>

          <input
            placeholder="Username"
            value={account.username}
            onChange={(e) =>
              setAccount({
                ...account,
                username: e.target.value,
              })
            }
          />

          <input
            placeholder="Display name or business name"
            value={account.displayName}
            onChange={(e) =>
              setAccount({
                ...account,
                displayName: e.target.value,
              })
            }
          />

          <div className="buttonRow">
  <button onClick={() => setStep("account")}>
    ← Back
  </button>

  <button onClick={() => setStep("role")}>
    Continue →
  </button>
</div>
        </div>
      )}

      {/* =====================================================
          🟢 Role Selection
      ===================================================== */}

      {step === "role" && (
        <div className="card onboardingCard">
          <h2>What best describes you?</h2>

          <p>
            Choose your starting experience.
            You can change this later in Settings.
          </p>

<div className="buttonRow">
  <button onClick={() => setStep("profile")}>
    ← Back
  </button>
</div>

          <div className="roleGrid">
            {USER_ROLES.map((role) => (
              <button
                key={role.id}
                className="roleCard"
                onClick={() => chooseRole(role.id)}
              >
                <h3 className="roleTitle">
                  <Icon name={role.icon} size={19} /> {role.label}
                </h3>

                <p>{role.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================
          🟢 Role Preview
      ===================================================== */}

      {step === "rolePreview" && selectedRole && (
        <div className="card onboardingCard">
          <h2 className="roleTitle">
            <Icon name={selectedRole.icon} size={22} /> Welcome to{" "}
            {selectedRole.label} Mode
          </h2>

          <p>{selectedRole.description}</p>

          <h3>What you'll love:</h3>

          <ul>
            {selectedRole.features?.map((feature) => (
              <li key={feature}>
                ✓ {feature}
              </li>
            ))}
          </ul>

          <div className="buttonRow">
  <button onClick={() => setStep("role")}>
    ← Back
  </button>

  <button onClick={finishOnboarding}>
    Enter AnyPetOS →
  </button>
</div>
        </div>
      )}

    </div>
  );
}