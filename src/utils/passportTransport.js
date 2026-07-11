import { createId, createRandomString } from "./id";
// =====================================================
// 🟢 Passport Transport Utilities
//
// Creates safe public snapshots, share URLs, and transfer URLs.
// These utilities do not change ownership by themselves.
// They only prepare clean data for Supabase actions.
//
// =====================================================

const SHARE_PATH = "/passport/share";
const TRANSFER_PATH = "/passport/transfer";
const ACCESS_PATH = "/passport/access";
const EXPO_PATH = "/expo";

// =====================================================
// 🟢 Route Helpers
// =====================================================

export function getPassportTransportRoute() {
  const path = window.location.pathname;

  if (path.startsWith(`${SHARE_PATH}/`)) {
    return {
      type: "share",
      token: decodeURIComponent(path.replace(`${SHARE_PATH}/`, "")),
    };
  }

  if (path.startsWith(`${TRANSFER_PATH}/`)) {
    return {
      type: "transfer",
      token: decodeURIComponent(path.replace(`${TRANSFER_PATH}/`, "")),
    };
  }

  if (path.startsWith(`${ACCESS_PATH}/`)) {
    return {
      type: "access",
      token: decodeURIComponent(path.replace(`${ACCESS_PATH}/`, "")),
    };
  }

  if (path.startsWith(`${EXPO_PATH}/`)) {
    const segments = path
      .replace(`${EXPO_PATH}/`, "")
      .split("/")
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));

    const [slug, section, value] = segments;

    if (slug && section === "animal" && value) {
      return { type: "expoListing", slug, listingToken: value };
    }

    if (slug && section === "kiosk") {
      return { type: "expoKiosk", slug };
    }

    if (slug) {
      return { type: "expo", slug };
    }
  }

  return null;
}

// =====================================================
// 🟢 Token Helpers
// =====================================================

export function createTransportToken() {
  const idPart = createId("transport");
  const randomPart = createRandomString(24);

  return `${idPart}-${randomPart}`;
}

// =====================================================
// 🟢 URL Helpers
// =====================================================

export function getAppOrigin() {
  return window.location.origin;
}

export function buildShareUrl(token) {
  return `${getAppOrigin()}${SHARE_PATH}/${encodeURIComponent(token)}`;
}

export function buildTransferUrl(token) {
  return `${getAppOrigin()}${TRANSFER_PATH}/${encodeURIComponent(token)}`;
}

export function buildAccessUrl(token) {
  return `${getAppOrigin()}${ACCESS_PATH}/${encodeURIComponent(token)}`;
}

// =====================================================
// 🟢 Clipboard / Native Share Helpers
// =====================================================

export async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "absolute";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
  return true;
}

export async function nativeSharePassport({ title, text, url }) {
  if (!navigator.share) return false;

  await navigator.share({
    title,
    text,
    url,
  });

  return true;
}

// =====================================================
// 🟢 Snapshot Helpers
// =====================================================

function safeDate(value) {
  if (!value) return null;

  try {
    return new Date(value).toISOString();
  } catch {
    return null;
  }
}

function sortByNewest(items = []) {
  return [...items].sort((a, b) => Number(b.time || 0) - Number(a.time || 0));
}

export function buildPublicPassportSnapshot(pet, view = "buyer") {
  const logs = sortByNewest(pet.logs || []).slice(0, 25);
  const weightLogs = sortByNewest(pet.weightLogs || []).slice(0, 20);
  const meds = (pet.meds || []).slice(0, 20);

  return {
    view,
    generatedAt: Date.now(),

    passport: {
      passportId: pet.passportId || "",
      name: pet.name || "Unnamed animal",
      category: pet.category || "",
      animalGroup: pet.animalGroup || "",
      species: pet.species || "",
      morph: pet.morph || "",
      sex: pet.sex || "",
      dob: pet.dob || "",
      ageType: pet.ageType || "unknown",
      estimatedAge: pet.estimatedAge || "",
      temperament: pet.temperament || "",
      status: pet.status || "Healthy",
      photo: pet.includePhotoInPassport === false ? null : pet.photo || null,
    },

    care: {
      diet: pet.diet || "",
      foodList: Array.isArray(pet.foodList) ? pet.foodList : [],
      frequency: pet.frequency || 0,
      substrate: pet.substrate || "",
      lastFed: safeDate(pet.lastFed),
      nextFeed: safeDate(pet.nextFeed),
    },

    health: {
      notes: pet.notes || "",
      ageNote: pet.ageNote || "",
      medications: meds.map((med) => ({
        id: med.id,
        name: med.name || "",
        dose: med.dose || "",
        route: med.route || "",
        frequencyHours: med.frequencyHours || "",
        lastGiven: med.lastGiven || null,
        notes: med.notes || "",
      })),
      weights: weightLogs.map((entry) => ({
        id: entry.id,
        weight: entry.weight,
        unit: entry.unit || "g",
        time: entry.time || null,
        notes: entry.notes || "",
      })),
    },

    timeline: logs.map((log) => ({
      id: log.id,
      type: log.type || "Log",
      note: log.note || "",
      time: log.time || null,
    })),
  };
}

// =====================================================
// 🟢 SMS / Email Helpers
// =====================================================

export function buildSmsHref(url, petName = "this animal") {
  return `sms:?&body=${encodeURIComponent(`Here is ${petName}'s PetPassport: ${url}`)}`;
}

export function buildEmailHref(url, petName = "this animal") {
  const subject = `${petName}'s PetPassport`;
  const body = `Here is ${petName}'s PetPassport:\n\n${url}`;

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
