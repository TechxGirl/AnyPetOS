// ==========================================
// AnyPetOS
// Format Date Utility
// ==========================================

export function formatDate(date) {
  if (!date) return "Unknown";

  return new Date(date).toLocaleDateString();
}

export function formatDateTime(date) {
  if (!date) return "Unknown";

  return new Date(date).toLocaleString();
}