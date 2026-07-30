import { getPetInitials, getPetPhotoUrl } from "../utils/images";
import { Button, Card, CardHeader, Icon, IconButton } from "./ui";

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
  setPage,
}) {
  const logs = pet.logs || [];
  const meds = pet.meds || [];
  const foods = pet.foodList || [];
  const status = pet.status || "Healthy";
  const photoUrl = getPetPhotoUrl(pet);

  return (
    <div className="modalOverlay" onMouseDown={(event) => {
      if (event.target === event.currentTarget) close();
    }}>
      <section className="modal petProfileModal" role="dialog" aria-modal="true" aria-labelledby="pet-profile-title">
        <div className="petProfileHero">
          <div className="petProfilePhoto">
            {photoUrl ? (
              <img src={photoUrl} alt={pet.photo?.alt || `${pet.name} profile`} />
            ) : (
              <div className="petProfilePhotoFallback">
                <span>{getPetInitials(pet)}</span>
                <small>{pet.species || "No photo"}</small>
              </div>
            )}
          </div>

          <div className="petProfileHeroText">
            <p className="passportId">Passport ID: {pet.passportId || "Not assigned"}</p>
            <h2 id="pet-profile-title">{pet.name}</h2>
            <div className="petProfileHeroMeta">
              <span className={`statusBadge status-${status.toLowerCase().replace(/\s+/g, "-")}`}>
                {status}
              </span>
              <span>{pet.species || "Unknown species"}</span>
              {pet.morph && <span>{pet.morph}</span>}
            </div>
          </div>

          <IconButton variant="ghost" icon={<Icon name="close" size={19} />} label="Close pet profile" onClick={close} />
        </div>

        <div className="profileGrid">
          <div className="profileStat"><p>Sex</p><strong>{pet.sex || "Unknown"}</strong></div>
          <div className="profileStat"><p>DOB / hatch date</p><strong>{pet.dob ? new Date(pet.dob).toLocaleDateString() : "Unknown"}</strong></div>
          <div className="profileStat"><p>Age estimate</p><strong>{pet.ageType === "estimated" ? pet.estimatedAge || "Estimated" : pet.ageType === "exact" ? "Exact DOB provided" : "Unknown"}</strong></div>
          <div className="profileStat"><p>Morph / breed</p><strong>{pet.morph || "Not set"}</strong></div>
          <div className="profileStat"><p>Temperament</p><strong>{pet.temperament || "Not set"}</strong></div>
          <div className="profileStat"><p>Foods</p><strong>{foods.length > 0 ? foods.join(", ") : pet.diet || "Not set"}</strong></div>
          <div className="profileStat"><p>Feeding schedule</p><strong>{pet.frequency ? `Every ${pet.frequency} days` : "Not set"}</strong></div>
          <div className="profileStat"><p>Substrate / housing</p><strong>{pet.substrate || "Not set"}</strong></div>
        </div>

        <div className="buttonRow">
          <Button leftIcon={<Icon name="utensils" size={16} />} onClick={() => feedPet(pet.id)}>Log feeding</Button>
          <Button variant="secondary" leftIcon={<Icon name="weight" size={16} />} onClick={() => openWeightModal(pet.id)}>Log weight</Button>
          <Button variant="secondary" leftIcon={<Icon name="history" size={16} />} onClick={() => openShedModal(pet.id)}>Log shed</Button>
          <Button variant="secondary" leftIcon={<Icon name="pill" size={16} />} onClick={() => openQuickMeds(pet.id)}>Medications</Button>
          <Button variant="outline" leftIcon={<Icon name="share" size={16} />} onClick={() => openSharePassport(pet.id)}>Share passport</Button>
          <Button variant="outline" leftIcon={<Icon name="file" size={16} />} onClick={() => { close(); setPage?.("Files"); }}>Documents</Button>
          <Button variant="outline" leftIcon={<Icon name="users" size={16} />} onClick={() => { close(); setPage?.("Access Center"); }}>Access</Button>
          <Button variant="outline" leftIcon={<Icon name="edit" size={16} />} onClick={() => startEdit(pet)}>Edit profile</Button>
          <Button variant="danger" leftIcon={<Icon name="trash" size={16} />} onClick={() => deletePet?.(pet.id)}>Delete profile</Button>
        </div>

        <Card className="innerCard">
          <CardHeader icon={<Icon name="file" size={18} />} title="Notes" />
          <p>{pet.notes || "No notes added yet."}</p>
        </Card>

        {pet.ageNote && (
          <Card className="innerCard">
            <CardHeader icon={<Icon name="clock" size={18} />} title="Age note" />
            <p>{pet.ageNote}</p>
          </Card>
        )}

        <Card className="innerCard">
          <CardHeader icon={<Icon name="pill" size={18} />} title="Medications" />
          {meds.length === 0 ? (
            <p>No medications added yet.</p>
          ) : (
            meds.map((med) => (
              <div key={med.id} className="timelineItem">
                <strong>{med.name}</strong>
                <small>{med.dose || "No dose"} • Every {med.frequencyHours} hours</small>
              </div>
            ))
          )}
        </Card>

        <Card className="innerCard">
          <CardHeader icon={<Icon name="history" size={18} />} title="Recent timeline" />
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
        </Card>
      </section>
    </div>
  );
}
