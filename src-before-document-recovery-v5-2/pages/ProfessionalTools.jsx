import { useMemo, useState } from "react";
import { Badge, Button, Card, CardHeader, Icon, Input, PageHeader, Select, Textarea } from "../components/ui";
import { getWorkspaceList } from "../constants/workspaces";

function useLocalRecords(key) {
  const [records, setRecords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  });

  const save = (next) => {
    setRecords(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const add = (record) => save([{ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString(), ...record }, ...records]);
  const remove = (id) => save(records.filter((record) => record.id !== id));
  return { records, add, remove };
}

const MODULES = {
  owner: {
    title: "Owner Care Planner",
    description: "Build daily care plans, health watch notes, and feeding schedule ideas.",
    fields: ["Care task", "Animal", "Schedule", "Notes"],
    examples: ["Feeding schedule", "Humidity check", "Vet follow-up"],
  },
  breeder: {
    title: "Breeder Pipeline",
    description: "Track pairing ideas, hatchlings, holdbacks, sales prep, and transfer readiness.",
    fields: ["Pairing / clutch", "Animal", "Stage", "Notes"],
    examples: ["Planned pairing", "Egg watch", "Buyer ready"],
  },
  rescue: {
    title: "Rescue Intake & Rehab",
    description: "Track intake, quarantine, rehab milestones, adoption status, and medical watch items.",
    fields: ["Case", "Animal", "Stage", "Notes"],
    examples: ["New intake", "Quarantine", "Adoption ready"],
  },
  vet: {
    title: "Veterinary Patient Notes",
    description: "Prepare patient snapshots, treatment notes, weight trends, and owner-submitted history.",
    fields: ["Patient note", "Animal", "Treatment stage", "Notes"],
    examples: ["Exam", "Medication plan", "Recheck"],
  },
  education: {
    title: "Education / Zoo Programs",
    description: "Organize ambassador animals, public programs, exhibits, and staff care notes.",
    fields: ["Program / exhibit", "Animal", "Audience", "Notes"],
    examples: ["School visit", "Ambassador animal", "Exhibit rotation"],
  },
  sitter: {
    title: "Pet Sitting Visits",
    description: "Build client visit notes, care reports, feeding confirmations, and emergency instructions.",
    fields: ["Visit", "Animal", "Client / schedule", "Notes"],
    examples: ["Morning visit", "Medication proof", "Care report"],
  },
};

export default function ProfessionalTools({ pets }) {
  const [workspaceId, setWorkspaceId] = useState("owner");
  const [form, setForm] = useState({ title: "", animal: "", stage: "", notes: "" });
  const module = MODULES[workspaceId] || MODULES.owner;
  const { records, add, remove } = useLocalRecords(`petpassport-module-${workspaceId}`);

  const statusSummary = useMemo(() => {
    const active = records.filter((record) => !/done|complete|closed/i.test(record.stage)).length;
    return { active, total: records.length };
  }, [records]);

  const handleAdd = () => {
    if (!form.title.trim()) return;
    add(form);
    setForm({ title: "", animal: "", stage: "", notes: "" });
  };

  return (
    <div className="page-shell roadmap-feature-page">
      <PageHeader
        eyebrow="Professional modules"
        title="Workspace Tools"
        description="Beta-safe module foundations for owners, breeders, rescues, vets, educators, zoos, and pet sitters."
        icon={<Icon name="shield" size={22} />}
        actions={<Badge variant="primary">Phase 5 foundation</Badge>}
      />

      <div className="workspace-switcher">
        {getWorkspaceList().map((workspace) => (
          <button key={workspace.id} type="button" className={workspaceId === workspace.id ? "is-active" : ""} onClick={() => setWorkspaceId(workspace.id)}>
            <Icon name={workspace.icon} size={17} />
            <span>{workspace.shortLabel}</span>
          </button>
        ))}
      </div>

      <div className="feature-grid feature-grid--two">
        <Card>
          <CardHeader icon={<Icon name="clipboard" size={18} />} title={module.title} description={module.description} action={<Badge variant="success">{statusSummary.active} active</Badge>} />
          <div className="formGrid twoCol">
            <label>{module.fields[0]}<Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={module.examples[0]} /></label>
            <label>{module.fields[1]}<Select value={form.animal} onChange={(event) => setForm({ ...form, animal: event.target.value })}><option value="">General / no animal</option>{pets.map((pet) => <option key={pet.id} value={pet.name}>{pet.name} • {pet.species}</option>)}</Select></label>
            <label>{module.fields[2]}<Input value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })} placeholder={module.examples[1]} /></label>
            <label className="full">{module.fields[3]}<Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Details, next steps, buyer/client notes, treatment plan, or care instructions" /></label>
          </div>
          <Button leftIcon={<Icon name="plus" size={16} />} onClick={handleAdd}>Add module record</Button>
        </Card>

        <Card>
          <CardHeader icon={<Icon name="activity" size={18} />} title="Module roadmap coverage" description="What this foundation prepares for next." />
          <div className="module-chip-grid">
            {Object.entries(MODULES).map(([id, item]) => (
              <article key={id} className="module-chip">
                <strong>{item.title}</strong>
                <span>{item.examples.join(" • ")}</span>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<Icon name="history" size={18} />} title="Saved module records" description="These are stored locally for beta planning. Later, these become cloud professional modules." action={<Badge variant="info">{statusSummary.total} total</Badge>} />
        {records.length === 0 ? (
          <p className="helperText">No records saved for this workspace yet.</p>
        ) : (
          <div className="record-list">
            {records.map((record) => (
              <article key={record.id} className="record-card">
                <div><strong>{record.title}</strong><p>{record.animal || "General"} {record.stage ? `• ${record.stage}` : ""}</p>{record.notes && <small>{record.notes}</small>}</div>
                <Button variant="ghost" size="sm" onClick={() => remove(record.id)}>Remove</Button>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
