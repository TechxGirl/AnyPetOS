export default function QuickMedsModal({
  pet,
  close,
  giveMedication,
  openMedications,
}) {
  if (!pet) return null;

  // 🟢 Safe Defaults
  const meds = pet.meds || [];

  // 🟢 Medication Helpers
  const getNextDose = (med) => {
    if (!med.lastGiven) return null;

    return (
      med.lastGiven +
      Number(med.frequencyHours) * 60 * 60 * 1000
    );
  };

  const isDue = (med) => {
    const nextDose = getNextDose(med);

    if (!nextDose) return true;

    return Date.now() >= nextDose;
  };

  return (
    <div className="modalOverlay" onClick={close}>
      <div
        className="modal petProfileModal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🟢 Header */}
        <div className="profileHeader">
          <div>
            <h2>💊 {pet.name}</h2>
            <p>{pet.species || "Unknown Species"}</p>
          </div>

          <button onClick={close}>✕</button>
        </div>

        {/* 🟢 No Medications */}
        {meds.length === 0 ? (
          <div className="card innerCard">
            <h3>No medications yet</h3>

            <p>
              Add a medication course from the
              Medications page.
            </p>

            <button
              onClick={() => {
                close();
                openMedications();
              }}
            >
              Go to Medications
            </button>
          </div>
        ) : (
          meds.map((med) => {
            const nextDose = getNextDose(med);
            const due = isDue(med);

            return (
              <div
                key={med.id}
                className={`card innerCard ${
                  due ? "overdue" : ""
                }`}
              >
                {/* 🟢 Medication Name */}
                <h3>{med.name}</h3>

                {due && (
                  <p className="warningText">
                    🔴 Due Now
                  </p>
                )}

                {/* 🟢 Medication Info */}

                <p>
                  <strong>Dose:</strong>{" "}
                  {med.dose || "Not set"}
                </p>

                <p>
                  <strong>Route:</strong>{" "}
                  {med.route || "Not set"}
                </p>

                <p>
                  <strong>Frequency:</strong>{" "}
                  Every {med.frequencyHours} hours
                </p>

                <p>
                  <strong>Last Given:</strong>{" "}
                  {med.lastGiven
                    ? new Date(
                        med.lastGiven
                      ).toLocaleString()
                    : "Not logged"}
                </p>

                <p>
                  <strong>Next Dose:</strong>{" "}
                  {nextDose
                    ? new Date(
                        nextDose
                      ).toLocaleString()
                    : "Due now"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {due
                    ? "Due / Overdue"
                    : "Not due yet"}
                </p>

                {med.notes && (
                  <p>
                    <strong>Notes:</strong>{" "}
                    {med.notes}
                  </p>
                )}

                {/* 🟢 Actions */}

                <div className="buttonRow">
                  <button
                    onClick={() =>
                      giveMedication(
                        pet.id,
                        med.id
                      )
                    }
                  >
                    ✓ Mark Given
                  </button>

                  <button
                    onClick={() => {
                      close();
                      openMedications();
                    }}
                  >
                    ✏️ Edit Medication
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}