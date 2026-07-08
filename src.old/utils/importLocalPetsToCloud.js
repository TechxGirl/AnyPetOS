import { supabase } from "../services/supabaseClient";
import { normalizePet } from "./normalizePet";

// =====================================================
// 🟢 importLocalPetsToCloud.js
//
// Temporary one-time importer for moving localStorage pets
// into Supabase.
//
// Delete after migration is complete.
//
// =====================================================

export async function importLocalPetsToCloud(session) {
  if (!session) {
    alert("You must be logged in first.");
    return;
  }

  const rawPets = localStorage.getItem("pets");

  if (!rawPets) {
    alert("No local pets found.");
    return;
  }

  const localPets = JSON.parse(rawPets);

  if (!Array.isArray(localPets) || localPets.length === 0) {
    alert("No local pets found.");
    return;
  }

  const rows = localPets.map((pet) => {
    const normalizedPet = normalizePet(pet);

    return {
      user_id: session.user.id,
      name: normalizedPet.name,
      species: normalizedPet.species,
      morph: normalizedPet.morph || null,
      sex: normalizedPet.sex || null,
      status: normalizedPet.status || "Healthy",
      favorite: Boolean(normalizedPet.favorite),
      last_fed: normalizedPet.lastFed
        ? new Date(normalizedPet.lastFed).toISOString()
        : null,
      next_feed: normalizedPet.nextFeed
        ? new Date(normalizedPet.nextFeed).toISOString()
        : null,
      data: normalizedPet,
    };
  });

  const { error } = await supabase.from("pets").insert(rows);

  if (error) {
    console.error(error);
    alert("Import failed. Check the console.");
    return;
  }

  alert(`Imported ${rows.length} pets to the cloud!`);
}