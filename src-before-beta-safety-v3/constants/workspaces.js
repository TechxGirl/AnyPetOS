import { USER_ROLES } from "./roles";

const ROLE_ALIASES = {
  veterinarian: "vet",
  veterinary: "vet",
  petsitter: "sitter",
  pet_sitter: "sitter",
  petSitter: "sitter",
};

export const WORKSPACE_DETAILS = {
  owner: {
    id: "owner",
    label: "Owner Workspace",
    shortLabel: "Owner",
    icon: "paw",
    accent: "Emerald",
    tagline: "Daily care, reminders, and lifetime records for personal pets.",
    navigationFocus: ["Daily Briefing", "Care Planner", "Health Tracking", "Shared Passports"],
    activeNow: ["Dashboard", "Care timeline", "Feeding, shed, weight, and medication logs", "Passport sharing"],
    nextUp: ["Care planner", "Reminder notifications", "Pet sitter care sheets"],
  },
  breeder: {
    id: "breeder",
    label: "Breeder Workspace",
    shortLabel: "Breeder",
    icon: "activity",
    accent: "Amber",
    tagline: "Collection control, sales prep, and buyer-ready digital Passports.",
    navigationFocus: ["Collection", "Pairings", "Hatchlings", "Sales", "Transfers"],
    activeNow: ["Collection filters", "Favorites", "For Sale/Holdback status", "Ownership transfer"],
    nextUp: ["Pairing records", "Clutch/hatchling dashboard", "Sales pipeline"],
  },
  rescue: {
    id: "rescue",
    label: "Rescue Workspace",
    shortLabel: "Rescue",
    icon: "shield",
    accent: "Rose",
    tagline: "Intake, quarantine, rehab, medical notes, and adoption handoffs.",
    navigationFocus: ["Intake", "Quarantine", "Rehab", "Medical", "Adoption"],
    activeNow: ["Status indicators", "Medication tracking", "Medical history", "Adoption transfer"],
    nextUp: ["Intake forms", "Rehabilitation plans", "Adoption pipeline"],
  },
  vet: {
    id: "vet",
    label: "Veterinary Workspace",
    shortLabel: "Veterinary",
    icon: "activity",
    accent: "Blue",
    tagline: "Fast review of medical history, treatment logs, weights, and owner notes.",
    navigationFocus: ["Patients", "Medical Records", "Treatments", "Weight Trends"],
    activeNow: ["Medication history", "Weight history", "Care timeline", "Read-only shared Passport"],
    nextUp: ["Patient view", "Treatment plans", "Visit summaries"],
  },
  education: {
    id: "education",
    label: "Education / Zoo Workspace",
    shortLabel: "Education / Zoo",
    icon: "book",
    accent: "Violet",
    tagline: "Ambassador animals, program notes, exhibit records, and staff-friendly care.",
    navigationFocus: ["Ambassadors", "Programs", "Exhibits", "Care Notes"],
    activeNow: ["Collection organization", "Public-safe Passport sharing", "Care notes"],
    nextUp: ["Program scheduling", "Ambassador profiles", "Staff access"],
  },
  sitter: {
    id: "sitter",
    label: "Pet Sitter Workspace",
    shortLabel: "Pet Sitter",
    icon: "user",
    accent: "Teal",
    tagline: "Simple care instructions, proof-of-care logs, and emergency details.",
    navigationFocus: ["Visits", "Care Sheets", "Medications", "Reports"],
    activeNow: ["Read-only Passport links", "Care summaries", "Medication schedules"],
    nextUp: ["Visit scheduling", "Care reports", "Client management"],
  },
};

export function normalizeWorkspaceId(role) {
  if (!role) return "owner";
  const clean = String(role).trim();
  return ROLE_ALIASES[clean] || clean;
}

export function getWorkspaceConfig(role) {
  const normalizedRole = normalizeWorkspaceId(role);
  const roleFromConstants = USER_ROLES.find((item) => item.id === normalizedRole);
  return {
    ...(WORKSPACE_DETAILS[normalizedRole] || WORKSPACE_DETAILS.owner),
    ...(roleFromConstants || {}),
    id: normalizedRole,
  };
}

export function getWorkspaceList() {
  return Object.values(WORKSPACE_DETAILS);
}
