import { Button, Icon } from "./ui";

export default function PetCard({
  pet,
  feedPet,
  startEdit,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
}) {
  const foods = pet.foodList || [];
  const status = pet.status || "Healthy";
  const overdue = pet.nextFeed && Date.now() > pet.nextFeed;

  return (
    <article className={`card petCard ${overdue ? "overdue" : ""}`}>
      <div className="profileHeader">
        <div>
          <h3>{pet.name || "Unnamed pet"}</h3>
          <p className="passportId">Passport ID: {pet.passportId || "Not assigned"}</p>
        </div>

        {toggleFavorite && (
          <Button
            variant="ghost"
            size="sm"
            className="favoriteButton"
            leftIcon={<Icon name="star" size={15} />}
            onClick={() => toggleFavorite(pet.id)}
            aria-pressed={Boolean(pet.favorite)}
          >
            {pet.favorite ? "Favorited" : "Favorite"}
          </Button>
        )}
      </div>

      <span className={`statusBadge status-${status.toLowerCase().replace(/\s+/g, "-")}`}>
        {status}
      </span>

      <p><strong>Species:</strong> {pet.species || "Unknown species"}</p>
      <p><strong>Sex:</strong> {pet.sex || "Unknown"}</p>
      <p><strong>DOB / hatch:</strong> {pet.dob ? new Date(pet.dob).toLocaleDateString() : "Unknown"}</p>
      <p><strong>Temperament:</strong> {pet.temperament || "Not set"}</p>
      <p><strong>Foods:</strong> {foods.length > 0 ? foods.join(", ") : pet.diet || "Not set"}</p>
      <p><strong>Last fed:</strong> {pet.lastFed ? new Date(pet.lastFed).toLocaleString() : "Never"}</p>

      {overdue && <p className="warningText">Feeding is overdue</p>}

      <div className="buttonRow">
        <Button variant="secondary" size="sm" leftIcon={<Icon name="utensils" size={15} />} onClick={() => feedPet(pet.id)}>
          Feed
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<Icon name="history" size={15} />} onClick={() => openShedModal(pet.id)}>
          Shed
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<Icon name="pill" size={15} />} onClick={() => openQuickMeds(pet.id)}>
          Medications
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<Icon name="edit" size={15} />} onClick={() => startEdit(pet)}>
          Edit
        </Button>
        <Button variant="outline" size="sm" leftIcon={<Icon name="file" size={15} />} onClick={() => openProfile(pet.id)}>
          Open profile
        </Button>
      </div>
    </article>
  );
}
