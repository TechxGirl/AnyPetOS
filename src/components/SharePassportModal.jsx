import { useState } from "react";

// 🟢 Share View Options
const SHARE_VIEWS = {
  sitter: {
    label: "🐶 Pet Sitter",
    description: "Daily care, feeding, meds, emergency notes.",
  },
  vet: {
    label: "🩺 Veterinarian",
    description: "Medical history, meds, weight, status, timeline.",
  },
  buyer: {
    label: "🛒 Buyer / Adopter",
    description: "Species, morph, sex, DOB, weight, feeding, temperament.",
  },
  family: {
    label: "🏠 Family Member",
    description: "General care information and reminders.",
  },
  rescue: {
    label: "🦎 Rescue Organization",
    description: "Intake notes, recovery, meds, status, timeline.",
  },
};

export default function SharePassportModal({ pet, close }) {
  // 🟢 State
  const [view, setView] = useState("buyer");

  if (!pet) return null;

  // 🟢 Safe Defaults
  const latestWeight = pet.weightLogs?.[0];
  const foods = pet.foodList || [];
  const selectedView = SHARE_VIEWS[view];

  // 🟢 View Helpers
  const showIdentityDetails =
    view === "buyer" || view === "vet" || view === "rescue";

  const showCareDetails =
    view === "sitter" || view === "family" || view === "buyer";

  const showMedicalDetails =
    view === "vet" || view === "buyer" || view === "rescue";

  return (
    <div className="modalOverlay" onClick={close}>
      <div
        className="modal petProfileModal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🟢 Header */}
        <div className="profileHeader">
          <div>
            <h2>🔗 Share Passport</h2>
            <p>{pet.name}</p>
          </div>

          <button onClick={close}>✕</button>
        </div>

        {/* 🟢 Share View Selector */}
        <div className="card innerCard">
          <h3>Choose Share View</h3>

          <select value={view} onChange={(e) => setView(e.target.value)}>
            {Object.entries(SHARE_VIEWS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <p>{selectedView.description}</p>
        </div>

        {/* 🟢 Passport Preview */}
        <div className="card innerCard passportPreview">
          <h3>🛂 Passport Preview</h3>

          {/* 🟢 Core Passport Info */}
          <p>
            <strong>Passport ID:</strong>{" "}
            {pet.passportId || "Not assigned"}
          </p>

          <p>
            <strong>Name:</strong> {pet.name}
          </p>

          <p>
            <strong>Status:</strong> {pet.status || "Healthy"}
          </p>

          <p>
            <strong>Species:</strong> {pet.species || "Unknown"}
          </p>

          {/* 🟢 Buyer / Vet / Rescue Identity Info */}
          {showIdentityDetails && (
            <>
              <p>
                <strong>Morph / Breed:</strong>{" "}
                {pet.morph || "Not set"}
              </p>

              <p>
                <strong>Sex:</strong> {pet.sex || "Unknown"}
              </p>

              <p>
                <strong>DOB / Hatch:</strong>{" "}
                {pet.dob
                  ? new Date(pet.dob).toLocaleDateString()
                  : "Unknown"}
              </p>

              <p>
                <strong>Age Estimate:</strong>{" "}
                {pet.ageType === "estimated"
                  ? pet.estimatedAge || "Estimated"
                  : pet.ageType === "exact"
                  ? "Exact DOB Provided"
                  : "Unknown"}
              </p>

              <p>
                <strong>Temperament:</strong>{" "}
                {pet.temperament || "Not set"}
              </p>
            </>
          )}

          {/* 🟢 Sitter / Family / Buyer Care Info */}
          {showCareDetails && (
            <>
              <p>
                <strong>Foods:</strong>{" "}
                {foods.length > 0
                  ? foods.join(", ")
                  : pet.diet || "Not set"}
              </p>

              <p>
                <strong>Feeding Schedule:</strong>{" "}
                {pet.frequency
                  ? `Every ${pet.frequency} days`
                  : "Not set"}
              </p>
            </>
          )}

          {/* 🟢 Vet / Buyer / Rescue Medical Info */}
          {showMedicalDetails && (
            <>
              <p>
                <strong>Latest Weight:</strong>{" "}
                {latestWeight
                  ? `${latestWeight.weight} ${latestWeight.unit}`
                  : "No weight logged"}
              </p>

              <p>
                <strong>Medications:</strong>{" "}
                {pet.meds?.length
                  ? `${pet.meds.length} active / recorded`
                  : "None"}
              </p>

              <p>
                <strong>Timeline Entries:</strong>{" "}
                {pet.logs?.length || 0}
              </p>
            </>
          )}

          {/* 🟢 Sitter-Specific Info */}
          {view === "sitter" && (
            <>
              <p>
                <strong>Care Notes:</strong>{" "}
                {pet.notes || "No notes added."}
              </p>

              <p>
                <strong>Emergency Status:</strong>{" "}
                {pet.status || "Healthy"}
              </p>
            </>
          )}

          {/* 🟢 Future Actions */}
          <div className="buttonRow">
            <button
              onClick={() =>
                alert(
                  "QR/link sharing will come next. This is the preview system!"
                )
              }
            >
              Generate Share Link
            </button>

            <button
              onClick={() =>
                alert(
                  "PDF export will come later. Tiny passport printer goblin pending."
                )
              }
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}