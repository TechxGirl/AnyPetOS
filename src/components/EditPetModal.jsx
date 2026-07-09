import { PET_STATUSES } from "../data/statuses";
import { Button, Icon, IconButton } from "./ui";
import PetPhotoUploader from "./PetPhotoUploader";
import MorphSelector from "./MorphSelector";

export default function EditPetModal({ editForm, setEditForm, saveEdit, cancelEdit, saving = false }) {
  return (
    <div className="modalOverlay">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-pet-modal-title">
        <div className="profileHeader">
          <div><h2 id="edit-pet-modal-title">Edit pet profile</h2><p>Update identity, care, and health details.</p></div>
          <IconButton variant="ghost" icon={<Icon name="close" size={19} />} label="Close edit form" onClick={cancelEdit} disabled={saving} />
        </div>

        <PetPhotoUploader
          value={editForm.photo}
          petName={editForm.name || "Animal"}
          species={editForm.species || "Animal"}
          onChange={(photo) =>
            setEditForm({
              ...editForm,
              photo,
              includePhotoInPassport: photo ? editForm.includePhotoInPassport : true,
            })
          }
        />

        {editForm.photo && (
          <label className="checkboxLine photoPrivacyToggle">
            <input
              type="checkbox"
              checked={editForm.includePhotoInPassport !== false}
              onChange={(event) =>
                setEditForm({
                  ...editForm,
                  includePhotoInPassport: event.target.checked,
                })
              }
            />
            Include this profile photo when sharing or transferring the Passport
          </label>
        )}

        <label>Name</label>
        <input placeholder="Name" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
        <label>Species</label>
        <input placeholder="Species" value={editForm.species} onChange={(event) => setEditForm({ ...editForm, species: event.target.value })} />
        <MorphSelector
          value={editForm.morph}
          species={editForm.species}
          category={editForm.category}
          animalGroup={editForm.animalGroup}
          onChange={(morph) => setEditForm({ ...editForm, morph })}
        />
        <label>Sex</label>
        <select value={editForm.sex} onChange={(event) => setEditForm({ ...editForm, sex: event.target.value })}>
          <option value="">Unknown sex</option><option value="Female">Female</option><option value="Male">Male</option><option value="Unsexed">Unsexed</option>
        </select>
        <label>DOB / hatch date</label>
        <input type="date" value={editForm.dob} onChange={(event) => setEditForm({ ...editForm, dob: event.target.value })} />
        <label>Age type</label>
        <select value={editForm.ageType} onChange={(event) => setEditForm({ ...editForm, ageType: event.target.value })}>
          <option value="exact">Exact DOB / hatch date</option><option value="estimated">Estimated age</option><option value="unknown">Unknown</option>
        </select>
        {editForm.ageType === "estimated" && (
          <>
            <label>Estimated age</label>
            <input placeholder="Example: 3 years, adult, juvenile" value={editForm.estimatedAge} onChange={(event) => setEditForm({ ...editForm, estimatedAge: event.target.value })} />
            <label>Age note</label>
            <textarea placeholder="Context for the age estimate" value={editForm.ageNote} onChange={(event) => setEditForm({ ...editForm, ageNote: event.target.value })} />
          </>
        )}
        <label>Temperament</label>
        {editForm.temperamentOptions?.length > 0 ? (
          <select value={editForm.temperament} onChange={(event) => setEditForm({ ...editForm, temperament: event.target.value })}>
            {editForm.temperamentOptions.map((temperament) => <option key={temperament} value={temperament}>{temperament}</option>)}
          </select>
        ) : (
          <input placeholder="Temperament" value={editForm.temperament} onChange={(event) => setEditForm({ ...editForm, temperament: event.target.value })} />
        )}
        <label>Status</label>
        <select value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>
          {PET_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <label>Diet</label>
        <input placeholder="Diet" value={editForm.diet} onChange={(event) => setEditForm({ ...editForm, diet: event.target.value })} />
        <label>Feeding frequency in days</label>
        <input type="number" min="0" placeholder="Example: 7" value={editForm.frequency} onChange={(event) => setEditForm({ ...editForm, frequency: event.target.value })} />
        <label>Substrate / housing</label>
        <input placeholder="Substrate or housing details" value={editForm.substrate} onChange={(event) => setEditForm({ ...editForm, substrate: event.target.value })} />
        <label>Notes</label>
        <textarea placeholder="Notes" value={editForm.notes} onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })} />
        <div className="buttonRow">
          <Button loading={saving} leftIcon={<Icon name="check" size={16} />} onClick={saveEdit}>Save changes</Button>
          <Button variant="outline" onClick={cancelEdit} disabled={saving}>Cancel</Button>
        </div>
      </section>
    </div>
  );
}
