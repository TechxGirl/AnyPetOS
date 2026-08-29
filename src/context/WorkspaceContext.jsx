import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_WORKSPACE_ID,
  WORKSPACE_OPTIONS,
  getWorkspaceConfig,
  normalizeWorkspaceId,
} from "../data/workspaces";
import { WorkspaceContext } from "./WorkspaceContextCore";

// =====================================================
// 🟢 WorkspaceContext.jsx
//
// Global AnyPetOS workspace state provider.
//
// Context creation and the useWorkspace hook live in
// WorkspaceContextCore.js so this file only exports
// React components.
// =====================================================

// Legacy keys retained so existing users keep their
// workspace settings after the AnyPetOS rebrand.
const STORAGE_KEY = "petpassport-active-workspace";
const ENABLED_STORAGE_KEY = "petpassport-enabled-workspaces";

// =====================================================
// 🟢 Storage Helpers
// =====================================================

function readStoredWorkspace(profileRole) {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      return normalizeWorkspaceId(stored);
    }
  } catch {
    // Local storage may be unavailable in private
    // or restricted contexts.
  }

  return normalizeWorkspaceId(
    profileRole || DEFAULT_WORKSPACE_ID
  );
}

function readEnabledWorkspaces(primaryWorkspaceId) {
  try {
    const raw = window.localStorage.getItem(
      ENABLED_STORAGE_KEY
    );

    const parsed = raw ? JSON.parse(raw) : null;

    if (Array.isArray(parsed) && parsed.length > 0) {
      return Array.from(
        new Set([
          primaryWorkspaceId,
          ...parsed.map(normalizeWorkspaceId),
        ])
      );
    }
  } catch {
    // Fall through to the default enabled workspace.
  }

  return [primaryWorkspaceId];
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore local storage failures.
    // Workspace state still updates in memory.
  }
}

// =====================================================
// 🟢 Workspace Provider
// =====================================================

export function WorkspaceProvider({
  profileRole,
  children,
}) {
  const initialWorkspace =
    readStoredWorkspace(profileRole);

  const [
    activeWorkspaceId,
    setActiveWorkspaceId,
  ] = useState(initialWorkspace);

  const [
    enabledWorkspaceIds,
    setEnabledWorkspaceIds,
  ] = useState(() =>
    readEnabledWorkspaces(initialWorkspace)
  );

  const workspace = useMemo(
    () => getWorkspaceConfig(activeWorkspaceId),
    [activeWorkspaceId]
  );

  // =====================================================
  // 🟢 Workspace Theme Sync
  // =====================================================

  useEffect(() => {
    document.documentElement.dataset.workspace =
      workspace.id;

    document.documentElement.style.setProperty(
      "--pp-workspace-accent",
      workspace.accent
    );
  }, [workspace]);

  // =====================================================
  // 🟢 Workspace Actions
  // =====================================================

  const setActiveWorkspace = useCallback(
    (workspaceId) => {
      const normalized =
        normalizeWorkspaceId(workspaceId);

      setActiveWorkspaceId(normalized);

      setEnabledWorkspaceIds((current) =>
        Array.from(
          new Set([
            normalized,
            ...current.map(normalizeWorkspaceId),
          ])
        )
      );

      writeStorage(STORAGE_KEY, normalized);
    },
    []
  );

  const toggleEnabledWorkspace = useCallback(
    (workspaceId) => {
      const normalized =
        normalizeWorkspaceId(workspaceId);

      setEnabledWorkspaceIds((current) => {
        const exists =
          current.includes(normalized);

        const next = exists
          ? current.filter(
              (item) => item !== normalized
            )
          : [...current, normalized];

        const safeNext =
          next.length > 0
            ? next
            : [DEFAULT_WORKSPACE_ID];

        if (!safeNext.includes(activeWorkspaceId)) {
          const replacement = safeNext[0];

          setActiveWorkspaceId(replacement);

          writeStorage(
            STORAGE_KEY,
            replacement
          );
        }

        writeStorage(
          ENABLED_STORAGE_KEY,
          JSON.stringify(safeNext)
        );

        return safeNext;
      });
    },
    [activeWorkspaceId]
  );

  // =====================================================
  // 🟢 Context Value
  // =====================================================

  const value = useMemo(
    () => ({
      activeWorkspaceId,
      enabledWorkspaceIds,
      setActiveWorkspace,
      toggleEnabledWorkspace,
      workspace,
      workspaces: WORKSPACE_OPTIONS,
    }),
    [
      activeWorkspaceId,
      enabledWorkspaceIds,
      setActiveWorkspace,
      toggleEnabledWorkspace,
      workspace,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}