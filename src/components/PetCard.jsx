export default function PetCard({
  pet,
  feedPet,
  startEdit,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
}) {
  // 🟢 Safe Defaults
  const foods = pet.foodList || [];
  const status = pet.status || "Healthy";
  const overdue = pet.nextFeed && Date.now() > pet.nextFeed;

  return (
    <div className={`card petCard ${overdue ? "overdue" : ""}`}>
      {/* 🟢 Header */}
      <h3>{pet.name || "Unnamed Pet"}</h3>

      <p className="passportId">
        🛂 {pet.passportId || "No Passport ID"}
      </p>

      {/* 🟢 Favorite Button */}
      {toggleFavorite && (
        <button
          className="favoriteButton"
          onClick={() => toggleFavorite(pet.id)}
        >
          {pet.favorite ? "⭐ Favorite" : "☆ Favorite"}
        </button>
      )}

      {/* 🟢 Status */}
      <span className={`statusBadge status-${status.toLowerCase()}`}>
        {status}
      </span>

      {/* 🟢 Basic Info */}
      <p>{pet.species || "Unknown species"}</p>

      <p>
        <strong>Sex:</strong> {pet.sex || "Unknown"}
      </p>

      <p>
        <strong>DOB / Hatch:</strong>{" "}
        {pet.dob ? new Date(pet.dob).toLocaleDateString() : "Unknown"}
      </p>

      <p>
        <strong>Temperament:</strong> {pet.temperament || "Not set"}
      </p>

      <p>
        <strong>Foods:</strong>{" "}
        {foods.length > 0 ? foods.join(", ") : pet.diet || "Not set"}
      </p>

      <p>
        <strong>Last Fed:</strong>{" "}
        {pet.lastFed ? new Date(pet.lastFed).toLocaleString() : "Never"}
      </p>

      {overdue && <p className="warningText">⚠ Feeding overdue</p>}

      {/* 🟢 Actions */}
      <div className="buttonRow">
        <button onClick={() => feedPet(pet.id)}>🍽 Feed</button>
        <button onClick={() => openShedModal(pet.id)}>🐍 Shed</button>
        <button onClick={() => openQuickMeds(pet.id)}>💊 Meds</button>
        <button onClick={() => startEdit(pet)}>✏️ Edit</button>
        <button onClick={() => openProfile(pet.id)}>Open Profile</button>
      </div>
    </div>
  );
}