import { useRef, useState } from "react";
import { getPetInitials, preparePetPhoto } from "../utils/images";
import { Button, Icon } from "./ui";

// =====================================================
// 🟢 Pet Photo Uploader
//
// Uses real user-uploaded animal photos only.
// No generated animal art is used in the app UI.
// =====================================================

export default function PetPhotoUploader({
  value,
  onChange,
  petName = "Pet",
  species = "Animal",
  compact = false,
}) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const photoUrl = value?.dataUrl || value?.url || "";

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      setError("");
      setLoading(true);
      const photo = await preparePetPhoto(file);
      onChange(photo);
    } catch (photoError) {
      setError(photoError?.message || "The photo could not be uploaded.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`petPhotoUploader ${compact ? "petPhotoUploaderCompact" : ""}`}>
      <div className="petPhotoPreview" aria-label={`${petName} photo preview`}>
        {photoUrl ? (
          <img src={photoUrl} alt={value?.alt || `${petName} profile`} />
        ) : (
          <div className="petPhotoFallback">
            <span>{getPetInitials({ name: petName, species })}</span>
            <small>{species || "No photo"}</small>
          </div>
        )}
      </div>

      <div className="petPhotoUploaderBody">
        <strong>Real pet photo</strong>
        <p>
          Upload a real photo for cards, profiles, Passports, and transfers.
          If no photo is added, AnyPetOS uses a clean placeholder instead.
        </p>

        {error && <p className="warningText">{error}</p>}

        <div className="buttonRow petPhotoActions">
          <Button
            type="button"
            variant="secondary"
            leftIcon={<Icon name="upload" size={15} />}
            loading={loading}
            onClick={() => inputRef.current?.click()}
          >
            {photoUrl ? "Change photo" : "Upload photo"}
          </Button>

          {photoUrl && (
            <Button
              type="button"
              variant="outline"
              leftIcon={<Icon name="trash" size={15} />}
              onClick={() => onChange(null)}
              disabled={loading}
            >
              Remove
            </Button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="visuallyHiddenInput"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}
