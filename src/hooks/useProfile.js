// =====================================================
// 🟢 useProfile.js
//
// Custom hook for loading the authenticated user's
// PetPassport profile.
//
// Current Responsibilities:
// • Load profile
// • Loading state
// • Error state
//
// Future Responsibilities:
// • Update profile
// • Refresh profile
// • Delete profile
//
// =====================================================

import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export function useProfile(session) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // 🟢 Load Profile
  // =====================================================

  useEffect(() => {
    async function loadProfile() {
      if (!session) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [session]);

  // =====================================================
  // 🟢 Return
  // =====================================================

  return {
    profile,
    loading,
  };
}