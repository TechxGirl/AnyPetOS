// =====================================================
// 🟢 supabaseClient.js
//
// Supabase connection and browser-session storage.
// =====================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const REMEMBER_ME_KEY = "anypetos-remember-me";

function canUseBrowserStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage) && Boolean(window.sessionStorage);
}

export function getRememberMePreference() {
  if (!canUseBrowserStorage()) return true;
  return window.localStorage.getItem(REMEMBER_ME_KEY) !== "false";
}

export function setRememberMePreference(remember) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(REMEMBER_ME_KEY, remember ? "true" : "false");
}

const authStorage = {
  getItem(key) {
    if (!canUseBrowserStorage()) return null;

    const remember = getRememberMePreference();
    const primary = remember ? window.localStorage : window.sessionStorage;
    const secondary = remember ? window.sessionStorage : window.localStorage;

    return primary.getItem(key) ?? secondary.getItem(key);
  },

  setItem(key, value) {
    if (!canUseBrowserStorage()) return;

    const remember = getRememberMePreference();
    const primary = remember ? window.localStorage : window.sessionStorage;
    const secondary = remember ? window.sessionStorage : window.localStorage;

    primary.setItem(key, value);
    secondary.removeItem(key);
  },

  removeItem(key) {
    if (!canUseBrowserStorage()) return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: authStorage,
  },
});
