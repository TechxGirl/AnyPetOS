// =====================================================
// 🟢 Pet Photo Helpers
//
// Stores beta pet photos as compressed data URLs inside the
// pet record. This is perfect for beta testing and local demos.
// Production should move these to Supabase Storage.
// =====================================================

const DEFAULT_MAX_SIZE = 900;
const DEFAULT_QUALITY = 0.76;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The photo could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The photo could not be loaded."));
    image.src = src;
  });
}

function getScaledSize(width, height, maxSize) {
  if (!width || !height) {
    return { width: maxSize, height: maxSize };
  }

  const longestSide = Math.max(width, height);

  if (longestSide <= maxSize) {
    return { width, height };
  }

  const scale = maxSize / longestSide;

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export async function preparePetPhoto(file, options = {}) {
  if (!file) return null;

  if (!file.type?.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const maxSize = options.maxSize || DEFAULT_MAX_SIZE;
  const quality = options.quality || DEFAULT_QUALITY;
  const originalDataUrl = await readFileAsDataUrl(file);

  try {
    const image = await loadImage(originalDataUrl);
    const size = getScaledSize(image.naturalWidth, image.naturalHeight, maxSize);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = size.width;
    canvas.height = size.height;

    context.drawImage(image, 0, 0, size.width, size.height);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);

    return {
      dataUrl,
      alt: file.name || "Pet photo",
      fileName: file.name || "pet-photo.jpg",
      mimeType: "image/jpeg",
      width: size.width,
      height: size.height,
      uploadedAt: Date.now(),
      source: "user-upload",
    };
  } catch (error) {
    console.warn("Falling back to the original pet photo file.", error);

    return {
      dataUrl: originalDataUrl,
      alt: file.name || "Pet photo",
      fileName: file.name || "pet-photo",
      mimeType: file.type || "image/*",
      uploadedAt: Date.now(),
      source: "user-upload",
    };
  }
}

export function getPetPhotoUrl(pet) {
  if (!pet) return "";

  if (typeof pet.photo === "string") return pet.photo;

  return pet.photo?.dataUrl || pet.photo?.url || pet.photoUrl || "";
}

export function getPetInitials(pet) {
  const name = pet?.name || pet?.species || "PP";
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "PP";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}
