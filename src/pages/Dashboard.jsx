import Feed from "../components/Feed";
import StatCard from "../components/StatCard";

// =====================================================
// 🟢 Dashboard.jsx
//
// Main command center for PetPassport.
//
// =====================================================

export default function Dashboard({
  profile,
  pets,
  feedPet,
  addLog,
  startEdit,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
  setPage,
}) {
  // =====================================================
  // 🟢 Greeting Data
  // =====================================================

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  const workspaceNames = {
    owner: "🌿 Owner Workspace",
    breeder: "🧬 Breeder Workspace",
    rescue: "🛟 Rescue Workspace",
    veterinarian: "🏥 Veterinary Workspace",
    education: "🏫 Education Workspace",
    petsitter: "🐾 Pet Sitter Workspace",
  };

  const workspace = workspaceNames[profile?.role] || "🐍 PetPassport";

  // =====================================================
  // 🟢 Dashboard Data
  // =====================================================

  const now = Date.now();

  const overdueFeedings = pets.filter(
    (pet) => pet.nextFeed && now > pet.nextFeed
  );

  const favoritePets = pets.filter((pet) => pet.favorite);

  const attentionPets = pets.filter((pet) =>
    ["Sick", "Monitoring", "Quarantine"].includes(pet.status)
  );

  // =====================================================
  // 🟢 Medication Reminder Data
  // =====================================================

  const medReminders = pets.flatMap((pet) =>
    (pet.meds || []).map((med) => {
      const nextDose = med.lastGiven
        ? med.lastGiven + Number(med.frequencyHours) * 60 * 60 * 1000
        : null;

      const isDue = !nextDose || now >= nextDose;

      return {
        petName: pet.name,
        medName: med.name,
        dose: med.dose,
        route: med.route,
        nextDose,
        isDue,
      };
    })
  );

  const dueMeds = medReminders.filter((med) => med.isDue);

  const upcomingMeds = medReminders
    .filter((med) => !med.isDue)
    .sort((a, b) => a.nextDose - b.nextDose)
    .slice(0, 3);

  // =====================================================
  // 🟢 Today's Focus Data
  // =====================================================

  const todayFocus = [
    ...dueMeds.map((med) => ({
      id: `med-${med.petName}-${med.medName}`,
      icon: "💊",
      title: med.petName,
      subtitle: `${med.medName}${med.dose ? ` • ${med.dose}` : ""}`,
      status: "Due now",
    })),
    ...overdueFeedings.slice(0, 3).map((pet) => ({
      id: `feed-${pet.id}`,
      icon: "🍽️",
      title: pet.name,
      subtitle: "Feeding is overdue",
      status: "Needs care",
    })),
    ...attentionPets.slice(0, 3).map((pet) => ({
      id: `attention-${pet.id}`,
      icon: "⚠️",
      title: pet.name,
      subtitle: `${pet.status} status`,
      status: "Monitor",
    })),
  ].slice(0, 5);

  // =====================================================
  // 🟢 Empty Dashboard
  // =====================================================

  if (pets.length === 0) {
    return (
      <div className="feed">
        <div className="card onboardingCard">
          <h1>🛂 Create Your First Passport</h1>

          <p>
            Every animal has a story. Start by creating your first digital
            Passport so you can track care, feeding, medications, weights,
            sheds, and history in one place.
          </p>

          <button onClick={() => setPage("Add Pet")}>
            Create First Passport →
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="feed">
      {/* =====================================================
          🟢 Dashboard Hero
      ===================================================== */}

      <div className="dashboardHero">
        <div>
          <h1>
            👋 {greeting}, {profile?.display_name}!
          </h1>

          <p>Welcome back to your {workspace}.</p>
        </div>

        <div className="heroStats">
          <span>{pets.length} Passports</span>
          <span>{dueMeds.length} Meds Due</span>
          <span>{attentionPets.length} Need Attention</span>
        </div>
      </div>

      {/* =====================================================
          🟢 Today's Focus
      ===================================================== */}

      <div className="card focusCard">
        <h3>📋 Today's Focus</h3>

        {todayFocus.length === 0 ? (
          <p>Everything looks calm today. No urgent care tasks right now.</p>
        ) : (
          <div className="focusList">
            {todayFocus.map((item) => (
              <div key={item.id} className="focusItem">
                <span className="focusIcon">{item.icon}</span>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.subtitle}</p>
                </div>

                <small>{item.status}</small>
              </div>
            ))}
          </div>
        )}
      </div>

     {/* 🟢 Overview Cards */}

<div className="statGrid">

  <StatCard
    icon="🐍"
    value={pets.length}
    label="Passports"
    color="#35d49a"
  />

  <StatCard
    icon="⭐"
    value={favoritePets.length}
    label="Favorites"
    color="#f7c948"
  />

  <StatCard
    icon="🍽️"
    value={overdueFeedings.length}
    label="Feedings"
    color="#ff7b54"
  />

  <StatCard
    icon="💊"
    value={dueMeds.length}
    label="Medications"
    color="#6c63ff"
  />

  <StatCard
    icon="⚠️"
    value={attentionPets.length}
    label="Need Attention"
    color="#ff5d73"
  />

</div>

      {/* =====================================================
          🟢 Medication Reminders
      ===================================================== */}

      <div className="card">
        <h3>💊 Medication Reminders</h3>

        {medReminders.length === 0 ? (
          <p>No active medications yet.</p>
        ) : (
          <>
            {dueMeds.length > 0 && (
              <>
                <h4>Due Now / Overdue</h4>

                {dueMeds.map((med, index) => (
                  <div
                    key={`due-${index}`}
                    className="reminderLine overdueLine"
                  >
                    <strong>{med.petName}</strong>

                    <span>
                      {med.medName}
                      {med.dose ? ` • ${med.dose}` : ""}
                    </span>

                    <small>Due now</small>
                  </div>
                ))}
              </>
            )}

            {upcomingMeds.length > 0 && (
              <>
                <h4>Upcoming</h4>

                {upcomingMeds.map((med, index) => (
                  <div
                    key={`upcoming-${index}`}
                    className="reminderLine"
                  >
                    <strong>{med.petName}</strong>

                    <span>
                      {med.medName}
                      {med.dose ? ` • ${med.dose}` : ""}
                    </span>

                    <small>
                      {new Date(med.nextDose).toLocaleString()}
                    </small>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* =====================================================
          🟢 Live Feed
      ===================================================== */}

      <Feed
        pets={pets}
        feedPet={feedPet}
        addLog={addLog}
        startEdit={startEdit}
        openProfile={openProfile}
        openQuickMeds={openQuickMeds}
        openShedModal={openShedModal}
        toggleFavorite={toggleFavorite}
      />
    </div>
  );
}