// =====================================================
// 🟢 supabaseClient.js
//
// Supabase client connection for AnyPetOS.
//
// Current Responsibilities:
// • Connect React app to Supabase
// • Read environment variables
// • Export reusable Supabase client
//
// Future Responsibilities:
// • Auth helpers
// • Database helpers
// • Storage helpers
//
// =====================================================

import { createClient } from "@supabase/supabase-js";

// =====================================================
// 🟢 Environment Variables
// =====================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// =====================================================
// 🟢 Supabase Client
// =====================================================

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);