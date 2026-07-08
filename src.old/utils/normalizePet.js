// ==========================================
// PetPassport
// Normalize Pet Utility
// ==========================================

import { generateAnimalId } from "./generateAnimalId";

export function normalizePet(pet) {
  return {
    // 🟢 Core IDs
    id: pet.id || crypto.randomUUID(),
    passportId:
      pet.passportId ||
      pet.animalId ||
      generateAnimalId(pet.species || pet.category || "Pet"),

    // 🟢 Basic Identity
    name: pet.name || "",
    category: pet.category || "",
    animalGroup: pet.animalGroup || "",
    species: pet.species || "",
    careProfile: pet.careProfile || "",

    // 🟢 Passport Details
    morph: pet.morph || "",
    sex: pet.sex || "",
    dob: pet.dob || "",
    ageType: pet.ageType || "unknown",
    estimatedAge: pet.estimatedAge || "",
    ageNote: pet.ageNote || "",

    // 🟢 Status / Personality
    temperament: pet.temperament || "",
    status: pet.status || "Healthy",
    favorite: Boolean(pet.favorite),

    // 🟢 Care Basics
    diet: pet.diet || "",
    frequency: Number(pet.frequency) || 0,
    substrate: pet.substrate || "",

    // 🟢 Multiple Foods
    foodList: Array.isArray(pet.foodList)
      ? pet.foodList
      : pet.diet
      ? [pet.diet]
      : [],

    // 🟢 Dropdown Options
    foodOptions: Array.isArray(pet.foodOptions) ? pet.foodOptions : [],
    substrateOptions: Array.isArray(pet.substrateOptions)
      ? pet.substrateOptions
      : [],
    temperamentOptions: Array.isArray(pet.temperamentOptions)
      ? pet.temperamentOptions
      : [],

    // 🟢 Notes
    notes: pet.notes || "",

    // 🟢 History / Records
    logs: Array.isArray(pet.logs) ? pet.logs : [],
    weightLogs: Array.isArray(pet.weightLogs) ? pet.weightLogs : [],
    meds: Array.isArray(pet.meds) ? pet.meds : [],

    // 🟢 Feeding Dates
    lastFed: pet.lastFed || null,
    nextFeed: pet.nextFeed || null,
  };
}