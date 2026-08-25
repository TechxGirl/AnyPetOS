import { useState } from "react";
import { getPetInitials, getPetPhotoUrl } from "../utils/images";
import { Button, Icon } from "./ui";

function formatLastFed(value) {
  if (!value) return "Never";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Logged";
  }
}

function getSexSymbol(sex) {
  const normalized = String(sex || "").toLowerCase();

  if (normalized.includes("female")) return "♀";
  if (normalized.includes("male")) return "♂";

  return "?";
}

function getFoodItems(pet) {
  if (Array.isArray(pet.foodList) && pet.foodList.length > 0) {
    return pet.foodList;
  }

  if (typeof pet.diet === "string" && pet.diet.trim()) {
    return pet.diet
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function PetCard({
  pet,
  feedPet,
  startEdit,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
}) {
  const [now] = useState(Date.now);

  const status = pet.status || "Healthy";
  const overdue = Boolean(pet.nextFeed && now > pet.nextFeed);
  const photoUrl = getPetPhotoUrl(pet);
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");
  const foods = getFoodItems(pet);
  const sexSymbol = getSexSymbol(pet.sex);

  return (
    <article className={`ppAnimalCard ${overdue ? "is-overdue" : ""}`}>
      <div className="ppAnimalCard__media">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={pet.photo?.alt || `${pet.name} profile`}
          />
        ) : (
          <div className="ppAnimalCard__fallback" aria-hidden="true">
            <span>{getPetInitials(pet)}</span>
            <small>{pet.species || "No photo yet"}</small>
          </div>
        )}

        <div className="ppAnimalCard__shade" />

        <span className={`ppAnimalCard__status status-${statusClass}`}>
          {status}
        </span>

        {toggleFavorite && (
          <button
            type="button"
            className={`ppAnimalCard__save ${
              pet.favorite ? "is-saved" : ""
            }`}
            onClick={() => toggleFavorite(pet.id)}
            aria-pressed={Boolean(pet.favorite)}
            aria-label={
              pet.favorite
                ? `Remove ${pet.name} from favorites`
                : `Save ${pet.name} to favorites`
            }
          >
            <Icon name="star" size={15} />
            <span>{pet.favorite ? "Saved" : "Save"}</span>
          </button>
        )}
      </div>

      <div className="ppAnimalCard__body">
        <div className="ppAnimalCard__identity">
          <div>
            <h3>{pet.name || "Unnamed pet"}</h3>

            <p>
              {pet.passportId
                ? `Passport ID: ${pet.passportId}`
                : "Passport ID pending"}
            </p>
          </div>

          <span
            className="ppAnimalCard__sex"
            title={`Sex: ${pet.sex || "Unknown"}`}
          >
            {sexSymbol}
          </span>
        </div>

        <div className="ppAnimalCard__facts">
          <div>
            <span>Species</span>
            <strong>{pet.species || "Unknown"}</strong>
          </div>

          <div>
            <span>Sex</span>
            <strong>{pet.sex || "Unknown"}</strong>
          </div>

          <div>
            <span>Morph / breed</span>
            <strong>{pet.morph || "Not set"}</strong>
          </div>

          <div>
            <span>Last fed</span>
            <strong>{formatLastFed(pet.lastFed)}</strong>
          </div>
        </div>

        <div className="ppAnimalCard__foodBlock">
          <span>Foods</span>

          {foods.length > 0 ? (
            <div className="ppAnimalCard__foodPills">
              {foods.slice(0, 4).map((food) => (
                <strong key={food}>{food}</strong>
              ))}

              {foods.length > 4 && (
                <strong>+{foods.length - 4} more</strong>
              )}
            </div>
          ) : (
            <p>Not set</p>
          )}
        </div>

        {overdue && (
          <div className="ppAnimalCard__alert">
            <Icon name="alert" size={15} />
            <span>Feeding is overdue</span>
          </div>
        )}

        <div
          className="ppAnimalCard__actions"
          aria-label={`${pet.name} quick actions`}
        >
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="utensils" size={15} />}
            onClick={() => feedPet(pet.id)}
          >
            Feed
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="history" size={15} />}
            onClick={() => openShedModal(pet.id)}
          >
            Shed
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="pill" size={15} />}
            onClick={() => openQuickMeds(pet.id)}
          >
            Meds
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="edit" size={15} />}
            onClick={() => startEdit(pet)}
          >
            Edit
          </Button>

          <Button
            className="ppAnimalCard__passportAction"
            variant="primary"
            size="md"
            leftIcon={<Icon name="file" size={16} />}
            onClick={() => openProfile(pet.id)}
          >
            Open Passport
          </Button>
        </div>
      </div>
    </article>
  );
}