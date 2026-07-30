import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export function useProfile(session) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!session) {
        if (active) {
          setProfile(null);
          setError(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError) {
        console.error("Unable to load profile:", profileError);
        setError(profileError);
        setProfile(null);
      } else {
        setProfile(data);
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [session]);

  return { profile, loading, error };
}
