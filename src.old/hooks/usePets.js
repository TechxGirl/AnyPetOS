import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { normalizePet } from "../utils/normalizePet";
import { CARE_PROFILES } from "../data/careProfiles";

function timestampToMs(value) {
  return value ? new Date(value).getTime() : null;
}

function msToTimestamp(value) {
  return value ? new Date(value).toISOString() : null;
}

function getCareKey(speciesName = "") {
  return speciesName
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_")
    .replaceAll("'", "");
}

function rowToPet(row) {
  const basePet = normalizePet({
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

  const careKey = basePet.careProfile || getCareKey(basePet.species);
  const careProfile = CARE_PROFILES[careKey] || null;

  return normalizePet({
    ...basePet,
    careProfile: careKey,
    foodOptions:
      basePet.foodOptions?.length > 0
        ? basePet.foodOptions
        : careProfile?.feeding?.foodOptions || [],
    substrateOptions:
      basePet.substrateOptions?.length > 0
        ? basePet.substrateOptions
        : careProfile?.substrateOptions || [],
    temperamentOptions:
      basePet.temperamentOptions?.length > 0
        ? basePet.temperamentOptions
        : careProfile?.temperamentOptions || [],
  });
}

export function usePets(session) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadPets() {
      if (!session) {
        if (active) {
          setPets([]);
          setError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: loadError } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (loadError) {
        console.error("Unable to load pets:", loadError);
        setError(loadError);
        setPets([]);
      } else {
        setPets((data || []).map(rowToPet));
      }

      setLoading(false);
    }

    loadPets();

    return () => {
      active = false;
    };
  }, [session]);

  const addPet = useCallback(
    async (newPet) => {
      if (!session) throw new Error("You must be signed in to add a pet.");

      const petToSave = normalizePet({
        ...newPet,
        logs: [],
        weightLogs: [],
        meds: [],
        lastFed: null,
        nextFeed: null,
      });

      const { data, error: insertError } = await supabase
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

      if (insertError) {
        console.error("Unable to add pet:", insertError);
        throw insertError;
      }

      const savedPet = rowToPet(data);
      setPets((previous) => [savedPet, ...previous]);
      return savedPet;
    },
    [session]
  );

  const deletePetFromCloud = useCallback(async (petId) => {
    const { error: deleteError } = await supabase
      .from("pets")
      .delete()
      .eq("id", petId);

    if (deleteError) {
      console.error("Unable to delete pet:", deleteError);
      throw deleteError;
    }

    setPets((previous) =>
      previous.filter((pet) => String(pet.id) !== String(petId))
    );

    return true;
  }, []);

  const updatePetInCloud = useCallback(
    async (petId, updates) => {
      const currentPet = pets.find(
        (pet) => String(pet.id) === String(petId)
      );

      if (!currentPet) throw new Error("Could not find the selected pet.");

      const updatedPet = normalizePet({
        ...currentPet,
        ...updates,
      });

      const { data, error: updateError } = await supabase
        .from("pets")
        .update({
          name: updatedPet.name,
          species: updatedPet.species,
          morph: updatedPet.morph || null,
          sex: updatedPet.sex || null,
          status: updatedPet.status || "Healthy",
          favorite: Boolean(updatedPet.favorite),
          last_fed: msToTimestamp(updatedPet.lastFed),
          next_feed: msToTimestamp(updatedPet.nextFeed),
          updated_at: new Date().toISOString(),
          data: updatedPet,
        })
        .eq("id", petId)
        .select()
        .single();

      if (updateError) {
        console.error("Unable to update pet:", updateError);
        throw updateError;
      }

      const savedPet = rowToPet(data);
      setPets((previous) =>
        previous.map((pet) =>
          String(pet.id) === String(petId) ? savedPet : pet
        )
      );

      return savedPet;
    },
    [pets]
  );

  const toggleFavorite = useCallback(
    async (petId) => {
      const currentPet = pets.find(
        (pet) => String(pet.id) === String(petId)
      );
      if (!currentPet) throw new Error("Could not find the selected pet.");
      return updatePetInCloud(petId, { favorite: !currentPet.favorite });
    },
    [pets, updatePetInCloud]
  );

  return {
    pets,
    setPets,
    loading,
    error,
    addPet,
    deletePetFromCloud,
    updatePetInCloud,
    toggleFavorite,
  };
}
