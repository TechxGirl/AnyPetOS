const DAY_MS = 24 * 60 * 60 * 1000;

export function formatDateTime(value) {
  if (!value) return "Not scheduled";
  const timestamp = typeof value === "number" ? value : new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Not scheduled";
  return new Date(timestamp).toLocaleString();
}

export function formatDate(value) {
  if (!value) return "Not logged";
  const timestamp = typeof value === "number" ? value : new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Not logged";
  return new Date(timestamp).toLocaleDateString();
}

export function getRelativeDay(value) {
  if (!value) return "Not scheduled";
  const timestamp = typeof value === "number" ? value : new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "Not scheduled";
  const diff = timestamp - Date.now();
  const days = Math.ceil(diff / DAY_MS);

  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

export function getNextMedicationDose(med) {
  const frequency = Number(med?.frequencyHours);
  if (!Number.isFinite(frequency) || frequency <= 0) return null;
  if (!med?.lastGiven) return Date.now();
  return Number(med.lastGiven) + frequency * 60 * 60 * 1000;
}

export function getMedicationReminders(pets = []) {
  return pets.flatMap((pet) =>
    (pet.meds || []).map((med) => {
      const nextDose = getNextMedicationDose(med);
      return {
        id: `${pet.id}-${med.id || med.name}`,
        petId: pet.id,
        petName: pet.name || "Unnamed animal",
        type: "Medication",
        title: med.name || "Medication",
        subtitle: `${med.dose || "No dose"}${med.route ? ` • ${med.route}` : ""}`,
        dueAt: nextDose,
        isDue: !nextDose || Date.now() >= nextDose,
      };
    })
  );
}

export function getCollectionInsights(pets = []) {
  const now = Date.now();
  const favoritePets = pets.filter((pet) => pet.favorite);
  const overdueFeedings = pets.filter((pet) => pet.nextFeed && now > pet.nextFeed);
  const upcomingFeedings = pets
    .filter((pet) => pet.nextFeed && now <= pet.nextFeed)
    .map((pet) => ({
      id: `feed-${pet.id}`,
      petId: pet.id,
      petName: pet.name || "Unnamed animal",
      type: "Feeding",
      title: "Next feeding",
      subtitle: pet.foodList?.length ? pet.foodList.join(", ") : pet.diet || "Meal",
      dueAt: pet.nextFeed,
      isDue: false,
    }));

  const attentionPets = pets.filter((pet) =>
    ["Sick", "Monitoring", "Quarantine"].includes(pet.status)
  );

  const medicationReminders = getMedicationReminders(pets);
  const dueMeds = medicationReminders.filter((item) => item.isDue);

  const upcomingReminders = [
    ...overdueFeedings.map((pet) => ({
      id: `overdue-feed-${pet.id}`,
      petId: pet.id,
      petName: pet.name || "Unnamed animal",
      type: "Feeding",
      title: "Feeding overdue",
      subtitle: pet.foodList?.length ? pet.foodList.join(", ") : pet.diet || "Meal",
      dueAt: pet.nextFeed,
      isDue: true,
    })),
    ...dueMeds,
    ...upcomingFeedings,
    ...medicationReminders.filter((item) => !item.isDue),
  ]
    .filter((item) => item.dueAt)
    .sort((a, b) => Number(a.dueAt) - Number(b.dueAt));

  const statusCounts = pets.reduce((counts, pet) => {
    const status = pet.status || "Healthy";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  const speciesCounts = pets.reduce((counts, pet) => {
    const species = pet.species || "Unknown";
    counts[species] = (counts[species] || 0) + 1;
    return counts;
  }, {});

  const recentActivity = pets
    .flatMap((pet) =>
      (pet.logs || []).map((log) => ({
        ...log,
        petId: pet.id,
        petName: pet.name || "Unnamed animal",
      }))
    )
    .filter((log) => log.time)
    .sort((a, b) => Number(b.time) - Number(a.time))
    .slice(0, 8);

  const dailyBriefing = [];
  if (overdueFeedings.length) dailyBriefing.push(`${overdueFeedings.length} feeding${overdueFeedings.length === 1 ? "" : "s"} overdue`);
  if (dueMeds.length) dailyBriefing.push(`${dueMeds.length} medication dose${dueMeds.length === 1 ? "" : "s"} due`);
  if (attentionPets.length) dailyBriefing.push(`${attentionPets.length} animal${attentionPets.length === 1 ? "" : "s"} in monitoring/quarantine/sick status`);
  if (!dailyBriefing.length) dailyBriefing.push("No urgent care tasks detected today");

  return {
    totalPets: pets.length,
    favoritePets,
    overdueFeedings,
    upcomingFeedings,
    medicationReminders,
    dueMeds,
    attentionPets,
    upcomingReminders,
    statusCounts,
    speciesCounts,
    recentActivity,
    dailyBriefing,
  };
}

export function getPetHistory(pet) {
  const logs = pet?.logs || [];
  const feedingLogs = logs.filter((log) => /fed|feeding/i.test(log.type || log.note || ""));
  const medicationLogs = logs.filter((log) => /medication|dose|treatment/i.test(log.type || log.note || ""));
  const shedLogs = logs.filter((log) => /shed/i.test(log.type || log.note || ""));
  const medicalLogs = logs.filter((log) => /sick|health|vet|medical|ri|infection|injury|quarantine|monitor/i.test(`${log.type || ""} ${log.note || ""}`));
  const weightLogs = Array.isArray(pet?.weightLogs) ? pet.weightLogs : [];

  return {
    logs,
    feedingLogs,
    medicationLogs,
    shedLogs,
    medicalLogs,
    weightLogs,
  };
}

export function getWeightTrend(weightLogs = []) {
  const clean = weightLogs
    .filter((entry) => Number.isFinite(Number(entry.weight)))
    .slice(0, 8)
    .reverse();

  if (!clean.length) return [];

  const max = Math.max(...clean.map((entry) => Number(entry.weight)));
  const min = Math.min(...clean.map((entry) => Number(entry.weight)));
  const range = Math.max(max - min, 1);

  return clean.map((entry) => ({
    ...entry,
    percent: Math.max(12, Math.round(((Number(entry.weight) - min) / range) * 88 + 12)),
  }));
}
