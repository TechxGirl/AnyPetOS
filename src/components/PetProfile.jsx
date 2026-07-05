export default function PetProfile({
  pet,
  close,
  feedPet,
  startEdit,
  deletePet,
  openQuickMeds,
  openWeightModal,
  openSharePassport,
  openShedModal,
}) {
  // 🟢 Safe Defaults
  const logs = pet.logs || [];
  const meds = pet.meds || [];
  const foods = pet.foodList || [];

  return (
    <div className="modalOverlay" onClick={close}>
      <div
        className="modal petProfileModal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🟢 Passport Header */}
        <div className="profileHeader">
          <div>
            <h2>🐾 {pet.name}</h2>

            <p className="passportId">
              🛂 Passport ID: {pet.passportId || "Not assigned"}
            </p>

            <span
              className={`statusBadge status-${(
                pet.status || "Healthy"
              ).toLowerCase()}`}
            >
              {pet.status || "Healthy"}
            </span>

            <p>{pet.species || "Unknown species"}</p>
          </div>

          <button onClick={close}>✕</button>
        </div>

        {/* 🟢 Passport Stats */}
        <div className="profileGrid">
          <div className="profileStat">
            <p>Sex</p>
            <strong>{pet.sex || "Unknown"}</strong>
          </div>

          <div className="profileStat">
            <p>DOB / Hatch Date</p>
            <strong>
              {pet.dob ? new Date(pet.dob).toLocaleDateString() : "Unknown"}
            </strong>
          </div>

          <div className="profileStat">
            <p>Age Estimate</p>
            <strong>
              {pet.ageType === "estimated"
                ? pet.estimatedAge || "Estimated"
                : pet.ageType === "exact"
                ? "Exact DOB Provided"
                : "Unknown"}
            </strong>
          </div>

          <div className="profileStat">
            <p>Morph / Breed</p>
            <strong>{pet.morph || "Not set"}</strong>
          </div>

          <div className="profileStat">
            <p>Temperament</p>
            <strong>{pet.temperament || "Not set"}</strong>
          </div>

          <div className="profileStat">
            <p>Foods</p>
            <strong>
              {foods.length > 0 ? foods.join(", ") : pet.diet || "Not set"}
            </strong>
          </div>

          <div className="profileStat">
            <p>Feeding Schedule</p>
            <strong>
              {pet.frequency ? `Every ${pet.frequency} days` : "Not set"}
            </strong>
          </div>

          <div className="profileStat">
            <p>Substrate / Housing</p>
            <strong>{pet.substrate || "Not set"}</strong>
          </div>
        </div>

        {/* 🟢 Main Actions */}
        <div className="buttonRow">
          <button onClick={() => feedPet(pet.id)}>🍽 Log Feeding</button>
          <button onClick={() => openWeightModal(pet.id)}>⚖️ Log Weight</button>
          <button onClick={() => openShedModal(pet.id)}>🐍 Log Shed</button>
          <button onClick={() => openQuickMeds(pet.id)}>💊 Meds</button>
          <button onClick={() => openSharePassport(pet.id)}>
            🔗 Share Passport
          </button>
          <button onClick={() => startEdit(pet)}>✏️ Edit</button>

          <button
            className="dangerButton"
            onClick={() => {
              if (!deletePet) {
                alert("Delete function is not connected yet.");
                return;
              }

              deletePet(pet.id);
            }}
          >
            🗑 Delete Profile
          </button>
        </div>

        {/* 🟢 Notes */}
        <div className="card innerCard">
          <h3>📝 Notes</h3>
          <p>{pet.notes || "No notes added yet."}</p>
        </div>

        {/* 🟢 Age Note */}
        {pet.ageNote && (
          <div className="card innerCard">
            <h3>🕰 Age Note</h3>
            <p>{pet.ageNote}</p>
          </div>
        )}

        {/* 🟢 Medications */}
        <div className="card innerCard">
          <h3>💊 Medications</h3>

          {meds.length === 0 ? (
            <p>No medications added yet.</p>
          ) : (
            meds.map((med) => (
              <div key={med.id} className="timelineItem">
                <strong>{med.name}</strong>
                <small>
                  {med.dose || "No dose"} • Every {med.frequencyHours} hours
                </small>
              </div>
            ))
          )}
        </div>

        {/* 🟢 Recent Timeline */}
        <div className="card innerCard">
          <h3>📜 Recent Timeline</h3>

          {logs.length === 0 ? (
            <p>No logs yet.</p>
          ) : (
            logs.slice(0, 6).map((log) => (
              <div key={log.id || log.time} className="timelineItem">
                <strong>{log.type}</strong>
                {log.note && <small>{log.note}</small>}
                <small>{new Date(log.time).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}