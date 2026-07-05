import { useState } from "react";

// =====================================================
// 🟢 AI.jsx
//
// PetPassport AI Assistant
//
// Current Responsibilities:
// • Daily collection briefing
// • Today's priorities
// • Simple demo Q&A
//
// Future Responsibilities:
// • Real AI answers
// • Voice logging
// • Pattern detection
// • Health insights
//
// =====================================================

export default function AI({ pets }) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // =====================================================
  // 🟢 Data Helpers
  // =====================================================

  const now = Date.now();

  const overdueFeedings = pets.filter(
    (pet) => pet.nextFeed && now > pet.nextFeed
  );

  const favoritePets = pets.filter((pet) => pet.favorite);

  const medsDue = pets.flatMap((pet) =>
    (pet.meds || [])
      .filter((med) => {
        if (!med.lastGiven) return true;

        const nextDose =
          med.lastGiven + Number(med.frequencyHours) * 60 * 60 * 1000;

        return now >= nextDose;
      })
      .map((med) => ({
        petName: pet.name,
        medName: med.name,
        dose: med.dose,
      }))
  );

  const sickOrMonitoring = pets.filter((pet) =>
    ["Sick", "Monitoring", "Quarantine"].includes(pet.status)
  );

  // =====================================================
  // 🟢 Actions
  // =====================================================

  const askLocalAI = () => {
    if (!question.trim()) return;

    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("due") || lowerQuestion.includes("today")) {
      setAnswer(
        `Today's priorities:

🍽 Feedings due: ${overdueFeedings.length}
💊 Medications due: ${medsDue.length}
⚠️ Animals needing attention: ${sickOrMonitoring.length}

This is demo intelligence using your PetPassport data.`
      );
      return;
    }

    if (lowerQuestion.includes("med")) {
      setAnswer(
        medsDue.length > 0
          ? `Medications due:\n\n${medsDue
              .map(
                (med) =>
                  `💊 ${med.petName}: ${med.medName}${
                    med.dose ? ` (${med.dose})` : ""
                  }`
              )
              .join("\n")}`
          : "No medications are due right now."
      );
      return;
    }

    if (lowerQuestion.includes("favorite")) {
      setAnswer(
        favoritePets.length > 0
          ? `Favorite pets:\n\n${favoritePets
              .map((pet) => `⭐ ${pet.name}`)
              .join("\n")}`
          : "You don't have any favorite pets yet."
      );
      return;
    }

    setAnswer(
      `🚧 Expo Demo Mode

Soon PetPassport AI will understand your full collection and answer questions like:

• Who needs fed today?
• Which pets are on medication?
• Who is in quarantine?
• When did Big Mama last shed?
• Who has refused meals recently?
• Which animals should I bring to the expo?

For now, this page is using simple local PetPassport data.`
    );
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="feed">
      {/* 🟢 Header */}
      <div className="pageHeader">
        <h2>🧠 Ask PetPassport</h2>
        <p>Your intelligent animal care command center.</p>
      </div>

      {/* 🟢 Daily Briefing */}
      <div className="card">
        <h3>👋 Today's Collection Briefing</h3>

        <p>🐾 Total Pets: {pets.length}</p>
        <p>⭐ Favorites: {favoritePets.length}</p>
        <p>🍽 Feedings Due: {overdueFeedings.length}</p>
        <p>💊 Medications Due: {medsDue.length}</p>
        <p>⚠️ Need Attention: {sickOrMonitoring.length}</p>
      </div>

      {/* 🟢 Today's Priorities */}
      <div className="card">
        <h3>📋 Today's Priorities</h3>

        {overdueFeedings.length === 0 &&
        medsDue.length === 0 &&
        sickOrMonitoring.length === 0 ? (
          <p>Everything looks calm right now.</p>
        ) : (
          <>
            {overdueFeedings.map((pet) => (
              <p key={`feed-${pet.id}`}>🍽 Feed {pet.name}</p>
            ))}

            {medsDue.map((med, index) => (
              <p key={`med-${index}`}>
                💊 Give {med.petName} {med.medName}
              </p>
            ))}

            {sickOrMonitoring.map((pet) => (
              <p key={`status-${pet.id}`}>
                ⚠️ Check {pet.name} — {pet.status}
              </p>
            ))}
          </>
        )}
      </div>

      {/* 🟢 Ask PetPassport */}
      <div className="card">
        <h3>Ask PetPassport</h3>

        <input
          placeholder="Try: who is due today, meds due, favorites..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button onClick={askLocalAI}>Ask</button>

        {answer && (
          <div className="card innerCard">
            <pre style={{ whiteSpace: "pre-wrap" }}>{answer}</pre>
          </div>
        )}
      </div>

      {/* 🟢 Coming Soon */}
      <div className="card">
        <h3>🚀 Coming Soon</h3>

        <ul>
          <li>🎤 Voice logging</li>
          <li>📷 AI photo identification</li>
          <li>🧬 Morph identification</li>
          <li>📈 Feeding and weight pattern insights</li>
          <li>⚠️ Early warning alerts</li>
        </ul>
      </div>
    </div>
  );
}