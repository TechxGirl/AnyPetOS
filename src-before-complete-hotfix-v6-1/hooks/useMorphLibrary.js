import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  getStarterMorphOptions,
  makeMorphKey,
  makeSpeciesKey,
  mergeMorphOptions,
} from "../data/morphLibrary";

// =====================================================
// 🟢 useMorphLibrary
//
// Loads starter morphs plus community-submitted morphs.
// Community morphs are global after the Supabase SQL patch
// is installed.
// =====================================================

export function useMorphLibrary({ species = "", category = "", animalGroup = "" } = {}) {
  const speciesKey = useMemo(() => makeSpeciesKey(species), [species]);
  const [communityMorphs, setCommunityMorphs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableReady, setTableReady] = useState(true);

  const starterMorphs = useMemo(() => getStarterMorphOptions(species), [species]);

  const loadCommunityMorphs = useCallback(async () => {
    if (!speciesKey || speciesKey === "unknown-species") {
      setCommunityMorphs([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("morph_options")
      .select("morph_name")
      .eq("species_key", speciesKey)
      .eq("status", "active")
      .order("morph_name", { ascending: true });

    if (error) {
      // The SQL patch may not be installed yet. Do not break the form.
      console.warn("Morph library unavailable:", error.message || error);
      setCommunityMorphs([]);
      setTableReady(false);
    } else {
      setCommunityMorphs((data || []).map((row) => row.morph_name).filter(Boolean));
      setTableReady(true);
    }

    setLoading(false);
  }, [speciesKey]);

  useEffect(() => {
    loadCommunityMorphs();
  }, [loadCommunityMorphs]);

  const options = useMemo(
    () => mergeMorphOptions(starterMorphs, communityMorphs),
    [starterMorphs, communityMorphs]
  );

  const hasOption = useCallback(
    (value) => {
      const key = makeMorphKey(value);
      return options.some((option) => makeMorphKey(option) === key);
    },
    [options]
  );

  const addMorphOption = useCallback(
    async (morphName) => {
      const cleanMorph = String(morphName || "").trim();

      if (!cleanMorph) {
        throw new Error("Enter a morph, breed, variety, phase, or locality first.");
      }

      if (!species || !speciesKey || speciesKey === "unknown-species") {
        throw new Error("Choose a species before adding a shared morph option.");
      }

      const morphKey = makeMorphKey(cleanMorph);

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        throw new Error("You must be signed in to add a shared morph option.");
      }

      const { error } = await supabase.from("morph_options").insert({
        species_key: speciesKey,
        species_name: species,
        category: category || null,
        animal_group: animalGroup || null,
        morph_key: morphKey,
        morph_name: cleanMorph,
        source: "community",
        status: "active",
        created_by: userId,
      });

      if (error && error.code !== "23505") {
        console.error("Unable to add morph option:", error);
        throw error;
      }

      await loadCommunityMorphs();
      return cleanMorph;
    },
    [animalGroup, category, loadCommunityMorphs, species, speciesKey]
  );

  return {
    options,
    loading,
    tableReady,
    hasOption,
    addMorphOption,
    refreshMorphOptions: loadCommunityMorphs,
  };
}
