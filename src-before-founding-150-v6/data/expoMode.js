import { createId, createRandomString } from "../utils/id";
import { buildPublicPassportSnapshot } from "../utils/passportTransport";

export const EXPO_EVENT_MODES = [
  { value: "breeder", label: "Breeder Expo" },
  { value: "rescue", label: "Adoption Event" },
  { value: "education", label: "Education / Zoo Event" },
  { value: "retail", label: "Retail Show" },
  { value: "mixed", label: "Mixed Expo" },
];

export const EXPO_EVENT_STATUSES = ["Draft", "Published", "Live", "Completed", "Archived"];
export const EXPO_LISTING_STATUSES = ["Available", "Interested", "On hold", "Deposit received", "Sold", "Adopted", "Display only", "Not attending"];
export const EXPO_LEAD_STATUSES = ["New", "Contacted", "Interested", "Hold requested", "Deposit pending", "Deposit received", "Completed", "Not proceeding"];
export const EXPO_CARE_LEVELS = ["Beginner", "Intermediate", "Advanced"];
export const EXPO_VENDOR_TYPES = ["Breeder", "Rescue", "Educator / Zoo", "Retailer", "Pet service", "Other"];

export function slugifyExpo(value) {
  return String(value || "expo")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54) || "expo";
}

export function createExpoSlug(name) {
  return `${slugifyExpo(name)}-${createRandomString(6).toLowerCase()}`;
}

export function createExpoToken(prefix = "expo") {
  return `${createId(prefix)}-${createRandomString(18)}`;
}

export function createListingCode(pet) {
  const species = String(pet?.species || pet?.animalGroup || "ANM")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 3)
    .toUpperCase() || "ANM";
  return `${species}-${createRandomString(5).toUpperCase()}`;
}

export function buildExpoEventUrl(slug) {
  return `${window.location.origin}/expo/${encodeURIComponent(slug)}`;
}

export function buildExpoKioskUrl(slug) {
  return `${window.location.origin}/expo/${encodeURIComponent(slug)}/kiosk`;
}

export function buildExpoListingUrl(slug, token) {
  return `${window.location.origin}/expo/${encodeURIComponent(slug)}/animal/${encodeURIComponent(token)}`;
}

export function formatExpoMoney(value, currency = "USD", fallback = "Ask for price") {
  const number = Number(value);
  if (!Number.isFinite(number) || value === null || value === "") return fallback;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: number % 1 ? 2 : 0,
    }).format(number);
  } catch {
    return `$${number.toFixed(number % 1 ? 2 : 0)}`;
  }
}

export function formatExpoDate(value, options = {}) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(date);
}

export function buildExpoListingSnapshot(pet) {
  const base = buildPublicPassportSnapshot(pet, "buyer");
  const latestWeight = Array.isArray(pet?.weightLogs) ? pet.weightLogs[0] : null;
  return {
    ...base,
    expo: {
      lastFed: pet?.lastFed || null,
      weight: latestWeight?.weight || "",
      weightUnit: latestWeight?.unit || "g",
      foods: pet?.foodList || [],
    },
  };
}

export function normalizePublicExpoPayload(data) {
  if (!data) return null;
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data;
}

export function expoAvailabilityVariant(status) {
  const normalized = String(status || "").toLowerCase();
  if (["available", "adoption ready"].includes(normalized)) return "success";
  if (["on hold", "interested", "deposit received"].includes(normalized)) return "warning";
  if (["sold", "adopted", "not attending"].includes(normalized)) return "neutral";
  return "primary";
}
