import { createId } from "./id";

export const IMPORT_FIELDS = [
  { key: "ignore", label: "Do not import" },
  { key: "name", label: "Name" },
  { key: "species", label: "Species" },
  { key: "category", label: "Animal group/category" },
  { key: "morph", label: "Morph / variety" },
  { key: "sex", label: "Sex" },
  { key: "status", label: "Status" },
  { key: "dob", label: "DOB / hatch date" },
  { key: "weight", label: "Weight" },
  { key: "weightUnit", label: "Weight unit" },
  { key: "food", label: "Primary food" },
  { key: "frequency", label: "Feeding frequency" },
  { key: "temperament", label: "Temperament" },
  { key: "source", label: "Source / breeder / rescue" },
  { key: "morphMarketId", label: "MorphMarket animal ID" },
  { key: "price", label: "Price" },
  { key: "notes", label: "Notes" },
];

export const IMPORT_TEMPLATES = [
  {
    id: "morphmarket",
    label: "MorphMarket export",
    description: "Best for official MorphMarket CSV/export files. We import from files you provide, not scraping.",
  },
  {
    id: "breeder",
    label: "Breeder spreadsheet",
    description: "Inventory sheets with morph, sex, weight, status, source, sale fields, and notes.",
  },
  {
    id: "rescue",
    label: "Rescue intake sheet",
    description: "Intake lists with condition, source, quarantine/adoption status, and notes.",
  },
  {
    id: "generic",
    label: "Generic animal CSV",
    description: "A flexible import for spreadsheets from any tracker or your own custom sheet.",
  },
];

const FIELD_ALIASES = {
  name: ["name", "animal name", "pet name", "title", "nickname"],
  species: ["species", "animal", "animal species", "common name", "type", "breed"],
  category: ["category", "group", "animal group", "class", "taxon"],
  morph: ["morph", "genes", "genetics", "trait", "variety", "phase", "color", "mutation"],
  sex: ["sex", "gender"],
  status: ["status", "availability", "sale status", "animal status", "state"],
  dob: ["dob", "birth date", "hatch date", "hatched", "date born", "date hatched", "birthdate"],
  weight: ["weight", "grams", "g", "current weight", "weight g", "weight grams"],
  weightUnit: ["weight unit", "unit", "weight units"],
  food: ["food", "diet", "feeding", "prey", "prey type", "meal"],
  frequency: ["frequency", "feeding frequency", "feed frequency", "feeding interval", "schedule"],
  temperament: ["temperament", "personality", "disposition", "handling"],
  source: ["source", "breeder", "seller", "origin", "from", "rescued from", "supplier"],
  morphMarketId: ["morphmarket id", "morph market id", "animal id", "ad id", "mm id", "morphmarket animal id", "id"],
  price: ["price", "asking price", "sale price", "cost"],
  notes: ["notes", "description", "comments", "details", "remarks"],
};

function normalizeHeader(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\uFEFF/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitCsvLine(line, delimiter) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];

    if (character === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;

  if (tabCount > commaCount && tabCount >= semicolonCount) return "\t";
  if (semicolonCount > commaCount) return ";";
  return ",";
}

export function parseDelimitedText(text) {
  const delimiter = detectDelimiter(text);
  const lines = String(text || "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length === 0) return { headers: [], rows: [], delimiter };

  const headers = splitCsvLine(lines[0], delimiter).map((header, index) => header || `Column ${index + 1}`);
  const rows = lines.slice(1).map((line, rowIndex) => {
    const values = splitCsvLine(line, delimiter);
    const row = { __rowNumber: rowIndex + 2 };
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    return row;
  });

  return { headers, rows, delimiter };
}

export function createAutoMapping(headers) {
  const mapping = {};

  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    const match = Object.entries(FIELD_ALIASES).find(([, aliases]) =>
      aliases.some((alias) => normalizeHeader(alias) === normalized || normalized.includes(normalizeHeader(alias)))
    );

    mapping[header] = match ? match[0] : "ignore";
  });

  return mapping;
}

function getMappedValue(row, mapping, field) {
  const header = Object.entries(mapping).find(([, mappedField]) => mappedField === field)?.[0];
  return header ? String(row[header] || "").trim() : "";
}

function normalizeSex(value) {
  const normalized = String(value || "").toLowerCase().trim();
  if (["m", "male", "boy", "1.0"].includes(normalized)) return "Male";
  if (["f", "female", "girl", "0.1"].includes(normalized)) return "Female";
  if (["unknown", "unk", "u", "?", "0.0.1"].includes(normalized)) return "Unknown";
  return value || "Unknown";
}

