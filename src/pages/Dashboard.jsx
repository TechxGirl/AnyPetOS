import Feed from "../components/Feed";
import ReminderCard from "../components/ReminderCard";

// =====================================================
// 🟢 Dashboard.jsx
//
// Main command center for PetPassport.
//
// Current Responsibilities:
// • Collection overview cards
// • Feeding reminders
// • Medication reminders
// • Live feed preview
//
// Future Responsibilities:
// • Today's checklist
// • Expo prep summary
// • Weight reminders
// • Shed reminders
// • AI insights
//
// =====================================================

export default function Dashboard({
  pets,
  feedPet,
  addLog,
  startEdit,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
}) {
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
  // 🟢 Render
  // =====================================================

  return (
    <div className="feed">
      {/* 🟢 Page Header */}
      <div className="pageHeader">
        <h2>🏠 Dashboard</h2>
        <p>Your animal care command center.</p>
      </div>

      {/* 🟢 Overview Cards */}
      <div className="petGrid">
        <ReminderCard title="Total Pets" value={pets.length} />

        <ReminderCard
          title="Favorites"
          value={favoritePets.length}
        />

        <ReminderCard
          title="Overdue Feedings"
          value={overdueFeedings.length}
          tone={overdueFeedings.length > 0 ? "danger" : "normal"}
        />

        <ReminderCard
          title="Meds Due"
          value={dueMeds.length}
          tone={dueMeds.length > 0 ? "danger" : "normal"}
        />

        <ReminderCard
          title="Need Attention"
          value={attentionPets.length}
          tone={attentionPets.length > 0 ? "danger" : "normal"}
        />
      </div>

      {/* 🟢 Medication Reminders */}
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

      {/* 🟢 Live Feed */}
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