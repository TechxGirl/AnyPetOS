import { useState } from "react";
import { Button, Icon, IconButton, useToast } from "./ui";

const SHARE_VIEWS = {
  sitter: { label: "Pet sitter", description: "Daily care, feeding, medications, and emergency notes." },
  vet: { label: "Veterinarian", description: "Medical history, medications, weight, status, and timeline." },
  buyer: { label: "Buyer / adopter", description: "Species, morph, sex, DOB, weight, feeding, and temperament." },
  family: { label: "Family member", description: "General care information and reminders." },
  rescue: { label: "Rescue organization", description: "Intake notes, recovery, medications, status, and timeline." },
};

export default function SharePassportModal({ pet, close }) {
  const [view, setView] = useState("buyer");
  const { showToast } = useToast();
  if (!pet) return null;
  const latestWeight = pet.weightLogs?.[0];
  const foods = pet.foodList || [];
  const selectedView = SHARE_VIEWS[view];
  const showIdentityDetails = ["buyer", "vet", "rescue"].includes(view);
  const showCareDetails = ["sitter", "family", "buyer"].includes(view);
  const showMedicalDetails = ["vet", "buyer", "rescue"].includes(view);

  return (
    <div className="modalOverlay" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="modal petProfileModal" role="dialog" aria-modal="true" aria-labelledby="share-passport-title">
        <div className="profileHeader">
          <div><h2 id="share-passport-title">Share passport</h2><p>{pet.name}</p></div>
          <IconButton variant="ghost" icon={<Icon name="close" size={19} />} label="Close share preview" onClick={close} />
        </div>
        <div className="card innerCard">
          <h3>Choose share view</h3>
          <select value={view} onChange={(event) => setView(event.target.value)}>
            {Object.entries(SHARE_VIEWS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
          <p>{selectedView.description}</p>
        </div>
        <div className="card innerCard passportPreview">
          <h3>Passport preview</h3>
          <p><strong>Passport ID:</strong> {pet.passportId || "Not assigned"}</p>
          <p><strong>Name:</strong> {pet.name}</p>
          <p><strong>Status:</strong> {pet.status || "Healthy"}</p>
          <p><strong>Species:</strong> {pet.species || "Unknown"}</p>
          {showIdentityDetails && <>
            <p><strong>Morph / breed:</strong> {pet.morph || "Not set"}</p>
            <p><strong>Sex:</strong> {pet.sex || "Unknown"}</p>
            <p><strong>DOB / hatch:</strong> {pet.dob ? new Date(pet.dob).toLocaleDateString() : "Unknown"}</p>
            <p><strong>Age estimate:</strong> {pet.ageType === "estimated" ? pet.estimatedAge || "Estimated" : pet.ageType === "exact" ? "Exact DOB provided" : "Unknown"}</p>
            <p><strong>Temperament:</strong> {pet.temperament || "Not set"}</p>
          </>}
          {showCareDetails && <>
            <p><strong>Foods:</strong> {foods.length > 0 ? foods.join(", ") : pet.diet || "Not set"}</p>
            <p><strong>Feeding schedule:</strong> {pet.frequency ? `Every ${pet.frequency} days` : "Not set"}</p>
          </>}
          {showMedicalDetails && <>
            <p><strong>Latest weight:</strong> {latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : "No weight logged"}</p>
            <p><strong>Medications:</strong> {pet.meds?.length ? `${pet.meds.length} active or recorded` : "None"}</p>
            <p><strong>Timeline entries:</strong> {pet.logs?.length || 0}</p>
          </>}
          {view === "sitter" && <>
            <p><strong>Care notes:</strong> {pet.notes || "No notes added."}</p>
            <p><strong>Emergency status:</strong> {pet.status || "Healthy"}</p>
          </>}
          <div className="buttonRow">
            <Button leftIcon={<Icon name="share" size={16} />} onClick={() => showToast({ title: "Sharing is coming next", message: "Secure share links are planned for the next development phase.", variant: "info" })}>Generate share link</Button>
            <Button variant="outline" leftIcon={<Icon name="file" size={16} />} onClick={() => showToast({ title: "PDF export is coming next", message: "Printable passport exports are planned for the next development phase.", variant: "info" })}>Export PDF</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
