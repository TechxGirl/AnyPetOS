export const ENCLOSURE_TYPES = [
  "Terrarium",
  "Vivarium",
  "Aquarium",
  "Rack tub",
  "Quarantine tub",
  "Bioactive enclosure",
  "Aviary",
  "Mammal habitat",
  "Outdoor pen",
  "Other",
];

export const EQUIPMENT_TYPES = [
  "Thermostat",
  "Heat lamp",
  "Heat mat",
  "Deep heat projector",
  "Ceramic heat emitter",
  "UVB bulb",
  "Mist system",
  "Filter",
  "Timer",
  "Thermometer",
  "Hygrometer",
  "Water pump",
  "Lighting",
  "Other",
];

export const REMINDER_TYPES = [
  "Feeding",
  "Medication",
  "Weight check",
  "Shed / molt check",
  "Cleaning",
  "UVB replacement",
  "Filter maintenance",
  "Vet visit",
  "Quarantine check",
  "Custom",
];

export const FILE_TYPES = [
  "Sales agreement",
  "Adoption agreement",
  "Transfer agreement",
  "Purchase receipt",
  "Health certificate",
  "Vet record",
  "Test result",
  "Care sheet",
  "Permit / license",
  "Microchip record",
  "Profile photo",
  "Gallery photo",
  "Shed / molt photo",
  "Enclosure photo",
  "Receipt / invoice",
  "Other",
];

export const ACCESS_LEVELS = [
  {
    id: "view_only",
    label: "View only",
    description: "Read-only Passport access for someone reviewing the record.",
  },
  {
    id: "care_logging",
    label: "Care logging",
    description: "For sitters, fosters, and helpers who need to log basic care.",
  },
  {
    id: "medical_view",
    label: "Medical view",
    description: "Share medications, weights, health notes, and history for review.",
  },
  {
    id: "medical_editing",
    label: "Medical editing",
    description: "Future clinic/team access for adding treatments and records.",
  },
  {
    id: "sitter_access",
    label: "Sitter access",
    description: "Temporary care instructions and proof-of-care access.",
  },
  {
    id: "foster_access",
    label: "Foster access",
    description: "Temporary rescue foster access for care notes and updates.",
  },
  {
    id: "vet_access",
    label: "Vet access",
    description: "Share a Passport with a veterinary professional.",
  },
];

export const ACCESS_EXPIRY_OPTIONS = [
  { label: "24 hours", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "No expiration", days: 0 },
];

export function getAccessLevelLabel(value) {
  return ACCESS_LEVELS.find((level) => level.id === value)?.label || value || "View only";
}

export function getDueStatus(dueAt, status) {
  if (status === "completed") return "completed";
  if (status === "skipped") return "skipped";
  if (!dueAt) return status || "upcoming";

  const due = new Date(dueAt).getTime();
  const now = Date.now();

  if (Number.isNaN(due)) return status || "upcoming";

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  if (due < startOfToday.getTime()) return "overdue";
  if (due < endOfToday.getTime()) return "due_today";
  if (due <= now + 7 * 24 * 60 * 60 * 1000) return "upcoming";

  return "scheduled";
}

export function formatInfrastructureDate(value, fallback = "Not set") {
  if (!value) return fallback;

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return fallback;
  }
}
