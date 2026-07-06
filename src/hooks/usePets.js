import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { normalizePet } from "../utils/normalizePet";

// =====================================================
// 🟢 usePets.js
//
// Custom hook for cloud animal Passports.
//
// =====================================================

export function usePets(session) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // 🟢 Format Helpers
  // =====================================================

  const timestampToMs = (value) => {
    return value ? new Date(value).getTime() : null;
  };

  const msToTimestamp = (value) => {
    return value ? new Date(value).toISOString() : null;
  };

  const rowToPet = (row) =>
    normalizePet({
      ...row.data,
      id: row.id,
      cloudId: row.id,
      name: row.name,
      species: row.species,
      morph: row.morph,
      sex: row.sex,
      status: row.status,
      favorite: row.favorite,
      lastFed: timestampToMs(row.last_fed),
      nextFeed: timestampToMs(row.next_feed),
    });

  // =====================================================
  // 🟢 Load Pets
  // =====================================================

  useEffect(() => {
    async function loadPets() {
      if (!session) {
        setPets([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setPets(data.map(rowToPet));
      setLoading(false);
    }

    loadPets();
  }, [session]);

  // =====================================================
  // 🟢 Add Pet
  // =====================================================

  const addPet = async (newPet) => {
    if (!session) return;

    const petToSave = normalizePet({
      ...newPet,
      logs: [],
      weightLogs: [],
      meds: [],
      lastFed: null,
      nextFeed: null,
    });

    const { data, error } = await supabase
      .from("pets")
      .insert({
        user_id: session.user.id,
        name: petToSave.name,
        species: petToSave.species,
        morph: petToSave.morph || null,
        sex: petToSave.sex || null,
        status: petToSave.status || "Healthy",
        favorite: Boolean(petToSave.favorite),
        last_fed: msToTimestamp(petToSave.lastFed),
        next_feed: msToTimestamp(petToSave.nextFeed),
        data: petToSave,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Could not save Passport to the cloud.");
      return;
    }

    setPets((prev) => [rowToPet(data), ...prev]);
  };

  // =====================================================
  // 🟢 Delete Pet
  // =====================================================

  const deletePetFromCloud = async (petId) => {
    const { error } = await supabase
      .from("pets")
      .delete()
      .eq("id", petId);

    if (error) {
      console.error(error);
      alert("Could not delete Passport from the cloud.");
      return;
    }

    setPets((prev) => prev.filter((pet) => pet.id !== petId));
  };

// =====================================================
// 🟢 Update Pet
// =====================================================

const updatePetInCloud = async (petId, updates) => {
  const currentPet = pets.find((pet) => pet.id === petId);

  if (!currentPet) return;

  const updatedPet = normalizePet({
    ...currentPet,
    ...updates,
  });

  const { error } = await supabase
    .from("pets")
    .update({
      name: updatedPet.name,
      species: updatedPet.species,
      morph: updatedPet.morph || null,
      sex: updatedPet.sex || null,
      status: updatedPet.status || "Healthy",
      favorite: Boolean(updatedPet.favorite),
      last_fed: updatedPet.lastFed
        ? new Date(updatedPet.lastFed).toISOString()
        : null,
      next_feed: updatedPet.nextFeed
        ? new Date(updatedPet.nextFeed).toISOString()
        : null,
      updated_at: new Date().toISOString(),
      data: updatedPet,
    })
    .eq("id", petId);

  if (error) {
    console.error(error);
    alert("Could not update Passport in the cloud.");
    return;
  }

  setPets((prev) =>
    prev.map((pet) => (pet.id === petId ? updatedPet : pet))
  );
};

// =====================================================
// 🟢 Toggle Favorite
// =====================================================

const toggleFavorite = async (petId) => {
  const currentPet = pets.find((pet) => pet.id === petId);

  if (!currentPet) return;

  await updatePetInCloud(petId, {
    favorite: !currentPet.favorite,
  });
};

  // =====================================================
  // 🟢 Return
  // =====================================================

  return {
  pets,
  setPets,
  loading,
  addPet,
  deletePetFromCloud,
  updatePetInCloud,
  toggleFavorite,
};
}