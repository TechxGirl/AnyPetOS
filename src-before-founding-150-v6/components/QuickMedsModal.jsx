import { Button, Icon, IconButton } from "./ui";

export default function QuickMedsModal({ pet, close, giveMedication, openMedications, saving = false }) {
  if (!pet) return null;
  const meds = pet.meds || [];
  const getNextDose = (med) => med.lastGiven ? med.lastGiven + Number(med.frequencyHours) * 60 * 60 * 1000 : null;
  const isDue = (med) => {
    const nextDose = getNextDose(med);
    return !nextDose || Date.now() >= nextDose;
  };

  return (
    <div className="modalOverlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) close(); }}>
      <section className="modal petProfileModal" role="dialog" aria-modal="true" aria-labelledby="medication-modal-title">
        <div className="profileHeader">
          <div><h2 id="medication-modal-title">Medication schedule</h2><p>{pet.name} • {pet.species || "Unknown species"}</p></div>
          <IconButton variant="ghost" icon={<Icon name="close" size={19} />} label="Close medication schedule" onClick={close} disabled={saving} />
        </div>

        {meds.length === 0 ? (
          <div className="card innerCard">
            <h3>No medications yet</h3>
            <p>Add a medication course from the Medications page.</p>
            <Button leftIcon={<Icon name="plus" size={16} />} onClick={openMedications}>Go to medications</Button>
          </div>
        ) : (
          meds.map((med) => {
            const nextDose = getNextDose(med);
            const due = isDue(med);
            return (
              <div key={med.id} className={`card innerCard ${due ? "overdue" : ""}`}>
                <div className="profileHeader">
                  <div><h3>{med.name}</h3>{due && <p className="warningText">Dose due now</p>}</div>
                  <span className={`statusBadge ${due ? "status-sick" : "status-healthy"}`}>{due ? "Due" : "On schedule"}</span>
                </div>
                <p><strong>Dose:</strong> {med.dose || "Not set"}</p>
                <p><strong>Route:</strong> {med.route || "Not set"}</p>
                <p><strong>Frequency:</strong> Every {med.frequencyHours} hours</p>
                <p><strong>Last given:</strong> {med.lastGiven ? new Date(med.lastGiven).toLocaleString() : "Not logged"}</p>
                <p><strong>Next dose:</strong> {nextDose ? new Date(nextDose).toLocaleString() : "Due now"}</p>
                {med.notes && <p><strong>Notes:</strong> {med.notes}</p>}
                <div className="buttonRow">
                  <Button loading={saving} leftIcon={<Icon name="check" size={16} />} onClick={() => giveMedication(pet.id, med.id)}>Mark given</Button>
                  <Button variant="outline" leftIcon={<Icon name="edit" size={16} />} onClick={openMedications}>Edit medication</Button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
