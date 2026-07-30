export const DEFAULT_WORKSPACE_ID = "owner";

export const WORKSPACE_OPTIONS = [
  {
    id: "owner",
    label: "Owner Workspace",
    shortLabel: "Owner",
    icon: "home",
    accent: "#34d399",
    subtitle: "Daily care for beloved animals",
    description: "A calm, personal dashboard for feeding, reminders, health notes, and lifelong pet records.",
    bestFor: "Pet parents, reptile keepers, hobby keepers, and families.",
    focusTitle: "Today's Care",
    terminology: {
      collection: "My Animals",
      record: "Passport",
      transfer: "Share or transfer",
    },
    navigationGroups: [
      {
        label: "Owner care",
        items: [
          { page: "Dashboard", label: "Today", icon: "dashboard" },
          { page: "Pets", label: "My Animals", icon: "paw" },
          { page: "Add Pet", label: "Add Animal", icon: "plus" },
          { page: "Favorites", label: "Favorites", icon: "star" },
        ],
      },
      {
        label: "Records",
        items: [
          { page: "Care Planner", label: "Care Planner", icon: "clipboard" },
          { page: "Health Watch", label: "Health Watch", icon: "heartPulse" },
          { page: "Timeline", label: "Timeline", icon: "history" },
          { page: "Medications", label: "Medications", icon: "pill" },
          { page: "Calendar", label: "Calendar", icon: "calendar" },
        ],
      },
      {
        label: "Tools",
        items: [
          { page: "Sitter Access", label: "Sitter Access", icon: "users" },
          { page: "Care Guides", label: "Care Guides", icon: "book" },
          { page: "Enclosures", label: "Enclosures", icon: "package" },
          { page: "Equipment", label: "Equipment", icon: "settings" },
          { page: "Smart Reminders", label: "Smart Reminders", icon: "calendar" },
          { page: "Files", label: "Document Library", icon: "file" },
          { page: "Access Center", label: "Access Center", icon: "users" },
          { page: "Data Center", label: "Data Center", icon: "database" },
          { page: "AI Assistant", label: "AI Assistant", icon: "bot" },
          { page: "Community", label: "Community", icon: "users" },
          { page: "Workspaces", label: "Workspaces", icon: "briefcase" },
          { page: "Settings", label: "Settings", icon: "settings" },
        ],
      },
    ],
    dashboardCards: [
      { title: "Care due today", description: "Feeding, medication, cleaning, and care reminders.", icon: "clipboard", metric: "tasks" },
      { title: "Health watch", description: "Animals marked sick, quarantine, or monitoring.", icon: "heartPulse", metric: "attention" },
      { title: "Recent stories", description: "The newest entries in every animal Passport.", icon: "history", metric: "logs" },
    ],
    quickActions: [
      { label: "Log feeding", page: "Pets", icon: "utensils" },
      { label: "Add medication", page: "Medications", icon: "pill" },
      { label: "Open care planner", page: "Care Planner", icon: "clipboard" },
      { label: "Share a Passport", page: "Pets", icon: "share" },
    ],
    modules: [
      { title: "Care Planner", page: "Care Planner", icon: "clipboard", description: "Build feeding, cleaning, weighing, medication, and vet reminder routines." },
      { title: "Health Watch", page: "Health Watch", icon: "heartPulse", description: "Surface animals that need monitoring, follow-up, or urgent care notes." },
      { title: "Sitter Access", page: "Sitter Access", icon: "users", description: "Prepare temporary care instructions and future permission-based access." },
    ],
    pipelines: [
      { label: "Healthy", statuses: ["Healthy"] },
      { label: "Watch", statuses: ["Watch", "Monitoring"] },
      { label: "Vet needed", statuses: ["Sick", "Vet Needed"] },
      { label: "Quarantine", statuses: ["Quarantine"] },
    ],
  },
  {
    id: "breeder",
    label: "Breeder Workspace",
    shortLabel: "Breeder",
    icon: "dna",
    accent: "#a78bfa",
    subtitle: "Pairings, hatchlings, sales, and transfers",
    description: "A professional command center for managing collections, breeding plans, buyer-ready Passports, and expo workflows.",
    bestFor: "Breeders, vendors, expo sellers, and keepers with large collections.",
    focusTitle: "Breeder Command Center",
    terminology: { collection: "Collection", record: "Animal Passport", transfer: "Buyer transfer" },
    navigationGroups: [
      {
        label: "Breeder HQ",
        items: [
          { page: "Dashboard", label: "Command Center", icon: "dashboard" },
          { page: "Pets", label: "Collection", icon: "paw" },
          { page: "Add Pet", label: "Add Animal", icon: "plus" },
          { page: "Favorites", label: "Holdbacks", icon: "star" },
        ],
      },
      {
        label: "Production",
        items: [
          { page: "Pairings", label: "Pairings", icon: "dna" },
          { page: "Hatchlings", label: "Hatchlings", icon: "sparkles" },
          { page: "Sales Pipeline", label: "Sales Pipeline", icon: "briefcase" },
          { page: "Expo Mode", label: "Expo Mode", icon: "scan" },
          { page: "Transfers", label: "Transfers", icon: "share" },
        ],
      },
      {
        label: "Records & tools",
        items: [
          { page: "Timeline", label: "Timeline", icon: "history" },
          { page: "Medications", label: "Medications", icon: "pill" },
          { page: "Calendar", label: "Calendar", icon: "calendar" },
          { page: "Enclosures", label: "Enclosures", icon: "package" },
          { page: "Equipment", label: "Equipment", icon: "settings" },
          { page: "Smart Reminders", label: "Smart Reminders", icon: "calendar" },
          { page: "Files", label: "Document Library", icon: "file" },
          { page: "Access Center", label: "Access Center", icon: "users" },
          { page: "Data Center", label: "Data Center", icon: "database" },
          { page: "AI Assistant", label: "AI Assistant", icon: "bot" },
          { page: "Community", label: "Community", icon: "users" },
          { page: "Workspaces", label: "Workspaces", icon: "briefcase" },
          { page: "Settings", label: "Settings", icon: "settings" },
        ],
      },
    ],
    dashboardCards: [
      { title: "Transfers pending", description: "Buyer-ready Passports, active invites, and recently moved animals.", icon: "share", metric: "transfers" },
      { title: "Sales pipeline", description: "Available, holdback, reserved, sold, and transferred animals.", icon: "briefcase", metric: "pipeline" },
      { title: "Breeding watch", description: "Pairings, ovulations, clutches, eggs, hatchlings, and holdbacks.", icon: "dna", metric: "modules" },
    ],
    quickActions: [
      { label: "Create pairing", page: "Pairings", icon: "dna" },
      { label: "Import collection", page: "Data Center", icon: "upload" },
      { label: "Open sales pipeline", page: "Sales Pipeline", icon: "briefcase" },
      { label: "Expo QR tools", page: "Expo Mode", icon: "scan" },
    ],
    modules: [
      { title: "Pairings", page: "Pairings", icon: "dna", description: "Plan breeders, record locks, track projected genetics, and connect offspring to parents." },
      { title: "Hatchlings", page: "Hatchlings", icon: "sparkles", description: "Track eggs, hatch dates, first sheds, first meals, IDs, and holdbacks." },
      { title: "Sales Pipeline", page: "Sales Pipeline", icon: "briefcase", description: "Move animals through available, on hold, reserved, paid, sold, shipped, and transferred." },
      { title: "Expo Mode", page: "Expo Mode", icon: "scan", description: "Prepare QR cage cards, buyer preview links, and transfer-ready animal sheets." },
    ],
    pipelines: [
      { label: "Holdback", statuses: ["Holdback"] },
      { label: "Available", statuses: ["Available", "For Sale"] },
      { label: "Reserved", statuses: ["Reserved", "On Hold"] },
      { label: "Sold", statuses: ["Sold", "Transferred"] },
    ],
  },
  {
    id: "rescue",
    label: "Rescue Workspace",
    shortLabel: "Rescue",
    icon: "shield",
    accent: "#f59e0b",
    subtitle: "Intake, quarantine, rehab, adoption",
    description: "A triage-focused workflow for animals coming in, stabilizing, healing, and finding homes.",
    bestFor: "Reptile rescues, foster networks, shelters, and independent rehabilitators.",
    focusTitle: "Rescue Operations",
    terminology: { collection: "Cases", record: "Rescue Passport", transfer: "Adoption transfer" },
    navigationGroups: [
      {
        label: "Rescue HQ",
        items: [
          { page: "Dashboard", label: "Operations", icon: "dashboard" },
          { page: "Pets", label: "Animals", icon: "paw" },
          { page: "Add Pet", label: "New Intake", icon: "plus" },
          { page: "Favorites", label: "Priority Cases", icon: "star" },
        ],
      },
      {
        label: "Case flow",
        items: [
          { page: "Intake", label: "Intake", icon: "clipboard" },
          { page: "Quarantine", label: "Quarantine", icon: "shield" },
          { page: "Rehab Plans", label: "Rehab Plans", icon: "heartPulse" },
          { page: "Adoptions", label: "Adoptions", icon: "home" },
          { page: "Expo Mode", label: "Adoption Events", icon: "scan" },
          { page: "Foster Care", label: "Foster Care", icon: "users" },
          { page: "Transfers", label: "Transfers", icon: "share" },
        ],
      },
      {
        label: "Records & tools",
        items: [
          { page: "Medical Watch", label: "Medical Watch", icon: "stethoscope" },
          { page: "Timeline", label: "Timeline", icon: "history" },
          { page: "Medications", label: "Medications", icon: "pill" },
          { page: "Calendar", label: "Calendar", icon: "calendar" },
          { page: "Enclosures", label: "Enclosures", icon: "package" },
          { page: "Equipment", label: "Equipment", icon: "settings" },
          { page: "Smart Reminders", label: "Smart Reminders", icon: "calendar" },
          { page: "Files", label: "Document Library", icon: "file" },
          { page: "Access Center", label: "Access Center", icon: "users" },
          { page: "Data Center", label: "Data Center", icon: "database" },
          { page: "Community", label: "Community", icon: "users" },
          { page: "Workspaces", label: "Workspaces", icon: "briefcase" },
          { page: "Settings", label: "Settings", icon: "settings" },
        ],
      },
    ],
    dashboardCards: [
      { title: "New intakes", description: "Animals needing intake forms, baseline photos, quarantine, and first checks.", icon: "clipboard", metric: "intake" },
      { title: "Medical watch", description: "Animals marked sick, monitoring, or on active medication.", icon: "heartPulse", metric: "attention" },
      { title: "Adoption ready", description: "Animals cleared for public profiles and adoption transfers.", icon: "home", metric: "adoption" },
    ],
    quickActions: [
      { label: "Start intake", page: "Intake", icon: "clipboard" },
      { label: "Open quarantine", page: "Quarantine", icon: "shield" },
      { label: "Create adoption transfer", page: "Transfers", icon: "share" },
      { label: "Import rescue sheet", page: "Data Center", icon: "upload" },
    ],
    modules: [
      { title: "Intake", page: "Intake", icon: "clipboard", description: "Capture source, surrender notes, condition, photos, first weight, and urgency." },
      { title: "Quarantine", page: "Quarantine", icon: "shield", description: "Track start dates, symptoms, biosecurity notes, treatments, and clearance goals." },
      { title: "Rehab Plans", page: "Rehab Plans", icon: "heartPulse", description: "Create recovery plans, milestones, follow-ups, and adoption readiness notes." },
      { title: "Foster Care", page: "Foster Care", icon: "users", description: "Assign animals to fosters with temporary care access and proof-of-care notes." },
    ],
    pipelines: [
      { label: "Intake", statuses: ["Intake", "New"] },
      { label: "Quarantine", statuses: ["Quarantine"] },
      { label: "Rehab", statuses: ["Rehab", "Recovering", "Sick", "Monitoring"] },
      { label: "Adoption ready", statuses: ["Adoption Ready", "Available"] },
    ],
  },
  {
    id: "vet",
    label: "Veterinary Workspace",
    shortLabel: "Veterinary",
    icon: "stethoscope",
    accent: "#60a5fa",
    subtitle: "Patients, treatments, and shared records",
    description: "A clinical record review workspace for care history, medication schedules, weights, and owner-shared Passports.",
    bestFor: "Veterinary professionals, techs, clinics, and care teams reviewing animal history.",
    focusTitle: "Patient Overview",
    terminology: { collection: "Patients", record: "Patient Passport", transfer: "Record access" },
    navigationGroups: [
      {
        label: "Clinic view",
        items: [
          { page: "Dashboard", label: "Overview", icon: "dashboard" },
          { page: "Pets", label: "Patients", icon: "paw" },
          { page: "Add Pet", label: "Add Patient", icon: "plus" },
          { page: "Shared Passports", label: "Shared Passports", icon: "share" },
        ],
      },
      {
        label: "Medical",
        items: [
          { page: "Appointments", label: "Appointments", icon: "calendar" },
          { page: "Treatment Notes", label: "Treatment Notes", icon: "stethoscope" },
          { page: "Medical History", label: "Medical History", icon: "file" },
          { page: "Medications", label: "Medications", icon: "pill" },
          { page: "Timeline", label: "Timeline", icon: "history" },
        ],
      },
      {
        label: "Tools",
        items: [
          { page: "Calendar", label: "Calendar", icon: "calendar" },
          { page: "Enclosures", label: "Enclosures", icon: "package" },
          { page: "Equipment", label: "Equipment", icon: "settings" },
          { page: "Smart Reminders", label: "Smart Reminders", icon: "calendar" },
          { page: "Files", label: "Document Library", icon: "file" },
          { page: "Access Center", label: "Access Center", icon: "users" },
          { page: "Data Center", label: "Data Center", icon: "database" },
          { page: "AI Assistant", label: "AI Assistant", icon: "bot" },
          { page: "Community", label: "Community", icon: "users" },
          { page: "Workspaces", label: "Workspaces", icon: "briefcase" },
          { page: "Settings", label: "Settings", icon: "settings" },
        ],
      },
    ],
    dashboardCards: [
      { title: "Patients needing review", description: "Animals with active medication, weight changes, or flagged health notes.", icon: "stethoscope", metric: "attention" },
      { title: "Medication history", description: "Dose schedules, last given times, and treatment timelines.", icon: "pill", metric: "meds" },
      { title: "Shared records", description: "Passports owners have shared for review or transfer context.", icon: "share", metric: "transfers" },
    ],
    quickActions: [
      { label: "Open patients", page: "Pets", icon: "paw" },
      { label: "Treatment notes", page: "Treatment Notes", icon: "stethoscope" },
      { label: "Medication panel", page: "Medications", icon: "pill" },
      { label: "Shared Passports", page: "Shared Passports", icon: "share" },
    ],
    modules: [
      { title: "Treatment Notes", page: "Treatment Notes", icon: "stethoscope", description: "Document exam notes, diagnosis, treatment plans, and follow-up recommendations." },
      { title: "Medical History", page: "Medical History", icon: "file", description: "Review timeline, medications, weights, sheds, feeding, and owner-reported care history." },
      { title: "Appointments", page: "Appointments", icon: "calendar", description: "Plan follow-up visits, reminders, and owner instructions." },
    ],
    pipelines: [
      { label: "Stable", statuses: ["Healthy", "Stable"] },
      { label: "Monitoring", statuses: ["Watch", "Monitoring"] },
      { label: "Treatment", statuses: ["Sick", "On Medication", "Recovering"] },
      { label: "Follow-up", statuses: ["Vet Needed", "Follow Up"] },
    ],
  },
  {
    id: "education",
    label: "Education / Zoo Workspace",
    shortLabel: "Education/Zoo",
    icon: "graduationCap",
    accent: "#2dd4bf",
    subtitle: "Ambassador animals, programs, and exhibits",
    description: "A presentation-friendly workspace for ambassador animals, public bios, handling notes, programs, and exhibit care.",
    bestFor: "Educators, zoos, nature centers, school programs, and outreach keepers.",
    focusTitle: "Ambassador Program",
    terminology: { collection: "Ambassador Animals", record: "Ambassador Passport", transfer: "Public profile" },
    navigationGroups: [
      {
        label: "Education HQ",
        items: [
          { page: "Dashboard", label: "Program Home", icon: "dashboard" },
          { page: "Pets", label: "Ambassadors", icon: "paw" },
          { page: "Add Pet", label: "Add Ambassador", icon: "plus" },
          { page: "Favorites", label: "Featured", icon: "star" },
        ],
      },
      {
        label: "Programs",
        items: [
          { page: "Programs", label: "Programs", icon: "graduationCap" },
          { page: "Expo Mode", label: "Event Mode", icon: "scan" },
          { page: "Exhibits", label: "Exhibits", icon: "map" },
          { page: "Public Profiles", label: "Public Profiles", icon: "share" },
          { page: "Care Guides", label: "Care Guides", icon: "book" },
        ],
      },
      {
        label: "Records & tools",
        items: [
          { page: "Timeline", label: "Timeline", icon: "history" },
          { page: "Medications", label: "Medications", icon: "pill" },
          { page: "Calendar", label: "Calendar", icon: "calendar" },
          { page: "Enclosures", label: "Enclosures", icon: "package" },
          { page: "Equipment", label: "Equipment", icon: "settings" },
          { page: "Smart Reminders", label: "Smart Reminders", icon: "calendar" },
          { page: "Files", label: "Document Library", icon: "file" },
          { page: "Access Center", label: "Access Center", icon: "users" },
          { page: "Data Center", label: "Data Center", icon: "database" },
          { page: "Community", label: "Community", icon: "users" },
          { page: "Workspaces", label: "Workspaces", icon: "briefcase" },
          { page: "Settings", label: "Settings", icon: "settings" },
        ],
      },
    ],
    dashboardCards: [
      { title: "Ambassador readiness", description: "Animals cleared for handling, programs, and public education.", icon: "graduationCap", metric: "ready" },
      { title: "Program notes", description: "Public bios, handling guidelines, and exhibit facts.", icon: "book", metric: "modules" },
      { title: "Care checks", description: "Feeding, cleaning, medication, and exhibit reminders.", icon: "clipboard", metric: "tasks" },
    ],
    quickActions: [
      { label: "Plan program", page: "Programs", icon: "graduationCap" },
      { label: "Open public profiles", page: "Public Profiles", icon: "share" },
      { label: "View exhibits", page: "Exhibits", icon: "map" },
      { label: "Care guides", page: "Care Guides", icon: "book" },
    ],
    modules: [
      { title: "Programs", page: "Programs", icon: "graduationCap", description: "Plan outreach events, classroom visits, and animal ambassador lineups." },
      { title: "Exhibits", page: "Exhibits", icon: "map", description: "Track exhibit placement, habitat notes, signage, and enrichment details." },
      { title: "Public Profiles", page: "Public Profiles", icon: "share", description: "Prepare polished public-facing bios and QR cards for ambassador animals." },
    ],
    pipelines: [
      { label: "Ambassador", statuses: ["Ambassador", "Healthy"] },
      { label: "Resting", statuses: ["Resting", "Off Display"] },
      { label: "Training", statuses: ["Training", "Monitoring"] },
      { label: "Medical hold", statuses: ["Sick", "Quarantine", "Vet Needed"] },
    ],
  },
  {
    id: "sitter",
    label: "Pet Sitter Workspace",
    shortLabel: "Pet Sitter",
    icon: "users",
    accent: "#fb7185",
    subtitle: "Visits, instructions, and care reports",
    description: "A task-first workspace for temporary access, visit checklists, emergency notes, and proof-of-care reports.",
    bestFor: "Pet sitters, family helpers, fosters, and trusted temporary caretakers.",
    focusTitle: "Today's Visits",
    terminology: { collection: "Client Animals", record: "Care Card", transfer: "Temporary access" },
    navigationGroups: [
      {
        label: "Visit workspace",
        items: [
          { page: "Dashboard", label: "Today", icon: "dashboard" },
          { page: "Pets", label: "Client Animals", icon: "paw" },
          { page: "Visits", label: "Visits", icon: "calendar" },
          { page: "Care Reports", label: "Care Reports", icon: "clipboard" },
        ],
      },
      {
        label: "Client care",
        items: [
          { page: "Clients", label: "Clients", icon: "users" },
          { page: "Emergency Cards", label: "Emergency Cards", icon: "alert" },
          { page: "Shared Passports", label: "Shared Passports", icon: "share" },
          { page: "Medications", label: "Medications", icon: "pill" },
          { page: "Calendar", label: "Calendar", icon: "calendar" },
        ],
      },
      {
        label: "Tools",
        items: [
          { page: "Timeline", label: "Timeline", icon: "history" },
          { page: "Care Guides", label: "Care Guides", icon: "book" },
          { page: "Community", label: "Community", icon: "users" },
          { page: "Workspaces", label: "Workspaces", icon: "briefcase" },
          { page: "Settings", label: "Settings", icon: "settings" },
        ],
      },
    ],
    dashboardCards: [
      { title: "Visits today", description: "Animals with care tasks, medications, or check-ins due.", icon: "calendar", metric: "tasks" },
      { title: "Emergency notes", description: "Important warnings, contacts, and handling instructions.", icon: "alert", metric: "attention" },
      { title: "Care reports", description: "Future proof-of-care summaries for owners and clients.", icon: "clipboard", metric: "modules" },
    ],
    quickActions: [
      { label: "Open visits", page: "Visits", icon: "calendar" },
      { label: "Care reports", page: "Care Reports", icon: "clipboard" },
      { label: "Emergency cards", page: "Emergency Cards", icon: "alert" },
      { label: "Shared Passports", page: "Shared Passports", icon: "share" },
    ],
    modules: [
      { title: "Visits", page: "Visits", icon: "calendar", description: "Schedule check-ins, feedings, cleaning tasks, and medication visits." },
      { title: "Care Reports", page: "Care Reports", icon: "clipboard", description: "Create owner-friendly summaries of what was completed during each visit." },
      { title: "Emergency Cards", page: "Emergency Cards", icon: "alert", description: "Keep vet contacts, handling cautions, temperature requirements, and emergency notes visible." },
    ],
    pipelines: [
      { label: "Due today", statuses: ["Due Today"] },
      { label: "Needs meds", statuses: ["On Medication", "Sick"] },
      { label: "Watch closely", statuses: ["Monitoring", "Watch"] },
      { label: "Completed", statuses: ["Completed"] },
    ],
  },
  {
    id: "retail",
    label: "Retail / Pet Shop Workspace",
    shortLabel: "Retail",
    icon: "store",
    accent: "#fbbf24",
    subtitle: "Inventory, quarantine, sale-ready animals",
    description: "A professional shop workflow for animal inventory, supplier notes, quarantine, customer handoffs, and transfer-ready Passports.",
    bestFor: "Pet shops, reptile shops, expo booths, and small exotic animal retailers.",
    focusTitle: "Store Inventory",
    terminology: { collection: "Inventory", record: "Customer Passport", transfer: "Customer transfer" },
    navigationGroups: [
      {
        label: "Store HQ",
        items: [
          { page: "Dashboard", label: "Store Dashboard", icon: "dashboard" },
          { page: "Pets", label: "Inventory", icon: "paw" },
          { page: "Add Pet", label: "Add Stock", icon: "plus" },
          { page: "Favorites", label: "Featured", icon: "star" },
        ],
      },
      {
        label: "Retail flow",
        items: [
          { page: "Inventory", label: "Inventory", icon: "package" },
          { page: "Suppliers", label: "Suppliers", icon: "truck" },
          { page: "Quarantine", label: "Quarantine", icon: "shield" },
          { page: "Sale Ready", label: "Sale Ready", icon: "briefcase" },
          { page: "Customer Transfers", label: "Customer Transfers", icon: "share" },
          { page: "Expo Mode", label: "Expo Mode", icon: "scan" },
        ],
      },
      {
        label: "Records & tools",
        items: [
          { page: "Timeline", label: "Timeline", icon: "history" },
          { page: "Medications", label: "Medications", icon: "pill" },
          { page: "Calendar", label: "Calendar", icon: "calendar" },
          { page: "Enclosures", label: "Enclosures", icon: "package" },
          { page: "Equipment", label: "Equipment", icon: "settings" },
          { page: "Smart Reminders", label: "Smart Reminders", icon: "calendar" },
          { page: "Files", label: "Document Library", icon: "file" },
          { page: "Access Center", label: "Access Center", icon: "users" },
          { page: "Data Center", label: "Data Center", icon: "database" },
          { page: "Community", label: "Community", icon: "users" },
          { page: "Workspaces", label: "Workspaces", icon: "briefcase" },
          { page: "Settings", label: "Settings", icon: "settings" },
        ],
      },
    ],
    dashboardCards: [
      { title: "Inventory status", description: "Animals in stock, quarantine, sale-ready, held, or transferred.", icon: "package", metric: "pipeline" },
      { title: "Quarantine checks", description: "New arrivals, health flags, supplier notes, and clearance windows.", icon: "shield", metric: "attention" },
      { title: "Customer transfers", description: "Buyer Passport handoffs and QR share links for store customers.", icon: "share", metric: "transfers" },
    ],
    quickActions: [
      { label: "Add stock", page: "Add Pet", icon: "plus" },
      { label: "Open inventory", page: "Inventory", icon: "package" },
      { label: "Customer transfers", page: "Customer Transfers", icon: "share" },
      { label: "Expo mode", page: "Expo Mode", icon: "scan" },
    ],
    modules: [
      { title: "Inventory", page: "Inventory", icon: "package", description: "Manage animal stock, statuses, prices later, and customer-ready records." },
      { title: "Suppliers", page: "Suppliers", icon: "truck", description: "Track source, arrival dates, supplier notes, and quarantine outcomes." },
      { title: "Customer Transfers", page: "Customer Transfers", icon: "share", description: "Send animals home with clean digital Passports and care setup prompts." },
    ],
    pipelines: [
      { label: "New stock", statuses: ["New", "Intake"] },
      { label: "Quarantine", statuses: ["Quarantine"] },
      { label: "Sale ready", statuses: ["Sale Ready", "Available", "For Sale"] },
      { label: "Sold", statuses: ["Sold", "Transferred"] },
    ],
  },
];

