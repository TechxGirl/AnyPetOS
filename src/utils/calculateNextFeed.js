// ==========================================
// PetPassport
// Calculate Next Feed Utility
// ==========================================

export function calculateNextFeed(feedingTime, frequencyDays) {
  const frequency = Number(frequencyDays) || 0;

  if (!feedingTime || frequency <= 0) {
    return null;
  }

  return feedingTime + frequency * 24 * 60 * 60 * 1000;
}