import { PET_STATUSES } from "../data/statuses";

// =====================================================
// 🟢 EditPetModal.jsx
//
// Edit existing pet passport details.
//
// Responsibilities:
// • Edit identity details
// • Edit age details
// • Edit care basics
// • Edit status
//
// =====================================================

export default function EditPetModal({
  editForm,
  setEditForm,
  saveEdit,
  cancelEdit,
}) {
  return (
    <div className="modalOverlay">
      <div className="modal">
        {/* 🟢 Header */}
        <h2>Edit Pet</h2>

        {/* 🟢 Identity */}
        <input
          placeholder="Name"
          value={editForm.name}
          onChange={(e) =>
            setEditForm({ ...editForm, name: e.target.value })
          }
        />

        <input
          placeholder="Species"
          value={editForm.species}
          onChange={(e) =>
            setEditForm({ ...editForm, species: e.target.value })
          }
        />

        <input
          placeholder="Morph / Breed"
          value={editForm.morph}
          onChange={(e) =>
            setEditForm({ ...editForm, morph: e.target.value })
          }
        />

        <label>Sex</label>
        <select
          value={editForm.sex}
          onChange={(e) =>
            setEditForm({ ...editForm, sex: e.target.value })
          }
        >
          <option value="">Unknown Sex</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Unsexed">Unsexed</option>
        </select>

        {/* 🟢 Age */}
        <label>DOB / Hatch Date</label>
        <input
          type="date"
          value={editForm.dob}
          onChange={(e) =>
            setEditForm({ ...editForm, dob: e.target.value })
          }
        />

        <label>Age Type</label>
        <select
          value={editForm.ageType}
          onChange={(e) =>
            setEditForm({ ...editForm, ageType: e.target.value })
          }
        >
          <option value="exact">Exact DOB / Hatch Date</option>
          <option value="estimated">Estimated Age</option>
          <option value="unknown">Unknown</option>
        </select>

        {editForm.ageType === "estimated" && (
          <>
            <label>Estimated Age</label>
            <input
              placeholder="Example: 3 years, adult, juvenile"
              value={editForm.estimatedAge}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  estimatedAge: e.target.value,
                })
              }
            />

            <label>Age Note</label>
            <textarea
              placeholder="Example: Previous owner said around 3-5 years old."
              value={editForm.ageNote}
              onChange={(e) =>
                setEditForm({ ...editForm, ageNote: e.target.value })
              }
            />
          </>
        )}

        {/* 🟢 Status / Personality */}
        <label>Temperament</label>

{editForm.temperamentOptions?.length > 0 ? (
  <select
    value={editForm.temperament}
    onChange={(e) =>
      setEditForm({ ...editForm, temperament: e.target.value })
    }
  >
    {editForm.temperamentOptions.map((temperament) => (
      <option key={temperament} value={temperament}>
        {temperament}
      </option>
    ))}
  </select>
) : (
  <input
    placeholder="Temperament"
    value={editForm.temperament}
    onChange={(e) =>
      setEditForm({ ...editForm, temperament: e.target.value })
    }
  />
)}

        <label>Status</label>
        <select
          value={editForm.status}
          onChange={(e) =>
            setEditForm({ ...editForm, status: e.target.value })
          }
        >
          {PET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status === "Healthy" && "🟢 "}
              {status === "Monitoring" && "🟡 "}
              {status === "Quarantine" && "🔵 "}
              {status === "Sick" && "🔴 "}
              {status === "Breeding" && "🧬 "}
              {status === "For Sale" && "💰 "}
              {status === "Holdback" && "⭐ "}
              {status === "Retired" && "🏡 "}
              {status === "Memorial" && "⚫ "}
              {status}
            </option>
          ))}
        </select>

        {/* 🟢 Care Basics */}
        <input
          placeholder="Diet"
          value={editForm.diet}
          onChange={(e) =>
            setEditForm({ ...editForm, diet: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Feeding frequency in days"
          value={editForm.frequency}
          onChange={(e) =>
            setEditForm({ ...editForm, frequency: e.target.value })
          }
        />

        <input
          placeholder="Substrate / Housing"
          value={editForm.substrate}
          onChange={(e) =>
            setEditForm({ ...editForm, substrate: e.target.value })
          }
        />

        <textarea
          placeholder="Notes"
          value={editForm.notes}
          onChange={(e) =>
            setEditForm({ ...editForm, notes: e.target.value })
          }
        />

        {/* 🟢 Buttons */}
        <div className="buttonRow">
          <button onClick={saveEdit}>Save</button>
          <button onClick={cancelEdit}>Cancel</button>
        </div>
      </div>
    </div>
  );
}