export const WORKSPACE_MAP = Object.fromEntries(WORKSPACE_OPTIONS.map((workspace) => [workspace.id, workspace]));

export function normalizeWorkspaceId(value) {
  const normalized = String(value || "").toLowerCase().replace(/[_\s-]+/g, "");

  const aliases = {
    owner: "owner",
    petowner: "owner",
    keeper: "owner",
    breeder: "breeder",
    rescue: "rescue",
    rescuer: "rescue",
    vet: "vet",
    veterinary: "vet",
    veterinarian: "vet",
    education: "education",
    zoo: "education",
    educationzoo: "education",
    educator: "education",
    sitter: "sitter",
    petsitter: "sitter",
    caretaker: "sitter",
    retail: "retail",
    petshop: "retail",
    shop: "retail",
    store: "retail",
  };

  return aliases[normalized] || DEFAULT_WORKSPACE_ID;
}

export function getWorkspaceConfig(value) {
  return WORKSPACE_MAP[normalizeWorkspaceId(value)] || WORKSPACE_MAP[DEFAULT_WORKSPACE_ID];
}

export const WORKSPACE_PAGE_SET = new Set(
  WORKSPACE_OPTIONS.flatMap((workspace) => workspace.navigationGroups.flatMap((group) => group.items.map((item) => item.page)))
    .filter((page) => !["Dashboard", "Pets", "Favorites", "Add Pet", "Timeline", "Medications", "Calendar", "Care Guides", "AI Assistant", "Settings"].includes(page))
);

export function getWorkspaceForPage(page) {
  return WORKSPACE_OPTIONS.find((workspace) => workspace.modules.some((module) => module.page === page));
}

export function getModuleForPage(page, workspace) {
  const currentWorkspace = workspace || getWorkspaceForPage(page);
  return currentWorkspace?.modules.find((module) => module.page === page) || {
    title: page,
    page,
    icon: "briefcase",
    description: "A workspace module prepared for this professional workflow.",
  };
}
