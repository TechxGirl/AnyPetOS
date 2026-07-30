// ==========================================
// AnyPetOS
// Calculate Age Utility
// ==========================================

export function calculateAge(dob) {
  if (!dob) return "Unknown";

  const birth = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years <= 0) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }

  return `${years} year${years !== 1 ? "s" : ""}${
    months > 0 ? ` ${months} month${months !== 1 ? "s" : ""}` : ""
  }`;
}