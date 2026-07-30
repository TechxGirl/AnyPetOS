const PAGE_STORAGE_PREFIX = "anypetos-last-page";
const PAGE_HASH_KEY = "page";

export const DEFAULT_APP_PAGE = "Dashboard";

function getProfileIdentity(profile) {
  return (
    profile?.user_id ||
    profile?.id ||
    profile?.username ||
    profile?.display_name ||
    "default"
  );
}

export function getPageStorageKey(profile) {
  return `${PAGE_STORAGE_PREFIX}:${String(getProfileIdentity(profile))}`;
}

export function getAccessiblePages(workspace) {
  const navigationPages = (workspace?.navigationGroups || []).flatMap((group) =>
    (group.items || []).map((item) => item.page)
  );

  return new Set([DEFAULT_APP_PAGE, ...navigationPages].filter(Boolean));
}

export function isAccessiblePage(page, workspace) {
  return typeof page === "string" && getAccessiblePages(workspace).has(page);
}

function readPageFromHash() {
  if (typeof window === "undefined") return null;

  try {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const page = params.get(PAGE_HASH_KEY);
    return page ? decodeURIComponent(page) : null;
  } catch {
    return null;
  }
}

function readPageFromStorage(profile) {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(getPageStorageKey(profile));
  } catch {
    return null;
  }
}

export function readInitialPage({ profile, workspace }) {
  const hashPage = readPageFromHash();
  if (isAccessiblePage(hashPage, workspace)) return hashPage;

  const storedPage = readPageFromStorage(profile);
  if (isAccessiblePage(storedPage, workspace)) return storedPage;

  return DEFAULT_APP_PAGE;
}

export function readPageFromLocation(workspace) {
  const hashPage = readPageFromHash();
  return isAccessiblePage(hashPage, workspace)
    ? hashPage
    : DEFAULT_APP_PAGE;
}

export function persistPage({
  page,
  profile,
  workspace,
  historyMode = "replace",
}) {
  if (typeof window === "undefined") return DEFAULT_APP_PAGE;

  const safePage = isAccessiblePage(page, workspace)
    ? page
    : DEFAULT_APP_PAGE;

  try {
    window.localStorage.setItem(getPageStorageKey(profile), safePage);
  } catch {
    // Navigation still works if storage is blocked or unavailable.
  }

  try {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.hash.replace(/^#/, ""));
    params.set(PAGE_HASH_KEY, safePage);
    url.hash = params.toString();

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const method = historyMode === "push" ? "pushState" : "replaceState";
    window.history[method]({ page: safePage }, "", nextUrl);
  } catch {
    // Local storage remains the fallback if the URL cannot be updated.
  }

  return safePage;
}
