import { useState } from "react";

// =====================================================
// 🟢 MedicationPanel.jsx
//
// Cloud-synced medication management.
// Handles adding, editing, deleting, and logging doses.
//
// =====================================================

export default function MedicationPanel({
  pets,
  addMedication,
  giveMedication,
  updatePetInCloud,
}) {
  // =====================================================
  // 🟢 Empty Form
  // =====================================================

  const emptyForm = {
    petId: "",
    name: "",
    dose: "",
    route: "Oral",
    frequencyHours: 72,
    durationDays: 10,
    firstDoseDate: "",
    firstDoseTime: "",
    notes: "",
    continueIndefinitely: false,
  };

  // =====================================================
  // 🟢 State
  // =====================================================

  const [form, setForm] = useState(emptyForm);
  const [editingMed, setEditingMed] = useState(null);

  // =====================================================
  // 🟢 Helpers
  // =====================================================

  const findPet = (petId) =>
    pets.find(
      (pet) =>
        String(pet.id) === String(petId) ||
        String(pet.cloudId) === String(petId)
    );

  const buildFirstDoseTimestamp = () => {
    if (!form.firstDoseDate) return null;

    const time = form.firstDoseTime || "00:00";
    return new Date(`${form.firstDoseDate}T${time}`).getTime();
  };

  const getNextDose = (med) => {
    if (!med.lastGiven) return null;

    return med.lastGiven + Number(med.frequencyHours) * 60 * 60 * 1000;
  };

  const isDue = (med) => {
    const nextDose = getNextDose(med);

    if (!nextDose) return true;

    return Date.now() >= nextDose;
  };

  const getProgress = (med) => {
    if (med.continueIndefinitely || !med.startDate || !med.durationDays) {
      return null;
    }

    const total = Number(med.durationDays) * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - med.startDate;

    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  // =====================================================
  // 🟢 Add Medication
  // =====================================================

  const handleAdd = async () => {
    if (!form.petId || !form.name.trim()) {
      alert("Please choose an animal and enter a medication name.");
      return;
    }

    const pet = findPet(form.petId);

    if (!pet) {
      alert("Could not find that animal.");
      return;
    }

    const firstDoseTimestamp = buildFirstDoseTimestamp();

    await addMedication(pet.id, {
      ...form,
      firstDose: firstDoseTimestamp,
      lastGiven: firstDoseTimestamp,
    });

    setForm(emptyForm);
  };

  // =====================================================
  // 🟢 Edit Medication
  // =====================================================

  const startEditMed = (petId, med) => {
    const pet = findPet(petId);

    if (!pet) return;

    const firstDoseDate = med.firstDose
      ? new Date(med.firstDose).toISOString().slice(0, 10)
      : "";

    const firstDoseTime = med.firstDose
      ? new Date(med.firstDose).toTimeString().slice(0, 5)
      : "";

    setEditingMed({
      petId: pet.id,
      medId: med.id,
    });

    setForm({
      petId: pet.id,
      name: med.name || "",
      dose: med.dose || "",
      route: med.route || "Oral",
      frequencyHours: med.frequencyHours || 72,
      durationDays: med.durationDays || 10,
      firstDoseDate,
      firstDoseTime,
      notes: med.notes || "",
      continueIndefinitely: Boolean(med.continueIndefinitely),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEditMed = async () => {
    if (!editingMed) return;

    const pet = findPet(editingMed.petId);

    if (!pet) return;

    const firstDoseTimestamp = buildFirstDoseTimestamp();

    const updatedMeds = (pet.meds || []).map((med) =>
      med.id === editingMed.medId
        ? {
            ...med,
            name: form.name,
            dose: form.dose,
            route: form.route,
            frequencyHours: Number(form.frequencyHours) || 72,
            durationDays: Number(form.durationDays) || 10,
            continueIndefinitely: Boolean(form.continueIndefinitely),
            firstDose: firstDoseTimestamp,
            startDate: firstDoseTimestamp || med.startDate || Date.now(),
            lastGiven: firstDoseTimestamp || med.lastGiven || null,
            notes: form.notes || "",
          }
        : med
    );

    await updatePetInCloud(pet.id, {
      meds: updatedMeds,
      logs: [
        {
          id: crypto.randomUUID(),
          type: "Medication Updated",
          note: form.name,
          time: Date.now(),
        },
        ...(pet.logs || []),
      ],
    });

    setEditingMed(null);
    setForm(emptyForm);
  };

  // =====================================================
  // 🟢 Delete Medication
  // =====================================================

  const deleteMedication = async (petId, medId) => {
    const confirmed = window.confirm(
      "Delete this medication? This cannot be undone."
    );

    if (!confirmed) return;

    const pet = findPet(petId);

    if (!pet) return;

    const medication = (pet.meds || []).find((med) => med.id === medId);

    await updatePetInCloud(pet.id, {
      meds: (pet.meds || []).filter((med) => med.id !== medId),
      logs: [
        {
          id: crypto.randomUUID(),
          type: "Medication Deleted",
          note: medication?.name || "Medication removed",
          time: Date.now(),
        },
        ...(pet.logs || []),
      ],
    });
  };

  // =====================================================
  // 🟢 Cancel Edit
  // =====================================================

  const cancelEdit = () => {
    setEditingMed(null);
    setForm(emptyForm);
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="feed">
      <h2>💊 Medications</h2>

      <div className="card">
        <h3>{editingMed ? "Edit Medication Course" : "Add Medication Course"}</h3>

        <label>Animal</label>
        <select
          value={form.petId}
          disabled={Boolean(editingMed)}
          onChange={(e) => setForm({ ...form, petId: e.target.value })}
        >
          <option value="">Select animal</option>

          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name}
            </option>
          ))}
        </select>

        <label>Medication Name</label>
        <input
          placeholder="Example: Baytril, Meloxicam, Panacur"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label>Dose</label>
        <input
          placeholder="Example: 0.18 mL"
          value={form.dose}
          onChange={(e) => setForm({ ...form, dose: e.target.value })}
        />

        <label>Route</label>
        <select
          value={form.route}
          onChange={(e) => setForm({ ...form, route: e.target.value })}
        >
          <option>Oral</option>
          <option>Injection</option>
          <option>Topical</option>
          <option>Bath / Soak</option>
          <option>Eye Drops</option>
          <option>Other</option>
        </select>

        <label>How Often?</label>
        <select
          value={form.frequencyHours}
          onChange={(e) =>
            setForm({ ...form, frequencyHours: e.target.value })
          }
        >
          <option value={12}>Every 12 hours</option>
          <option value={24}>Daily</option>
          <option value={48}>Every 48 hours</option>
          <option value={72}>Every 72 hours</option>
          <option value={168}>Weekly</option>
        </select>

        <label>First Dose Date</label>
        <input
          type="date"
          value={form.firstDoseDate}
          onChange={(e) =>
            setForm({ ...form, firstDoseDate: e.target.value })
          }
        />

        <label>First Dose Time</label>
        <input
          type="time"
          value={form.firstDoseTime}
          onChange={(e) =>
            setForm({ ...form, firstDoseTime: e.target.value })
          }
        />

        <label>Duration in Days</label>
        <input
          type="number"
          disabled={form.continueIndefinitely}
          value={form.durationDays}
          onChange={(e) =>
            setForm({ ...form, durationDays: e.target.value })
          }
        />

        <label className="checkboxLabel">
          <input
            type="checkbox"
            checked={form.continueIndefinitely}
            onChange={(e) =>
              setForm({
                ...form,
                continueIndefinitely: e.target.checked,
              })
            }
          />
          Continue indefinitely
        </label>

        <label>Notes</label>
        <textarea
          placeholder="Vet instructions, side effects to watch for, storage notes, etc."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        {editingMed ? (
          <div className="buttonRow">
            <button onClick={saveEditMed}>Save Changes</button>
            <button onClick={cancelEdit}>Cancel</button>
          </div>
        ) : (
          <button onClick={handleAdd}>Add Medication</button>
        )}
      </div>

      {pets.map((pet) =>
        (pet.meds || []).map((med) => {
          const nextDose = getNextDose(med);
          const progress = getProgress(med);

          return (
            <div key={med.id} className={`card ${isDue(med) ? "overdue" : ""}`}>
              <h3>{pet.name}</h3>

              <p>
                <strong>{med.name}</strong>
              </p>

              <p>Dose: {med.dose || "Not set"}</p>
              <p>Route: {med.route || "Not set"}</p>
              <p>Every {med.frequencyHours} hours</p>

              {med.firstDose && (
                <p>Started: {new Date(med.firstDose).toLocaleString()}</p>
              )}

              <p>
                Last Given:{" "}
                {med.lastGiven
                  ? new Date(med.lastGiven).toLocaleString()
                  : "Not logged"}
              </p>

              <p>
                Next Dose:{" "}
                {nextDose ? new Date(nextDose).toLocaleString() : "Due now"}
              </p>

              <p>Status: {isDue(med) ? "Due" : "Not due yet"}</p>

              {progress !== null && (
                <>
                  <p>Course Progress: {progress}%</p>

                  <div className="progressBar">
                    <div
                      className="progressFill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}

              {med.continueIndefinitely && <p>Course: Ongoing</p>}

              {med.notes && (
                <p>
                  <strong>Notes:</strong> {med.notes}
                </p>
              )}

              <div className="buttonRow">
                <button onClick={() => giveMedication(pet.id, med.id)}>
                  Mark Given
                </button>

                <button onClick={() => startEditMed(pet.id, med)}>
                  ✏️ Edit
                </button>

                <button
                  className="dangerButton"
                  onClick={() => deleteMedication(pet.id, med.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}