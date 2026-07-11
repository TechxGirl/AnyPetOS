// ==========================================
// AnyPetOS
// Normalize Pet Utility
// ==========================================

import { generateAnimalId } from "./generateAnimalId";
import { createId } from "./id";

// =====================================================
// 🟢 Default Passport Share Settings
// =====================================================

const defaultShareSettings = {
  enabled: false,
  token: "",
  view: "buyer",
  createdAt: null,
  revokedAt: null,
};

// =====================================================
// 🟢 Default Passport Transfer Settings
// =====================================================

const defaultTransferSettings = {
  enabled: false,
  token: "",
  status: "",
  createdAt: null,
  expiresAt: null,
  cancelledAt: null,
  acceptedAt: null,
  documentIds: [],
  documents: [],
  signatureRequired: false,
  signatureRequiredDocumentIds: [],
  signatureStatus: "",
};

// =====================================================
// 🟢 Normalize Share Settings
// =====================================================

function normalizeShareSettings(share) {
  if (!share || typeof share !== "object") {
    return defaultShareSettings;
  }

  return {
    enabled: Boolean(share.enabled),
    token: share.token || "",
    view: share.view || "buyer",
    createdAt: share.createdAt || null,
    revokedAt: share.revokedAt || null,
  };
}

// =====================================================
// 🟢 Normalize Transfer Settings
// =====================================================

function normalizeTransferSettings(transfer) {
  if (!transfer || typeof transfer !== "object") {
    return defaultTransferSettings;
  }

  return {
    enabled: Boolean(transfer.enabled),
    token: transfer.token || "",
    status: transfer.status || "",
    createdAt: transfer.createdAt || null,
    expiresAt: transfer.expiresAt || null,
    cancelledAt: transfer.cancelledAt || null,
    acceptedAt: transfer.acceptedAt || null,
    documentIds: Array.isArray(transfer.documentIds) ? transfer.documentIds : [],
    documents: Array.isArray(transfer.documents) ? transfer.documents : [],
    signatureRequired: Boolean(transfer.signatureRequired),
    signatureRequiredDocumentIds: Array.isArray(transfer.signatureRequiredDocumentIds)
      ? transfer.signatureRequiredDocumentIds
      : [],
    signatureStatus: transfer.signatureStatus || "",
  };
}


// =====================================================
// 🟢 Normalize Pet Photo
// =====================================================

function normalizePetPhoto(photo) {
  if (!photo) return null;

  if (typeof photo === "string") {
    return {
      dataUrl: photo,
      alt: "Pet photo",
      source: "legacy",
      uploadedAt: null,
    };
  }

  if (typeof photo !== "object") return null;

  const dataUrl = photo.dataUrl || photo.url || photo.src || "";

  if (!dataUrl) return null;

  return {
    dataUrl,
    alt: photo.alt || photo.fileName || "Pet photo",
    fileName: photo.fileName || "",
    mimeType: photo.mimeType || "image/jpeg",
    width: photo.width || null,
    height: photo.height || null,
    uploadedAt: photo.uploadedAt || null,
    source: photo.source || "user-upload",
  };
}

// =====================================================
// 🟢 Normalize Pet
// =====================================================

export function normalizePet(pet = {}) {
  return {
    // =====================================================
    // 🟢 Core IDs
    // =====================================================

    id: pet.id || createId("pet"),
    cloudId: pet.cloudId || null,

    passportId:
      pet.passportId ||
      pet.animalId ||
      generateAnimalId(pet.species || pet.category || "Pet"),

    // =====================================================
    // 🟢 Basic Identity
    // =====================================================

    name: pet.name || "",
    category: pet.category || "",
    animalGroup: pet.animalGroup || "",
    species: pet.species || "",
    careProfile: pet.careProfile || "",

    // =====================================================
    // 🟢 Passport Details
    // =====================================================

    morph: pet.morph || "",
    sex: pet.sex || "",
    dob: pet.dob || "",
    ageType: pet.ageType || "unknown",
    estimatedAge: pet.estimatedAge || "",
    ageNote: pet.ageNote || "",

    // =====================================================
    // 🟢 Status / Personality
    // =====================================================

    temperament: pet.temperament || "",
    status: pet.status || "Healthy",
    favorite: Boolean(pet.favorite),

    // =====================================================
    // 🟢 Real Pet Photo
    // =====================================================

    photo: normalizePetPhoto(pet.photo || pet.profilePhoto || pet.photoUrl),
    includePhotoInPassport: pet.includePhotoInPassport !== false,

    // =====================================================
    // 🟢 Care Basics
    // =====================================================

    diet: pet.diet || "",
    frequency: Number(pet.frequency) || 0,
    substrate: pet.substrate || "",

    // =====================================================
    // 🟢 Multiple Foods
    // =====================================================

    foodList: Array.isArray(pet.foodList)
      ? pet.foodList
      : pet.diet
      ? [pet.diet]
      : [],

    // =====================================================
    // 🟢 Dropdown Options
    // =====================================================

    foodOptions: Array.isArray(pet.foodOptions) ? pet.foodOptions : [],
    customFoodOptions: Array.isArray(pet.customFoodOptions)
      ? pet.customFoodOptions
      : [],

    substrateOptions: Array.isArray(pet.substrateOptions)
      ? pet.substrateOptions
      : [],

    temperamentOptions: Array.isArray(pet.temperamentOptions)
      ? pet.temperamentOptions
      : [],

    // =====================================================
    // 🟢 Notes
    // =====================================================

    notes: pet.notes || "",

    // =====================================================
    // 🟢 History / Records
    // =====================================================

    logs: Array.isArray(pet.logs) ? pet.logs : [],
    feedingLogs: Array.isArray(pet.feedingLogs) ? pet.feedingLogs : [],
    weightLogs: Array.isArray(pet.weightLogs) ? pet.weightLogs : [],
    meds: Array.isArray(pet.meds) ? pet.meds : [],

    // =====================================================
    // 🟢 Feeding Dates
    // =====================================================

    lastFed: pet.lastFed || null,
    nextFeed: pet.nextFeed || null,

    // =====================================================
    // 🟢 Passport Transport / Sharing
    // =====================================================

    share: normalizeShareSettings(pet.share),
    transfer: normalizeTransferSettings(pet.transfer),
  };
}
