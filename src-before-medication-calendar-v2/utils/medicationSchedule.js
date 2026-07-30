const HOUR_MS = 60 * 60 * 1000;

function toTimestamp(value) {
  if (value === null || value === undefined || value === "") return null;
  const timestamp = typeof value === "number" ? value : new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getMedicationIntervalMs(med) {
  const frequencyHours = Number(med?.frequencyHours);
  if (!Number.isFinite(frequencyHours) || frequencyHours <= 0) return null;
  return frequencyHours * HOUR_MS;
}

export function getMedicationDoseHistory(med) {
  return Array.isArray(med?.doseHistory) ? med.doseHistory : [];
}

export function getMedicationLastGiven(med) {
  const historyTimes = getMedicationDoseHistory(med)
    .filter((record) => record?.status === "given" || !record?.status)
    .map((record) => toTimestamp(record?.givenAt))
    .filter(Number.isFinite);

  if (historyTimes.length > 0) {
    return Math.max(...historyTimes);
  }

  return toTimestamp(med?.lastGiven);
}

export function getMedicationScheduleAnchor(med) {
  return toTimestamp(med?.firstDose) ?? toTimestamp(med?.startDate);
}

export function getNextMedicationDose(med) {
  const intervalMs = getMedicationIntervalMs(med);
  if (!intervalMs) return null;

  const resolvedHistory = getMedicationDoseHistory(med)
    .filter((record) => ["given", "skipped"].includes(record?.status || "given"))
    .map((record) => ({
      scheduledFor: toTimestamp(record?.scheduledFor),
      givenAt: toTimestamp(record?.givenAt),
    }))
    .map((record) => record.scheduledFor ?? record.givenAt)
    .filter(Number.isFinite);

  if (resolvedHistory.length > 0) {
    return Math.max(...resolvedHistory) + intervalMs;
  }

  // Existing medications created before dose history was added keep their
  // previous behavior until their next dose is recorded.
  const legacyLastGiven = toTimestamp(med?.lastGiven);
  if (legacyLastGiven) {
    return legacyLastGiven + intervalMs;
  }

  return getMedicationScheduleAnchor(med);
}

export function isMedicationDue(med, now = Date.now()) {
  const nextDose = getNextMedicationDose(med);
  return !nextDose || Number(now) >= nextDose;
}
