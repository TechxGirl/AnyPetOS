import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "../context/WorkspaceContextCore";
import { getModuleForPage } from "../data/workspaces";
import { Button, Badge, Card, CardHeader, EmptyState, FormField, Icon, Input, PageHeader, Select, Textarea, useToast } from "../components/ui";
import { createId } from "../utils/id";
import { downloadTextFile } from "../utils/importExport";

const STORAGE_KEY = "petpassport.workspace.records.v1";

function readStoredRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function normalizeStatus(value) {
  return String(value || "").toLowerCase().trim();
}

function countByPipeline(pets, pipeline) {
  return pets.filter((pet) =>
    pipeline.statuses.some((status) => normalizeStatus(pet.status) === normalizeStatus(status))
  ).length;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function petLabel(pet) {
  if (!pet) return "Unassigned";
  return [pet.name, pet.species].filter(Boolean).join(" â€¢ ") || pet.name || "Unnamed animal";
}

const GENERIC_DEFINITIONS = {
  default: {
    recordLabel: "workflow card",
    typeLabel: "Record type",
    primaryAction: "Create workflow card",
    emptyTitle: "No workflow cards yet",
    emptyDescription: "Create the first record for this module. These cards are saved locally for beta testing until we add dedicated cloud tables.",
    types: ["Task", "Note", "Follow-up", "Reminder"],
    statuses: ["Planned", "Active", "Waiting", "Complete"],
    quickRecords: [
      { title: "Create module task", type: "Task", status: "Planned", priority: "Normal", dueInDays: 7 },
      { title: "Add follow-up note", type: "Follow-up", status: "Active", priority: "Normal", dueInDays: 3 },
    ],
  },
  "Care Planner": {
    recordLabel: "care routine",
    typeLabel: "Routine type",
    primaryAction: "Create care routine",
    emptyTitle: "No care routines yet",
    emptyDescription: "Create feeding, cleaning, weight, medication, humidity, UVB, or vet follow-up routines.",
    types: ["Feeding", "Cleaning", "Weight", "Medication", "Humidity", "UVB", "Vet follow-up"],
    statuses: ["Planned", "Due soon", "Overdue", "Complete"],
    quickRecords: [
      { title: "Set feeding routine", type: "Feeding", status: "Planned", priority: "Normal", dueInDays: 7 },
      { title: "Schedule enclosure cleaning", type: "Cleaning", status: "Due soon", priority: "Normal", dueInDays: 14 },
      { title: "Add UVB replacement reminder", type: "UVB", status: "Planned", priority: "Normal", dueInDays: 180 },
    ],
  },
  "Health Watch": {
    recordLabel: "health flag",
    typeLabel: "Flag type",
    primaryAction: "Create health flag",
    emptyTitle: "No health flags yet",
    emptyDescription: "Track monitoring notes, quarantine, weight concerns, symptoms, vet follow-ups, and recovery milestones.",
    types: ["Watch", "Symptom", "Weight concern", "Quarantine", "Vet follow-up", "Recovery"],
    statuses: ["Watching", "Needs action", "Vet needed", "Resolved"],
    quickRecords: [
      { title: "Add health watch note", type: "Watch", status: "Watching", priority: "High", dueInDays: 1 },
      { title: "Schedule vet follow-up", type: "Vet follow-up", status: "Needs action", priority: "High", dueInDays: 3 },
    ],
  },
  "Sitter Access": {
    recordLabel: "sitter access plan",
    typeLabel: "Access type",
    primaryAction: "Create sitter plan",
    emptyTitle: "No sitter access plans yet",
    emptyDescription: "Prepare temporary care instructions, visit tasks, emergency contacts, and access windows.",
    types: ["Temporary access", "Care instruction", "Visit task", "Emergency note"],
    statuses: ["Draft", "Ready", "Shared", "Complete"],
    quickRecords: [
      { title: "Prepare sitter instructions", type: "Care instruction", status: "Draft", priority: "Normal", dueInDays: 2 },
      { title: "Add emergency contact note", type: "Emergency note", status: "Ready", priority: "High", dueInDays: 1 },
    ],
  },
  Pairings: {
    recordLabel: "pairing plan",
    typeLabel: "Pairing type",
    primaryAction: "Create pairing plan",
    emptyTitle: "No pairing plans yet",
    emptyDescription: "Plan pairings, lock observations, ovulation notes, clutch expectations, and hatchling follow-up.",
    types: ["Pairing", "Lock", "Ovulation", "Pre-lay", "Clutch", "Follow-up"],
    statuses: ["Planned", "Paired", "Confirmed", "Complete"],
    quickRecords: [
      { title: "Plan new pairing", type: "Pairing", status: "Planned", priority: "Normal", dueInDays: 7 },
      { title: "Record observed lock", type: "Lock", status: "Paired", priority: "Normal", dueInDays: 0 },
    ],
  },
  Hatchlings: {
    recordLabel: "hatchling record",
    typeLabel: "Record type",
    primaryAction: "Create hatchling record",
    emptyTitle: "No hatchling records yet",
    emptyDescription: "Track eggs, hatch dates, first sheds, first meals, IDs, holdbacks, and sale readiness.",
    types: ["Egg", "Hatchling", "First shed", "First meal", "ID assignment", "Holdback decision"],
    statuses: ["Incubating", "Hatched", "Established", "Ready"],
    quickRecords: [
      { title: "Add hatchling group", type: "Hatchling", status: "Hatched", priority: "Normal", dueInDays: 0 },
      { title: "Track first meal", type: "First meal", status: "Established", priority: "High", dueInDays: 7 },
    ],
  },
  Sales: {
    recordLabel: "sales record",
    typeLabel: "Sales type",
    primaryAction: "Create sales record",
    emptyTitle: "No sales records yet",
    emptyDescription: "Track available animals, inquiries, holds, deposits, pickup/shipping, and transfer completion.",
    types: ["Available listing", "Inquiry", "Hold", "Deposit", "Paid", "Pickup/Shipping", "Transfer"],
    statuses: ["Available", "Reserved", "Paid", "Transferred"],
    quickRecords: [
      { title: "Mark animal available", type: "Available listing", status: "Available", priority: "Normal", dueInDays: 0 },
      { title: "Create transfer follow-up", type: "Transfer", status: "Reserved", priority: "High", dueInDays: 2 },
    ],
  },
  Transfers: {
    recordLabel: "transfer note",
    typeLabel: "Transfer type",
    primaryAction: "Create transfer note",
    emptyTitle: "No transfer notes yet",
    emptyDescription: "Track active invites, recipient setup, cancelled links, transfer receipts, and animals that left your account.",
    types: ["Invite", "Recipient setup", "Cancelled", "Receipt", "Transferred folder"],
    statuses: ["Draft", "Pending", "Accepted", "Archived"],
    quickRecords: [
      { title: "Create transfer prep note", type: "Invite", status: "Draft", priority: "Normal", dueInDays: 0 },
      { title: "Recipient reminder setup", type: "Recipient setup", status: "Pending", priority: "Normal", dueInDays: 1 },
    ],
  },
  "Expo Mode": {
    recordLabel: "expo task",
    typeLabel: "Expo type",
    primaryAction: "Create expo task",
    emptyTitle: "No expo tasks yet",
    emptyDescription: "Prepare QR cards, buyer scan links, table labels, available animals, and pickup/transfer tasks.",
    types: ["QR card", "Cage label", "Available list", "Buyer scan", "Pickup task"],
    statuses: ["Needs prep", "Ready", "At expo", "Complete"],
    quickRecords: [
      { title: "Prepare printable QR card", type: "QR card", status: "Needs prep", priority: "Normal", dueInDays: 7 },
      { title: "Build available animal list", type: "Available list", status: "Ready", priority: "Normal", dueInDays: 3 },
    ],
  },
  Intake: {
    recordLabel: "intake record",
    typeLabel: "Intake type",
    primaryAction: "Create intake record",
    emptyTitle: "No intake records yet",
    emptyDescription: "Capture source, surrender notes, condition, baseline weight, photos, urgency, and first care tasks.",
    types: ["Surrender", "Found animal", "Owner transfer", "Condition check", "First weight", "Urgency note"],
    statuses: ["New", "Needs triage", "Quarantine", "Complete"],
    quickRecords: [
      { title: "Start new intake", type: "Surrender", status: "New", priority: "High", dueInDays: 0 },
      { title: "Record first condition check", type: "Condition check", status: "Needs triage", priority: "High", dueInDays: 0 },
    ],
  },
  Quarantine: {
    recordLabel: "quarantine record",
    typeLabel: "Record type",
    primaryAction: "Create quarantine record",
    emptyTitle: "No quarantine records yet",
    emptyDescription: "Track quarantine start, symptoms, treatments, biosecurity tasks, clearance goals, and release notes.",
    types: ["Start quarantine", "Symptom check", "Treatment", "Biosecurity task", "Clearance goal"],
    statuses: ["Active", "Watching", "Needs vet", "Cleared"],
    quickRecords: [
      { title: "Start quarantine clock", type: "Start quarantine", status: "Active", priority: "High", dueInDays: 0 },
      { title: "Add symptom check", type: "Symptom check", status: "Watching", priority: "High", dueInDays: 1 },
    ],
  },
  "Rehab Plans": {
    recordLabel: "rehab milestone",
    typeLabel: "Milestone type",
    primaryAction: "Create rehab milestone",
    emptyTitle: "No rehab milestones yet",
    emptyDescription: "Create recovery plans, milestones, follow-ups, weight goals, feeding goals, and adoption readiness notes.",
    types: ["Recovery goal", "Weight goal", "Feeding goal", "Follow-up", "Adoption readiness"],
    statuses: ["Planned", "In progress", "Needs follow-up", "Complete"],
    quickRecords: [
      { title: "Create recovery milestone", type: "Recovery goal", status: "Planned", priority: "Normal", dueInDays: 7 },
      { title: "Add adoption readiness note", type: "Adoption readiness", status: "Needs follow-up", priority: "Normal", dueInDays: 14 },
    ],
  },
  Adoptions: {
    recordLabel: "adoption task",
    typeLabel: "Task type",
    primaryAction: "Create adoption task",
    emptyTitle: "No adoption tasks yet",
    emptyDescription: "Track adoption-ready animals, applications, home checks, adopter setup, and final Passport transfer.",
    types: ["Application", "Home check", "Adopter notes", "Contract", "Transfer"],
    statuses: ["Draft", "Reviewing", "Approved", "Adopted"],
    quickRecords: [
      { title: "Prepare adoption profile", type: "Adopter notes", status: "Draft", priority: "Normal", dueInDays: 3 },
      { title: "Create adoption transfer checklist", type: "Transfer", status: "Approved", priority: "High", dueInDays: 1 },
    ],
  },
  "Foster Care": {
    recordLabel: "foster record",
    typeLabel: "Foster type",
    primaryAction: "Create foster record",
    emptyTitle: "No foster records yet",
    emptyDescription: "Assign animals to fosters, track temporary care access, proof-of-care notes, and return/adoption plans.",
    types: ["Foster assignment", "Care note", "Proof of care", "Return plan", "Adoption plan"],
    statuses: ["Needs foster", "Assigned", "Monitoring", "Returned"],
    quickRecords: [
      { title: "Create foster assignment", type: "Foster assignment", status: "Needs foster", priority: "High", dueInDays: 2 },
      { title: "Add foster care instruction", type: "Care note", status: "Assigned", priority: "Normal", dueInDays: 1 },
    ],
  },
  Appointments: {
    recordLabel: "appointment",
    typeLabel: "Appointment type",
    primaryAction: "Create appointment",
    emptyTitle: "No appointments yet",
    emptyDescription: "Track exams, follow-ups, medication checks, weight checks, and shared record reviews.",
    types: ["Exam", "Follow-up", "Medication check", "Weight check", "Record review"],
    statuses: ["Scheduled", "Checked in", "Needs follow-up", "Complete"],
    quickRecords: [
      { title: "Schedule follow-up", type: "Follow-up", status: "Scheduled", priority: "Normal", dueInDays: 7 },
      { title: "Medication recheck", type: "Medication check", status: "Needs follow-up", priority: "High", dueInDays: 3 },
    ],
  },
  "Treatment Notes": {
    recordLabel: "treatment note",
    typeLabel: "Note type",
    primaryAction: "Create treatment note",
    emptyTitle: "No treatment notes yet",
    emptyDescription: "Create clinical notes, treatment plans, medication changes, follow-ups, and owner instructions.",
    types: ["SOAP note", "Treatment plan", "Medication change", "Owner instruction", "Follow-up"],
    statuses: ["Draft", "Active", "Needs review", "Finalized"],
    quickRecords: [
      { title: "Draft treatment plan", type: "Treatment plan", status: "Draft", priority: "High", dueInDays: 0 },
      { title: "Write owner instructions", type: "Owner instruction", status: "Active", priority: "Normal", dueInDays: 1 },
    ],
  },
  "Medical History": {
    recordLabel: "medical history item",
    typeLabel: "Record type",
    primaryAction: "Create medical history item",
    emptyTitle: "No medical history items yet",
    emptyDescription: "Track diagnoses, treatments, lab/test notes, medications, visits, and follow-up outcomes.",
    types: ["Diagnosis", "Treatment", "Test result", "Medication", "Visit", "Outcome"],
    statuses: ["Current", "Monitoring", "Resolved", "Archived"],
    quickRecords: [
      { title: "Add diagnosis note", type: "Diagnosis", status: "Current", priority: "High", dueInDays: 0 },
      { title: "Add test result summary", type: "Test result", status: "Monitoring", priority: "Normal", dueInDays: 1 },
    ],
  },
  "Shared Passports": {
    recordLabel: "shared record note",
    typeLabel: "Record type",
    primaryAction: "Create shared record note",
    emptyTitle: "No shared Passport notes yet",
    emptyDescription: "Track Passports shared for review, owner questions, temporary medical access, and follow-up requests.",
    types: ["Shared review", "Owner question", "Temporary access", "Follow-up request"],
    statuses: ["New", "Reviewing", "Waiting", "Complete"],
    quickRecords: [
      { title: "Review shared Passport", type: "Shared review", status: "New", priority: "Normal", dueInDays: 1 },
    ],
  },
  "Ambassador Animals": {
    recordLabel: "ambassador note",
    typeLabel: "Record type",
    primaryAction: "Create ambassador note",
    emptyTitle: "No ambassador notes yet",
    emptyDescription: "Track handling suitability, program readiness, public bios, rest periods, and display notes.",
    types: ["Handling note", "Program ready", "Public bio", "Rest period", "Display note"],
    statuses: ["Candidate", "Ready", "Resting", "Retired"],
    quickRecords: [
      { title: "Prepare public bio", type: "Public bio", status: "Ready", priority: "Normal", dueInDays: 5 },
      { title: "Add handling note", type: "Handling note", status: "Candidate", priority: "Normal", dueInDays: 0 },
    ],
  },
  Programs: {
    recordLabel: "program plan",
    typeLabel: "Program type",
    primaryAction: "Create program plan",
    emptyTitle: "No programs yet",
    emptyDescription: "Plan educational programs, animal assignments, handling notes, travel prep, and learning objectives.",
    types: ["School program", "Public event", "Zoo talk", "Classroom visit", "Learning objective"],
    statuses: ["Draft", "Scheduled", "Ready", "Complete"],
    quickRecords: [
      { title: "Plan education program", type: "School program", status: "Draft", priority: "Normal", dueInDays: 14 },
      { title: "Assign ambassador animal", type: "Learning objective", status: "Scheduled", priority: "Normal", dueInDays: 7 },
    ],
  },
  Exhibits: {
    recordLabel: "exhibit note",
    typeLabel: "Exhibit type",
    primaryAction: "Create exhibit note",
    emptyTitle: "No exhibit notes yet",
    emptyDescription: "Track exhibit setup, signage, enrichment, visitor notes, and animal rotation plans.",
    types: ["Exhibit setup", "Signage", "Enrichment", "Rotation", "Visitor note"],
    statuses: ["Planned", "Active", "Needs update", "Complete"],
    quickRecords: [
      { title: "Create exhibit setup note", type: "Exhibit setup", status: "Planned", priority: "Normal", dueInDays: 10 },
    ],
  },
  "Public Profiles": {
    recordLabel: "public profile task",
    typeLabel: "Profile type",
    primaryAction: "Create public profile task",
    emptyTitle: "No public profile tasks yet",
    emptyDescription: "Draft public animal bios, organization pages, available/adoption pages, and verified profile information.",
    types: ["Animal bio", "Organization page", "Available animal", "Adoption animal", "Verification"],
    statuses: ["Draft", "Review", "Published", "Archived"],
    quickRecords: [
      { title: "Draft public animal bio", type: "Animal bio", status: "Draft", priority: "Normal", dueInDays: 3 },
    ],
  },
  Visits: {
    recordLabel: "visit",
    typeLabel: "Visit type",
    primaryAction: "Create visit",
    emptyTitle: "No visits yet",
    emptyDescription: "Schedule care visits, feeding checks, medication stops, enclosure care, and owner updates.",
    types: ["Drop-in", "Feeding visit", "Medication visit", "Cleaning visit", "Overnight care"],
    statuses: ["Scheduled", "In progress", "Report due", "Complete"],
    quickRecords: [
      { title: "Schedule care visit", type: "Drop-in", status: "Scheduled", priority: "Normal", dueInDays: 1 },
      { title: "Add medication visit", type: "Medication visit", status: "Scheduled", priority: "High", dueInDays: 0 },
    ],
  },
  "Care Reports": {
    recordLabel: "care report",
    typeLabel: "Report type",
    primaryAction: "Create care report",
    emptyTitle: "No care reports yet",
    emptyDescription: "Create visit summaries, proof-of-care notes, photos to add later, feeding notes, and owner updates.",
    types: ["Visit summary", "Feeding report", "Medication report", "Cleaning report", "Owner update"],
    statuses: ["Draft", "Ready to send", "Sent", "Archived"],
    quickRecords: [
      { title: "Write visit summary", type: "Visit summary", status: "Draft", priority: "Normal", dueInDays: 0 },
    ],
  },
  "Client Animals": {
    recordLabel: "client animal note",
    typeLabel: "Record type",
    primaryAction: "Create client animal note",
    emptyTitle: "No client animal notes yet",
    emptyDescription: "Track temporary access, care needs, emergency contacts, feeding instructions, and medication instructions.",
    types: ["Care instruction", "Emergency contact", "Feeding note", "Medication note", "Temporary access"],
    statuses: ["New", "Ready", "Active", "Archived"],
    quickRecords: [
      { title: "Add client care instructions", type: "Care instruction", status: "New", priority: "Normal", dueInDays: 1 },
    ],
  },
  "Emergency Plans": {
    recordLabel: "emergency plan",
    typeLabel: "Plan type",
    primaryAction: "Create emergency plan",
    emptyTitle: "No emergency plans yet",
    emptyDescription: "Document emergency contacts, vet contacts, species warnings, medication warnings, and handling notes.",
    types: ["Emergency contact", "Vet contact", "Species warning", "Medication warning", "Handling warning"],
    statuses: ["Draft", "Ready", "Shared", "Archived"],
    quickRecords: [
      { title: "Create emergency contact card", type: "Emergency contact", status: "Ready", priority: "High", dueInDays: 0 },
    ],
  },
  Inventory: {
    recordLabel: "inventory item",
    typeLabel: "Inventory type",
    primaryAction: "Create inventory item",
    emptyTitle: "No inventory items yet",
    emptyDescription: "Track animals in stock, quarantine, sale readiness, supplier records, and customer transfer tasks.",
    types: ["Animal in stock", "Quarantine item", "Sale-ready", "Supply", "Customer transfer"],
    statuses: ["In stock", "Quarantine", "Sale ready", "Sold"],
    quickRecords: [
      { title: "Add animal to inventory", type: "Animal in stock", status: "In stock", priority: "Normal", dueInDays: 0 },
      { title: "Prepare customer transfer", type: "Customer transfer", status: "Sale ready", priority: "High", dueInDays: 1 },
    ],
  },
  "Supplier Records": {
    recordLabel: "supplier record",
    typeLabel: "Record type",
    primaryAction: "Create supplier record",
    emptyTitle: "No supplier records yet",
    emptyDescription: "Track suppliers, source notes, intake health, quarantine outcomes, and purchase history.",
    types: ["Supplier", "Purchase", "Source note", "Quarantine outcome", "Health note"],
    statuses: ["Active", "Needs review", "Approved", "Archived"],
    quickRecords: [
      { title: "Add supplier note", type: "Supplier", status: "Active", priority: "Normal", dueInDays: 0 },
    ],
  },
  "Customer Transfers": {
    recordLabel: "customer transfer task",
    typeLabel: "Transfer type",
    primaryAction: "Create customer transfer task",
    emptyTitle: "No customer transfer tasks yet",
    emptyDescription: "Prepare customer education, sale notes, public Passport links, QR cards, and transfer completion.",
    types: ["Customer education", "Sale note", "Passport link", "QR card", "Ownership transfer"],
    statuses: ["Draft", "Ready", "Pending", "Complete"],
    quickRecords: [
      { title: "Prepare customer Passport link", type: "Passport link", status: "Ready", priority: "High", dueInDays: 0 },
    ],
  },
};

function getDefinition(page) {
  return GENERIC_DEFINITIONS[page] || GENERIC_DEFINITIONS.default;
}

function getModuleSections(page, definition, setPage, startNewRecord) {
  const defaultSections = [
    {
      title: "Workflow board",
      description: "Create module-specific records, assign animals, set due dates, and move cards through status lanes.",
      icon: "clipboard",
      actionLabel: `New ${definition.recordLabel}`,
      onAction: startNewRecord,
    },
    {
      title: "Smart actions",
      description: "Use quick templates to create the next most common action for this workspace module.",
      icon: "sparkles",
      actionLabel: "Use quick template",
      onAction: () => startNewRecord(definition.quickRecords[0]),
    },
    {
      title: "Import-ready data",
      description: "Open the Data Center to upload CSV files, restore backups, or export collection reports.",
      icon: "database",
      actionLabel: "Open Data Center",
      onAction: () => setPage?.("Data Center"),
    },
  ];

  const specific = {
    Transfers: [
      { title: "Active invites", description: "Track buyer/adopter transfer links, pending accepts, cancelled invites, and transfer history.", icon: "share", actionLabel: "Track invite", onAction: () => startNewRecord({ title: "Track transfer invite", type: "Invite", status: "Pending", priority: "High", dueInDays: 0 }) },
      { title: "Transferred folder", description: "Keep a record of animals that left your account without losing their story.", icon: "history", actionLabel: "Archive transfer", onAction: () => startNewRecord({ title: "Archive transferred animal", type: "Transferred folder", status: "Archived", priority: "Normal", dueInDays: 0 }) },
      { title: "Recipient setup", description: "After accept, prompt the new owner to set reminders, feeding schedule, and care preferences.", icon: "check", actionLabel: "Setup checklist", onAction: () => startNewRecord({ title: "Recipient setup checklist", type: "Recipient setup", status: "Pending", priority: "Normal", dueInDays: 1 }) },
    ],
    "Expo Mode": [
      { title: "Printable QR cards", description: "Create cage labels, buyer scan cards, and public Passport sheets for shows or store displays.", icon: "scan", actionLabel: "Create QR task", onAction: () => startNewRecord({ title: "Prepare printable QR cards", type: "QR card", status: "Needs prep", priority: "Normal", dueInDays: 7 }) },
      { title: "Buyer preview", description: "Let buyers view species, morph, sex, weight, feeding, temperament, and transfer options.", icon: "share", actionLabel: "Buyer preview task", onAction: () => startNewRecord({ title: "Prepare buyer preview", type: "Buyer scan", status: "Ready", priority: "Normal", dueInDays: 3 }) },
      { title: "Batch tools", description: "Plan batch QR cards for an entire collection or available animal list.", icon: "database", actionLabel: "Open Data Center", onAction: () => setPage?.("Data Center") },
    ],
    "Care Planner": [
      { title: "Routine builder", description: "Create feeding, cleaning, weighing, medication, humidity, UVB, and vet follow-up routines.", icon: "calendar", actionLabel: "New routine", onAction: () => startNewRecord({ title: "New care routine", type: "Feeding", status: "Planned", priority: "Normal", dueInDays: 7 }) },
      { title: "Species-aware care", description: "Attach routines to specific animals so future species modules can auto-suggest care schedules.", icon: "book", actionLabel: "Attach animal", onAction: startNewRecord },
      { title: "Overdue alerts", description: "Prepare overdue feeding, medication, cleaning, and vet follow-up reminders.", icon: "alert", actionLabel: "Create alert", onAction: () => startNewRecord({ title: "Overdue care alert", type: "Vet follow-up", status: "Due soon", priority: "High", dueInDays: 1 }) },
    ],
    "Health Watch": [
      { title: "Health flags", description: "Watch, quarantine, sick, recovering, medication, and vet-needed statuses surface here.", icon: "heartPulse", actionLabel: "New health flag", onAction: () => startNewRecord({ title: "Health watch flag", type: "Watch", status: "Watching", priority: "High", dueInDays: 1 }) },
      { title: "Weight trends", description: "Create follow-up tasks for animals with weight loss, appetite issues, or recovery goals.", icon: "weight", actionLabel: "Weight note", onAction: () => startNewRecord({ title: "Weight trend note", type: "Weight concern", status: "Needs action", priority: "High", dueInDays: 3 }) },
      { title: "Vet timeline", description: "Connect symptoms, medications, appointments, invoices, and treatment notes into one medical story.", icon: "stethoscope", actionLabel: "Vet follow-up", onAction: () => startNewRecord({ title: "Vet follow-up note", type: "Vet follow-up", status: "Vet needed", priority: "High", dueInDays: 2 }) },
    ],
  };

  return specific[page] || defaultSections;
}

function buildRecordFromTemplate({ page, workspace, definition, form, selectedPet }) {
  const now = new Date().toISOString();
  return {
    id: createId("module-record"),
    workspaceId: workspace.id,
    workspaceLabel: workspace.shortLabel,
    page,
    title: form.title?.trim() || `Untitled ${definition.recordLabel}`,
    type: form.type || definition.types[0],
    status: form.status || definition.statuses[0],
    priority: form.priority || "Normal",
    dueDate: form.dueDate || "",
    petId: form.petId || "",
    petName: selectedPet ? petLabel(selectedPet) : "",
    notes: form.notes?.trim() || "",
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

function toCsvValue(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function recordsToCsv(records) {
  const headers = ["workspace", "module", "title", "type", "status", "priority", "dueDate", "animal", "notes", "createdAt", "updatedAt"];
  const rows = records.map((record) => [
    record.workspaceLabel,
    record.page,
    record.title,
    record.type,
    record.status,
    record.priority,
    record.dueDate,
    record.petName,
    record.notes,
    record.createdAt,
    record.updatedAt,
  ]);
  return [headers, ...rows].map((row) => row.map(toCsvValue).join(",")).join("\n");
}

export default function WorkspaceModulePage({ page, pets = [], setPage }) {
  const { workspace } = useWorkspace();
  const { showToast } = useToast();
  const module = getModuleForPage(page, workspace);
  const definition = getDefinition(page);
  const [allRecords, setAllRecords] = useState(() => readStoredRecords());
  const [formOpen, setFormOpen] = useState(false);
  const [filterPetId, setFilterPetId] = useState("all");
  const [form, setForm] = useState({
    title: "",
    type: definition.types[0],
    status: definition.statuses[0],
    priority: "Normal",
    dueDate: "",
    petId: "",
    notes: "",
  });

  useEffect(() => {
  const timer = window.setTimeout(() => {
    setForm((current) => ({
      ...current,
      type: definition.types.includes(current.type)
        ? current.type
        : definition.types[0],
      status: definition.statuses.includes(current.status)
        ? current.status
        : definition.statuses[0],
    }));
  }, 0);

  return () => window.clearTimeout(timer);
}, [definition, page]);

  const moduleRecords = useMemo(() => {
    return allRecords
      .filter((record) => record.workspaceId === workspace.id && record.page === page)
      .filter((record) => filterPetId === "all" || record.petId === filterPetId)
      .sort((a, b) => String(a.dueDate || "9999").localeCompare(String(b.dueDate || "9999")) || String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [allRecords, workspace.id, page, filterPetId]);

  const activeRecords = moduleRecords.filter((record) => !record.completed);
  const completedRecords = moduleRecords.filter((record) => record.completed);

  const pipelineCounts = useMemo(
    () => workspace.pipelines.map((pipeline) => ({ ...pipeline, count: countByPipeline(pets, pipeline) })),
    [pets, workspace]
  );

  function persist(nextRecords) {
    setAllRecords(nextRecords);
    writeStoredRecords(nextRecords);
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startNewRecord(template = {}) {
    setForm({
      title: template.title || "",
      type: template.type || definition.types[0],
      status: template.status || definition.statuses[0],
      priority: template.priority || "Normal",
      dueDate: typeof template.dueInDays === "number" ? addDays(template.dueInDays) : template.dueDate || todayIso(),
      petId: template.petId || "",
      notes: template.notes || "",
    });
    setFormOpen(true);
  }

  function createQuickRecord(template) {
    const pet = pets.find((animal) => String(animal.id) === String(template.petId || ""));
    const nextForm = {
      title: template.title || `New ${definition.recordLabel}`,
      type: template.type || definition.types[0],
      status: template.status || definition.statuses[0],
      priority: template.priority || "Normal",
      dueDate: typeof template.dueInDays === "number" ? addDays(template.dueInDays) : template.dueDate || todayIso(),
      petId: template.petId || "",
      notes: template.notes || "",
    };
    const record = buildRecordFromTemplate({ page, workspace, definition, form: nextForm, selectedPet: pet });
    persist([record, ...allRecords]);
    showToast({ variant: "success", title: "Record created", message: `${record.title} was added to ${page}.` });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const selectedPet = pets.find((pet) => String(pet.id) === String(form.petId));
    const record = buildRecordFromTemplate({ page, workspace, definition, form, selectedPet });
    persist([record, ...allRecords]);
    setFormOpen(false);
    setForm({ title: "", type: definition.types[0], status: definition.statuses[0], priority: "Normal", dueDate: "", petId: "", notes: "" });
    showToast({ variant: "success", title: "Record created", message: `${record.title} was added to ${page}.` });
  }

  function updateRecord(recordId, patch) {
    const now = new Date().toISOString();
    const nextRecords = allRecords.map((record) =>
      record.id === recordId ? { ...record, ...patch, updatedAt: now } : record
    );
    persist(nextRecords);
  }

  function deleteRecord(recordId) {
    persist(allRecords.filter((record) => record.id !== recordId));
    showToast({ variant: "success", title: "Record removed", message: "The workspace card was deleted." });
  }

  function exportModuleRecords() {
    if (moduleRecords.length === 0) {
      showToast({ variant: "error", title: "Nothing to export", message: "Create at least one record first." });
      return;
    }
    const slug = `${workspace.id}-${page.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.replace(/-$/g, "");
    downloadTextFile(`anypetos-${slug}-records.csv`, recordsToCsv(moduleRecords), "text/csv");
    showToast({ variant: "success", title: "Module exported", message: `${moduleRecords.length} records exported as CSV.` });
  }

  const sections = getModuleSections(page, definition, setPage, startNewRecord);

  return (
    <div className="feed workspaceModulePage">
      <PageHeader
        eyebrow={workspace.label}
        title={module.title}
        description={module.description}
        icon={<Icon name={module.icon} size={22} />}
      />

      <section className="moduleHero" style={{ "--workspace-card-accent": workspace.accent }}>
        <div>
          <p className="section-eyebrow">{workspace.shortLabel} module</p>
          <h1>{page}</h1>
          <p>{module.description}</p>
        </div>
        <div className="moduleHeroActions">
          <Button leftIcon={<Icon name="plus" size={16} />} onClick={() => startNewRecord()}>
            {definition.primaryAction}
          </Button>
          <Button variant="outline" leftIcon={<Icon name="paw" size={16} />} onClick={() => setPage("Add Pet")}>
            Add animal
          </Button>
          <Button variant="outline" leftIcon={<Icon name="database" size={16} />} onClick={() => setPage("Data Center")}>
            Open Data Center
          </Button>
        </div>
      </section>

      <div className="moduleSectionGrid moduleActionGrid">
        {sections.map((section) => (
          <Card key={section.title} className="moduleActionCard" interactive>
            <CardHeader
              icon={<Icon name={section.icon} size={18} />}
              title={section.title}
              description={section.description}
            />
            <Button fullWidth variant={section.title === "Workflow board" ? "primary" : "outline"} onClick={section.onAction}>
              {section.actionLabel}
            </Button>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          icon={<Icon name="sparkles" size={18} />}
          title="Quick actions"
          description="These create real module cards now. Later, these can write to dedicated cloud tables and attach to Passport timelines."
          action={<Button variant="ghost" onClick={exportModuleRecords}>Export module CSV</Button>}
        />
        <div className="moduleQuickActionGrid">
          {definition.quickRecords.map((template) => (
            <button key={`${template.title}-${template.type}`} className="moduleQuickAction" onClick={() => createQuickRecord(template)}>
              <Icon name="plus" size={16} />
              <span>{template.title}</span>
              <small>{template.type} â€¢ {template.status}</small>
            </button>
          ))}
        </div>
      </Card>

      {formOpen && (
        <Card>
          <CardHeader
            icon={<Icon name="clipboard" size={18} />}
            title={definition.primaryAction}
            description="Create a workflow record, assign it to an animal, and track it through this module."
            action={<Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>}
          />
          <form className="moduleRecordForm" onSubmit={handleSubmit}>
            <FormField label="Title">
              {(fieldProps) => (
                <Input {...fieldProps} value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder={`Example: ${definition.quickRecords[0]?.title || "New task"}`} />
              )}
            </FormField>
            <FormField label={definition.typeLabel}>
              {(fieldProps) => (
                <Select {...fieldProps} value={form.type} onChange={(event) => updateForm("type", event.target.value)}>
                  {definition.types.map((type) => <option key={type} value={type}>{type}</option>)}
                </Select>
              )}
            </FormField>
            <FormField label="Status">
              {(fieldProps) => (
                <Select {...fieldProps} value={form.status} onChange={(event) => updateForm("status", event.target.value)}>
                  {definition.statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </Select>
              )}
            </FormField>
            <FormField label="Priority">
              {(fieldProps) => (
                <Select {...fieldProps} value={form.priority} onChange={(event) => updateForm("priority", event.target.value)}>
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Urgent</option>
                </Select>
              )}
            </FormField>
            <FormField label="Due date" optional>
              {(fieldProps) => (
                <Input {...fieldProps} type="date" value={form.dueDate} onChange={(event) => updateForm("dueDate", event.target.value)} />
              )}
            </FormField>
            <FormField label="Animal" optional>
              {(fieldProps) => (
                <Select {...fieldProps} value={form.petId} onChange={(event) => updateForm("petId", event.target.value)}>
                  <option value="">Unassigned</option>
                  {pets.map((pet) => <option key={pet.id} value={pet.id}>{petLabel(pet)}</option>)}
                </Select>
              )}
            </FormField>
            <FormField label="Notes" optional>
              {(fieldProps) => (
                <Textarea {...fieldProps} value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} placeholder="Add instructions, context, symptoms, customer notes, or next steps." rows={4} />
              )}
            </FormField>
            <div className="moduleRecordFormActions">
              <Button type="submit" leftIcon={<Icon name="check" size={16} />}>Save record</Button>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader
          icon={<Icon name="activity" size={18} />}
          title={`${page} workflow board`}
          description="Move cards through module-specific lanes. These are working beta records saved in this browser until we add cloud workflow tables."
          action={
            <div className="moduleBoardFilters">
              <Select value={filterPetId} onChange={(event) => setFilterPetId(event.target.value)} aria-label="Filter by animal">
                <option value="all">All animals</option>
                {pets.map((pet) => <option key={pet.id} value={pet.id}>{petLabel(pet)}</option>)}
              </Select>
            </div>
          }
        />
        {moduleRecords.length > 0 ? (
          <div className="moduleBoard">
            {definition.statuses.map((status) => {
              const laneRecords = activeRecords.filter((record) => record.status === status);
              return (
                <div className="moduleBoardLane" key={status}>
                  <div className="moduleBoardLaneHeader">
                    <strong>{status}</strong>
                    <span>{laneRecords.length}</span>
                  </div>
                  <div className="moduleBoardLaneCards">
                    {laneRecords.length > 0 ? laneRecords.map((record) => (
                      <article className="moduleRecordCard" key={record.id}>
                        <div className="moduleRecordTopline">
                          <Badge>{record.type}</Badge>
                          <Badge>{record.priority}</Badge>
                        </div>
                        <h4>{record.title}</h4>
                        {record.petName && <p><strong>Animal:</strong> {record.petName}</p>}
                        {record.dueDate && <p><strong>Due:</strong> {record.dueDate}</p>}
                        {record.notes && <p>{record.notes}</p>}
                        <div className="moduleRecordActions">
                          <Select value={record.status} onChange={(event) => updateRecord(record.id, { status: event.target.value })} aria-label="Move record status">
                            {definition.statuses.map((nextStatus) => <option key={nextStatus} value={nextStatus}>{nextStatus}</option>)}
                          </Select>
                          <Button size="sm" variant="outline" onClick={() => updateRecord(record.id, { completed: true, status: definition.statuses.at(-1) || "Complete" })}>Complete</Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteRecord(record.id)}>Delete</Button>
                        </div>
                      </article>
                    )) : (
                      <div className="moduleLaneEmpty">No cards</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Icon name="clipboard" size={24} />}
            title={definition.emptyTitle}
            description={definition.emptyDescription}
            action={<Button onClick={() => startNewRecord()}>{definition.primaryAction}</Button>}
          />
        )}
      </Card>

      {completedRecords.length > 0 && (
        <Card>
          <CardHeader
            icon={<Icon name="check" size={18} />}
            title="Completed records"
            description="Completed cards stay here for review and export."
          />
          <div className="moduleCompletedList">
            {completedRecords.slice(0, 8).map((record) => (
              <div className="moduleCompletedItem" key={record.id}>
                <div>
                  <strong>{record.title}</strong>
                  <span>{record.type} â€¢ {record.petName || "Unassigned"}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => updateRecord(record.id, { completed: false, status: definition.statuses[0] })}>Reopen</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader
          icon={<Icon name="chart" size={18} />}
          title={`${workspace.shortLabel} pipeline snapshot`}
          description="Animal status lanes are still based on Passport statuses. Workflow cards above track module-specific work."
        />
        <div className="pipelineGrid">
          {pipelineCounts.map((pipeline) => (
            <div className="pipelineLane" key={pipeline.label}>
              <strong>{pipeline.count}</strong>
              <span>{pipeline.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {pets.length === 0 && (
        <Card padding="none">
          <EmptyState
            icon={<Icon name="paw" size={24} />}
            title="No animals yet"
            description="Add your first animal, or use the Data Center to import a collection from a spreadsheet or official export file."
            action={<Button onClick={() => setPage("Add Pet")}>Create first Passport</Button>}
          />
        </Card>
      )}
    </div>
  );
}
