import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../services/supabaseClient";
import { normalizeWorkspaceId } from "../data/workspaces";
import { FoundingBadgeContext } from "./FoundingBadgeContextCore";

// =====================================================
// 🟢 FoundingBadgeContext.jsx
//
// Global AnyPetOS Founding 150 badge state provider.
//
// Context creation and the useFoundingBadges hook live in
// FoundingBadgeContextCore.js so this file only exports
// React components.
// =====================================================

// =====================================================
// 🟢 Badge Data Helpers
// =====================================================

function normalizeRows(rows) {
  return (rows || []).map((row) => ({
    role: normalizeWorkspaceId(row.role),
    capacity: Number(row.capacity) || 150,
    claimedCount: Number(row.claimed_count) || 0,
    remainingCount: Number(row.remaining_count) || 0,
    badgeNumber:
      row.my_badge_number === null ||
      row.my_badge_number === undefined
        ? null
        : Number(row.my_badge_number),
    awardedAt: row.awarded_at || null,
  }));
}

// =====================================================
// 🟢 Founding Badge Provider
// =====================================================

export function FoundingBadgeProvider({
  profile,
  children,
}) {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingRole, setClaimingRole] = useState("");

  // =====================================================
  // 🟢 Badge Availability
  // =====================================================

  const loadAvailability = useCallback(async () => {
    const {
      data,
      error: availabilityError,
    } = await supabase.rpc(
      "get_founding_badge_availability"
    );

    if (availabilityError) {
      throw availabilityError;
    }

    const normalized = normalizeRows(data);

    setAvailability(normalized);
    setError(null);

    return normalized;
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      return await loadAvailability();
    } catch (refreshError) {
      console.error(
        "Unable to load Founding 150 status:",
        refreshError
      );

      setError(refreshError);

      return [];
    } finally {
      setLoading(false);
    }
  }, [loadAvailability]);

  // =====================================================
  // 🟢 Badge Claiming
  // =====================================================

  const claimBadge = useCallback(
    async (role, source = "workspace_claim") => {
      const normalizedRole =
        normalizeWorkspaceId(role);

      try {
        setClaimingRole(normalizedRole);

        const {
          data,
          error: claimError,
        } = await supabase.rpc(
          "claim_founding_beta_badge",
          {
            requested_role: normalizedRole,
            claim_source: source,
          }
        );

        if (claimError) {
          throw claimError;
        }

        await loadAvailability();

        setError(null);

        return data || { ok: false };
      } catch (claimError) {
        console.error(
          "Unable to claim Founding 150 badge:",
          claimError
        );

        setError(claimError);

        return {
          ok: false,
          error: claimError,
          message:
            claimError?.message ||
            "The founding badge could not be claimed.",
        };
      } finally {
        setClaimingRole("");
      }
    },
    [loadAvailability]
  );

  // =====================================================
  // 🟢 Initial Badge Bootstrap
  // =====================================================

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      setLoading(true);

      try {
        let rows = await loadAvailability();

        if (!active) {
          return;
        }

        const primaryRole =
          normalizeWorkspaceId(profile?.role);

        const primaryStatus = rows.find(
          (row) => row.role === primaryRole
        );

        if (
          profile?.id &&
          primaryStatus &&
          !primaryStatus.badgeNumber &&
          primaryStatus.remainingCount > 0
        ) {
          const {
            error: claimError,
          } = await supabase.rpc(
            "claim_founding_beta_badge",
            {
              requested_role: primaryRole,
              claim_source:
                "existing_profile_bootstrap",
            }
          );

          if (claimError) {
            throw claimError;
          }

          rows = await loadAvailability();

          if (!active) {
            return;
          }

          setAvailability(rows);
        }
      } catch (bootstrapError) {
        if (!active) {
          return;
        }

        console.error(
          "Unable to initialize Founding 150 status:",
          bootstrapError
        );

        setError(bootstrapError);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [
    loadAvailability,
    profile?.id,
    profile?.role,
  ]);

  // =====================================================
  // 🟢 Derived Badge State
  // =====================================================

  const badges = useMemo(
    () =>
      availability.filter((row) =>
        Number.isFinite(row.badgeNumber)
      ),
    [availability]
  );

  const getRoleStatus = useCallback(
    (role) =>
      availability.find(
        (row) =>
          row.role ===
          normalizeWorkspaceId(role)
      ) || null,
    [availability]
  );

  const getBadgeForRole = useCallback(
    (role) => {
      const status = getRoleStatus(role);

      return status?.badgeNumber
        ? status
        : null;
    },
    [getRoleStatus]
  );

  // =====================================================
  // 🟢 Context Value
  // =====================================================

  const value = useMemo(
    () => ({
      availability,
      badges,
      loading,
      error,
      claimingRole,
      claimBadge,
      refresh,
      getRoleStatus,
      getBadgeForRole,
    }),
    [
      availability,
      badges,
      loading,
      error,
      claimingRole,
      claimBadge,
      refresh,
      getRoleStatus,
      getBadgeForRole,
    ]
  );

  return (
    <FoundingBadgeContext.Provider value={value}>
      {children}
    </FoundingBadgeContext.Provider>
  );
}