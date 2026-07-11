import { useState } from "react";
import { Button, Icon, IconButton } from "./ui";
import MedicationDoseModal from "./MedicationDoseModal";
import {
  getMedicationLastGiven,
  getNextMedicationOccurrence,
  isMedicationDue,
} from "../utils/medicationSchedule";

export default function QuickMedsModal({ pet, close, giveMedication, openMedications, saving = false }) {
  const [recordTarget, setRecordTarget] = useState(null);
  if (!pet) return null;
  const meds = pet.meds || [];

  const submitDose = async (options) => {
    if (!recordTarget) return;
    await giveMedication(pet.id, recordTarget.med.id, options);
    setRecordTarget(null);
  };

  return (
    <>
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
              const nextOccurrence = getNextMedicationOccurrence(med);
              const due = isMedicationDue(med);
              return (
                <div key={med.id} className={`card innerCard ${due ? "overdue" : ""}`}>
                  <div className="profileHeader">
                    <div><h3>{med.name}</h3>{due && <p className="warningText">Dose needs attention</p>}</div>
                    <span className={`statusBadge ${due ? "status-sick" : "status-healthy"}`}>{due ? "Due" : nextOccurrence ? "On schedule" : "Complete"}</span>
                  </div>
                  <p><strong>Dose:</strong> {med.dose || "Not set"}</p>
                  <p><strong>Route:</strong> {med.route || "Not set"}</p>
                  <p><strong>Frequency:</strong> Every {med.frequencyHours} hours</p>
                  <p><strong>Last actually given:</strong> {getMedicationLastGiven(med) ? new Date(getMedicationLastGiven(med)).toLocaleString() : "Not logged"}</p>
                  <p><strong>Next unresolved dose:</strong> {nextOccurrence ? new Date(nextOccurrence.scheduledFor).toLocaleString() : "Course complete"}</p>
                  {med.notes && <p><strong>Notes:</strong> {med.notes}</p>}
                  <div className="buttonRow">
                    <Button disabled={!nextOccurrence} leftIcon={<Icon name="check" size={16} />} onClick={() => setRecordTarget({ med, occurrence: nextOccurrence })}>Record dose</Button>
                    <Button variant="outline" leftIcon={<Icon name="edit" size={16} />} onClick={openMedications}>Edit medication</Button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      <MedicationDoseModal
        open={Boolean(recordTarget)}
        pet={pet}
        medication={recordTarget?.med}
        occurrence={recordTarget?.occurrence}
        saving={saving}
        onClose={() => !saving && setRecordTarget(null)}
        onSubmit={submitDose}
      />
    </>
  );
}
