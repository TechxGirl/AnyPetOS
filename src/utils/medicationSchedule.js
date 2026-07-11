const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MATCH_TOLERANCE_MS = 5 * 60 * 1000;
const ON_TIME_GRACE_MS = 60 * 60 * 1000;

function toTimestamp(value) {
  if (value === null || value === undefined || value === "") return null;
  const timestamp = typeof value === "number" ? value : new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function sameLocalDay(first, second) {
  const a = new Date(first);
  const b = new Date(second);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getMedicationIntervalMs(med) {
  const frequencyHours = Number(med?.frequencyHours);
  if (!Number.isFinite(frequencyHours) || frequencyHours <= 0) return null;
  return frequencyHours * HOUR_MS;
}

export function getMedicationDoseHistory(med) {
  return Array.isArray(med?.doseHistory) ? med.doseHistory : [];
}

export function getMedicationScheduleAnchor(med) {
  return toTimestamp(med?.firstDose) ?? toTimestamp(med?.startDate);
}

export function getMedicationDurationCount(med) {
  const raw = med?.durationCount ?? med?.durationDoses ?? med?.durationDays;
  const count = Number(raw);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : null;
}

export function getMedicationDurationUnit(med) {
  if (med?.continueIndefinitely) return "ongoing";
  if (["doses", "days"].includes(med?.durationUnit)) return med.durationUnit;
  return med?.durationCount || med?.durationDoses ? "doses" : "days";
}

export function getMedicationLastGiven(med) {
  const historyTimes = getMedicationDoseHistory(med)
    .filter((record) => (record?.status || "given") === "given")
    .map((record) => toTimestamp(record?.givenAt))
    .filter(Number.isFinite);

  if (historyTimes.length > 0) return Math.max(...historyTimes);
  return toTimestamp(med?.lastGiven);
}

function findDoseRecord(history, scheduledFor) {
  return history.find((record) => {
    const recordScheduledFor = toTimestamp(record?.scheduledFor);
    return (
      Number.isFinite(recordScheduledFor) &&
      Math.abs(recordScheduledFor - scheduledFor) <= MATCH_TOLERANCE_MS
    );
  });
}

function getOccurrenceStatus(record, scheduledFor, now) {
  if (record) {
    if (record.status === "skipped") return "skipped";
    if (record.status === "missed") return "missed";

    const givenAt = toTimestamp(record.givenAt);
    if (givenAt) {
      if (givenAt - scheduledFor > ON_TIME_GRACE_MS) return "given-late";
      return "given";
    }
  }

  if (scheduledFor > now) return "upcoming";
  if (sameLocalDay(scheduledFor, now)) return "due-today";
  return "missed";
}

export function getMedicationStatusLabel(status) {
  const labels = {
    upcoming: "Upcoming",
    "due-today": "Due today",
    given: "Given",
    "given-late": "Given late",
    skipped: "Skipped",
    missed: "Missed / unrecorded",
  };
  return labels[status] || "Scheduled";
}

export function getMedicationStatusVariant(status) {
  if (["given"].includes(status)) return "success";
  if (["upcoming"].includes(status)) return "info";
  if (["due-today", "skipped"].includes(status)) return "warning";
  if (["given-late", "missed"].includes(status)) return "danger";
  return "neutral";
}

export function generateMedicationOccurrences(
  med,
  {
    rangeStart = null,
    rangeEnd = null,
    now = Date.now(),
    maxOccurrences = 500,
  } = {}
) {
  const anchor = getMedicationScheduleAnchor(med);
  const intervalMs = getMedicationIntervalMs(med);
  if (!anchor || !intervalMs) return [];

  const durationUnit = getMedicationDurationUnit(med);
  const durationCount = getMedicationDurationCount(med);
  const history = getMedicationDoseHistory(med);
  const resolvedRangeStart = toTimestamp(rangeStart);
  const resolvedRangeEnd = toTimestamp(rangeEnd);
  const occurrences = [];

  let firstIndex = 0;
  if (durationUnit === "ongoing" && resolvedRangeStart && resolvedRangeStart > anchor) {
    firstIndex = Math.max(0, Math.floor((resolvedRangeStart - anchor) / intervalMs) - 1);
  }

  let index = firstIndex;
  while (occurrences.length < maxOccurrences) {
    if (durationUnit === "doses" && durationCount && index >= durationCount) break;

    const scheduledFor = anchor + index * intervalMs;

    if (durationUnit === "days" && durationCount) {
      const endExclusive = anchor + durationCount * DAY_MS;
      if (scheduledFor >= endExclusive) break;
    }

    if (resolvedRangeEnd && scheduledFor > resolvedRangeEnd) break;

    if (!resolvedRangeStart || scheduledFor >= resolvedRangeStart) {
      const record = findDoseRecord(history, scheduledFor);
      const givenAt = toTimestamp(record?.givenAt);
      occurrences.push({
        id: `${med?.id || "med"}-${scheduledFor}`,
        index,
        doseNumber: index + 1,
        scheduledFor,
        givenAt,
        notes: record?.notes || "",
        record: record || null,
        status: getOccurrenceStatus(record, scheduledFor, Number(now)),
      });
    }

    index += 1;

    if (durationUnit === "ongoing" && !resolvedRangeEnd && index - firstIndex >= 120) break;
    if (durationUnit !== "ongoing" && !durationCount && index >= 120) break;
  }

  return occurrences;
}

export function getNextMedicationOccurrence(med, now = Date.now()) {
  const anchor = getMedicationScheduleAnchor(med);
  if (!anchor) return null;

  const intervalMs = getMedicationIntervalMs(med) || DAY_MS;
  const rangeStart = Math.min(anchor, Number(now) - 365 * DAY_MS);
  const rangeEnd = Number(now) + Math.max(365 * DAY_MS, intervalMs * 120);
  const occurrences = generateMedicationOccurrences(med, {
    rangeStart,
    rangeEnd,
    now,
    maxOccurrences: 1000,
  });

  return (
    occurrences.find((occurrence) =>
      ["missed", "due-today", "upcoming"].includes(occurrence.status)
    ) || null
  );
}

export function getNextMedicationDose(med, now = Date.now()) {
  return getNextMedicationOccurrence(med, now)?.scheduledFor ?? null;
}

export function isMedicationDue(med, now = Date.now()) {
  const occurrence = getNextMedicationOccurrence(med, now);
  return Boolean(occurrence && ["missed", "due-today"].includes(occurrence.status));
}

export function getMedicationProgress(med, now = Date.now()) {
  if (med?.continueIndefinitely) return null;
  const occurrences = generateMedicationOccurrences(med, { now, maxOccurrences: 1000 });
  if (!occurrences.length) return null;

  const resolved = occurrences.filter((occurrence) =>
    ["given", "given-late", "skipped"].includes(occurrence.status)
  ).length;

  return {
    completed: resolved,
    total: occurrences.length,
    percent: Math.min(100, Math.round((resolved / occurrences.length) * 100)),
  };
}

export function getMedicationCourseLabel(med) {
  if (med?.continueIndefinitely) return "Ongoing";
  const count = getMedicationDurationCount(med);
  const unit = getMedicationDurationUnit(med);
  if (!count) return "Length not set";
  return `${count} ${unit === "doses" ? (count === 1 ? "dose" : "doses") : count === 1 ? "day" : "days"}`;
}

export function getMedicationCalendarEvents(pets, rangeStart, rangeEnd, now = Date.now()) {
  return pets.flatMap((pet) =>
    (pet.meds || []).flatMap((med) =>
      generateMedicationOccurrences(med, {
        rangeStart,
        rangeEnd,
        now,
        maxOccurrences: 1000,
      }).map((occurrence) => ({
        ...occurrence,
        type: "medication",
        petId: pet.id,
        petName: pet.name,
        petSpecies: pet.species,
        medId: med.id,
        medName: med.name || "Medication",
        dose: med.dose || "",
        route: med.route || "",
        medication: med,
        pet,
      }))
    )
  );
}