function normalizeStatus(value) {
  const normalized = String(value || "").toLowerCase().trim();
  if (!normalized) return "Healthy";
  if (["available", "for sale", "sale"].includes(normalized)) return "Available";
  if (["hold", "on hold", "reserved"].includes(normalized)) return "Reserved";
  if (["sold", "transferred"].includes(normalized)) return "Sold";
  if (["quarantine", "qt"].includes(normalized)) return "Quarantine";
  if (["sick", "medical", "vet needed"].includes(normalized)) return "Sick";
  return value;
}

function buildDuplicateKey(pet) {
  return [pet.name, pet.species, pet.morph, pet.sex]
    .map((value) => String(value || "").toLowerCase().trim())
    .join("|");
}

export function buildImportPreview(rows, mapping, pets, sourceId) {
  const existingExternalIds = new Set(
    pets
      .map((pet) => pet.externalIds?.morphMarket || pet.morphMarketId || pet.importMeta?.morphMarketId)
      .filter(Boolean)
      .map((value) => String(value).toLowerCase().trim())
  );
  const existingKeys = new Set(pets.map(buildDuplicateKey));
  const seenImportKeys = new Set();
  const seenExternalIds = new Set();

  return rows.map((row) => {
    const name = getMappedValue(row, mapping, "name");
    const species = getMappedValue(row, mapping, "species");
    const morph = getMappedValue(row, mapping, "morph");
    const sex = normalizeSex(getMappedValue(row, mapping, "sex"));
    const morphMarketId = getMappedValue(row, mapping, "morphMarketId");
    const importKey = buildDuplicateKey({ name, species, morph, sex });
    const externalKey = String(morphMarketId || "").toLowerCase().trim();
    const errors = [];
    const warnings = [];

    if (!name) errors.push("Missing name");
    if (!species) errors.push("Missing species");

    const duplicateByExternalId = externalKey && (existingExternalIds.has(externalKey) || seenExternalIds.has(externalKey));
    const duplicateByDetails = importKey.replace(/\|/g, "") && (existingKeys.has(importKey) || seenImportKeys.has(importKey));
    const duplicate = duplicateByExternalId || duplicateByDetails;

    if (duplicate) warnings.push("Possible duplicate");

    seenImportKeys.add(importKey);
    if (externalKey) seenExternalIds.add(externalKey);

    const weightValue = getMappedValue(row, mapping, "weight");
    const weight = Number.parseFloat(String(weightValue).replace(/[^0-9.]/g, ""));

    const pet = {
      id: createId("import-preview"),
      name,
      species,
      category: getMappedValue(row, mapping, "category") || "Reptiles",
      morph,
      sex,
      status: normalizeStatus(getMappedValue(row, mapping, "status")),
      dob: getMappedValue(row, mapping, "dob"),
      weight: Number.isFinite(weight) ? weight : "",
      weightUnit: getMappedValue(row, mapping, "weightUnit") || "g",
      food: getMappedValue(row, mapping, "food"),
      frequency: getMappedValue(row, mapping, "frequency"),
      temperament: getMappedValue(row, mapping, "temperament"),
      notes: getMappedValue(row, mapping, "notes"),
      source: getMappedValue(row, mapping, "source"),
      price: getMappedValue(row, mapping, "price"),
      morphMarketId,
      externalIds: {
        morphMarket: sourceId === "morphmarket" ? morphMarketId : "",
      },
      importMeta: {
        source: sourceId,
        importedAt: Date.now(),
        sourceRow: row.__rowNumber,
        morphMarketId,
      },
    };

    return {
      id: createId("preview"),
      sourceRow: row.__rowNumber,
      pet,
      errors,
      warnings,
      valid: errors.length === 0,
      duplicate,
    };
  });
}

function escapeCsv(value) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}

export function petsToCsv(pets) {
  const headers = ["Passport ID", "Name", "Species", "Morph", "Sex", "Status", "Weight", "Last Fed", "Next Feed", "Favorite"];
  const lines = [headers.join(",")];

  pets.forEach((pet) => {
    lines.push([
      pet.passportId,
      pet.name,
      pet.species,
      pet.morph,
      pet.sex,
      pet.status,
      pet.weight,
      pet.lastFed ? new Date(pet.lastFed).toLocaleDateString() : "",
      pet.nextFeed ? new Date(pet.nextFeed).toLocaleDateString() : "",
      pet.favorite ? "Yes" : "No",
    ].map(escapeCsv).join(","));
  });

  return lines.join("\n");
}

export function downloadTextFile(filename, contents, mimeType = "text/plain") {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
