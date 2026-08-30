import { useEffect, useMemo, useState } from "react";
import {
  ACCESS_EXPIRY_OPTIONS,
  ACCESS_LEVELS,
  ENCLOSURE_TYPES,
  EQUIPMENT_TYPES,
  FILE_TYPES,
  REMINDER_TYPES,
  formatInfrastructureDate,
  getAccessLevelLabel,
  getDueStatus,
} from "../data/careInfrastructure";
import { useCareInfrastructure } from "../hooks/useCareInfrastructure";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Icon,
  Input,
  PageHeader,
  Select,
  Textarea,
  useToast,
} from "../components/ui";
import { copyTextToClipboard } from "../utils/passportTransport";
import { downloadTransferReceipt, normalizeReceipt } from "../utils/transferReceipt";
import { useWorkspace } from "../context/WorkspaceContextCore";

const TAB_OPTIONS = [
  { id: "enclosures", label: "Enclosures", icon: "package" },
  { id: "equipment", label: "Equipment", icon: "settings" },
  { id: "reminders", label: "Smart Reminders", icon: "calendar" },
  { id: "files", label: "Documents", icon: "file" },
  { id: "access", label: "Access", icon: "users" },
];

function petName(pets, petId) {
  if (!petId) return "Unassigned";
  const pet = pets.find((item) => String(item.id) === String(petId) || String(item.cloudId) === String(petId));
  return pet?.name || "Unknown animal";
}

function enclosureName(enclosures, enclosureId) {
  if (!enclosureId) return "No enclosure";
  return enclosures.find((item) => String(item.id) === String(enclosureId))?.name || "Unknown enclosure";
}

function equipmentName(equipment, equipmentId) {
  if (!equipmentId) return "No equipment";
  return equipment.find((item) => String(item.id) === String(equipmentId))?.name || "Unknown equipment";
}

function statusLabel(value) {
  return String(value || "upcoming").replace(/_/g, " ");
}

function Field({ label, children }) {
  return (
    <label className="careInfraField">
      <span>{label}</span>
      {children}
    </label>
  );
}

function PetSelect({ pets, value, onChange, includeNone = true }) {
  return (
    <Select value={value || "none"} onChange={(event) => onChange(event.target.value)}>
      {includeNone ? (
        <option value="none">No animal assigned</option>
      ) : (
        <option value="none" disabled>Choose an animal</option>
      )}
      {pets.map((pet) => (
        <option key={pet.cloudId || pet.id} value={String(pet.cloudId || pet.id)}>
          {pet.name} {pet.species ? `â€¢ ${pet.species}` : ""}
        </option>
      ))}
    </Select>
  );
}

function EnclosureSelect({ enclosures, value, onChange, includeNone = true }) {
  return (
    <Select value={value || "none"} onChange={(event) => onChange(event.target.value)}>
      {includeNone && <option value="none">No enclosure assigned</option>}
      {enclosures.map((enclosure) => (
        <option key={enclosure.id} value={enclosure.id}>{enclosure.name}</option>
      ))}
    </Select>
  );
}

function EquipmentSelect({ equipment, value, onChange, includeNone = true }) {
  return (
    <Select value={value || "none"} onChange={(event) => onChange(event.target.value)}>
      {includeNone && <option value="none">No equipment assigned</option>}
      {equipment.map((item) => (
        <option key={item.id} value={item.id}>{item.name}</option>
      ))}
    </Select>
  );
}

export default function CareInfrastructure({ pets = [], initialTab = "enclosures" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { showToast } = useToast();
  const { workspace } = useWorkspace();
  const infrastructure = useCareInfrastructure(pets);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveTab(initialTab);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [initialTab]);

  const stats = useMemo(() => {
    const overdue = infrastructure.reminders.filter((reminder) => getDueStatus(reminder.due_at, reminder.status) === "overdue").length;
    const dueToday = infrastructure.reminders.filter((reminder) => getDueStatus(reminder.due_at, reminder.status) === "due_today").length;
    const activeAccess = infrastructure.permissions.filter((invite) => ["pending", "accepted"].includes(invite.status)).length;

    return {
      enclosures: infrastructure.enclosures.length,
      equipment: infrastructure.equipment.length,
      reminders: infrastructure.reminders.length,
      overdue,
      dueToday,
      files: infrastructure.files.length,
      access: activeAccess,
    };
  }, [infrastructure.enclosures.length, infrastructure.equipment.length, infrastructure.files.length, infrastructure.permissions, infrastructure.reminders]);

  const run = async ({ action, successTitle, successMessage, errorTitle = "Something went wrong" }) => {
    try {
      const result = await action();
      showToast({ title: successTitle, message: successMessage, variant: "success" });
      return result;
    } catch (error) {
      console.error(errorTitle, error);
      showToast({ title: errorTitle, message: error.message || "AnyPetOS could not save that record.", variant: "error" });
      return null;
    }
  };

  if (infrastructure.error) {
    return (
      <main className="pageContent careInfraPage">
        <PageHeader
          eyebrow="Care Infrastructure"
          title="Care tables need to be installed"
          description="Run ANYPETOS_CARE_INFRASTRUCTURE_V1.sql in Supabase, then return here. Your existing pets were not changed."
          icon={<Icon name="database" size={22} />}
        />
        <Card>
          <CardHeader icon={<Icon name="alert" size={18} />} title="Database setup required" />
          <p>{infrastructure.error.message || "The care infrastructure tables could not be loaded."}</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="pageContent careInfraPage">
      <PageHeader
        eyebrow={activeTab === "files" ? `${workspace.shortLabel} workspace` : "Care Infrastructure"}
        title={activeTab === "files" ? "Documents and agreements" : "Enclosures, reminders, files, and access"}
        description={activeTab === "files"
          ? "Keep reusable records organized, link them to animals, and attach selected documents to secure ownership transfers."
          : "Track the habitat, equipment, files, tasks, and temporary access that sit around every animal Passport."}
        icon={<Icon name={activeTab === "files" ? "file" : "database"} size={22} />}
        actions={<Button variant="outline" leftIcon={<Icon name="refresh" size={16} />} onClick={infrastructure.refresh}>Refresh</Button>}
      />

      {activeTab !== "files" && (
        <section className="careInfraStats">
          <div><strong>{stats.enclosures}</strong><span>Enclosures</span></div>
          <div><strong>{stats.equipment}</strong><span>Equipment</span></div>
          <div><strong>{stats.dueToday}</strong><span>Due today</span></div>
          <div className={stats.overdue > 0 ? "is-danger" : ""}><strong>{stats.overdue}</strong><span>Overdue</span></div>
          <div><strong>{stats.files}</strong><span>Documents</span></div>
          <div><strong>{stats.access}</strong><span>Access invites</span></div>
        </section>
      )}

      <section className="careInfraTabs" aria-label="Care infrastructure sections">
        {TAB_OPTIONS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={activeTab === tab.id ? "is-active" : ""}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon name={tab.icon} size={17} />
            <span>{tab.label}</span>
          </button>
        ))}
      </section>

      {infrastructure.loading ? (
        <Card><p>Loading care infrastructure...</p></Card>
      ) : (
        <>
          {activeTab === "enclosures" && (
            <EnclosuresPanel infrastructure={infrastructure} pets={pets} run={run} setActiveTab={setActiveTab} />
          )}
          {activeTab === "equipment" && (
            <EquipmentPanel infrastructure={infrastructure} pets={pets} run={run} />
          )}
          {activeTab === "reminders" && (
            <RemindersPanel infrastructure={infrastructure} pets={pets} run={run} />
          )}
          {activeTab === "files" && (
            <FilesPanel infrastructure={infrastructure} pets={pets} run={run} />
          )}
          {activeTab === "access" && (
            <AccessPanel infrastructure={infrastructure} pets={pets} run={run} />
          )}
        </>
      )}
    </main>
  );
}

function EnclosuresPanel({ infrastructure, pets, run, setActiveTab }) {
  const [form, setForm] = useState({ name: "", type: "Terrarium", size: "", location: "", pet_id: "none", warm_temp: "", cool_temp: "", humidity: "", substrate: "", cleaning_interval_days: "", last_cleaned_at: "", notes: "" });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const result = await run({
      action: () => infrastructure.createEnclosure(form),
      successTitle: "Enclosure created",
      successMessage: `${form.name || "New enclosure"} was saved.`,
    });
    if (result) setForm({ name: "", type: "Terrarium", size: "", location: "", pet_id: "none", warm_temp: "", cool_temp: "", humidity: "", substrate: "", cleaning_interval_days: "", last_cleaned_at: "", notes: "" });
  };

  return (
    <section className="careInfraLayout">
      <Card className="careInfraFormCard">
        <CardHeader icon={<Icon name="package" size={18} />} title="Create enclosure" />
        <form className="careInfraForm" onSubmit={submit}>
          <Field label="Name"><Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="40 gal quarantine tank" /></Field>
          <Field label="Type"><Select value={form.type} onChange={(event) => update("type", event.target.value)}>{ENCLOSURE_TYPES.map((type) => <option key={type}>{type}</option>)}</Select></Field>
          <Field label="Assigned animal"><PetSelect pets={pets} value={form.pet_id} onChange={(value) => update("pet_id", value)} /></Field>
          <Field label="Size"><Input value={form.size} onChange={(event) => update("size", event.target.value)} placeholder="36x18x18, 4x2x2, 25 gal..." /></Field>
          <Field label="Location"><Input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Reptile room, rack row A..." /></Field>
          <Field label="Warm side"><Input value={form.warm_temp} onChange={(event) => update("warm_temp", event.target.value)} placeholder="88â€“90Â°F" /></Field>
          <Field label="Cool side"><Input value={form.cool_temp} onChange={(event) => update("cool_temp", event.target.value)} placeholder="75â€“78Â°F" /></Field>
          <Field label="Humidity"><Input value={form.humidity} onChange={(event) => update("humidity", event.target.value)} placeholder="55â€“70%" /></Field>
          <Field label="Substrate"><Input value={form.substrate} onChange={(event) => update("substrate", event.target.value)} placeholder="Coco husk, paper towels..." /></Field>
          <Field label="Clean every X days"><Input type="number" min="0" value={form.cleaning_interval_days} onChange={(event) => update("cleaning_interval_days", event.target.value)} /></Field>
          <Field label="Last cleaned"><Input type="date" value={form.last_cleaned_at} onChange={(event) => update("last_cleaned_at", event.target.value)} /></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Heat source, ventilation, quarantine notes..." /></Field>
          <Button type="submit" leftIcon={<Icon name="plus" size={16} />}>Save enclosure</Button>
        </form>
      </Card>

      <div className="careInfraList">
        <Card className="careInfraSectionIntro">
          <CardHeader icon={<Icon name="home" size={18} />} title="Enclosure overview" />
          <p>Assign animals to habitats, record heat/humidity, and connect cleaning routines to smart reminders.</p>
          <Button variant="outline" onClick={() => setActiveTab("equipment")}>Open equipment</Button>
        </Card>

        {infrastructure.enclosures.length === 0 ? (
          <Card><p>No enclosures yet. Add tanks, tubs, racks, aviaries, aquariums, and quarantine setups here.</p></Card>
        ) : infrastructure.enclosures.map((enclosure) => (
          <Card key={enclosure.id} className="careInfraRecordCard">
            <div className="careInfraRecordHeader">
              <div><span>{enclosure.type}</span><h3>{enclosure.name}</h3></div>
              <Button variant="ghost" size="sm" leftIcon={<Icon name="trash" size={15} />} onClick={() => run({ action: () => infrastructure.deleteEnclosure(enclosure.id), successTitle: "Enclosure deleted", successMessage: `${enclosure.name} was removed.` })}>Delete</Button>
            </div>
            <div className="careInfraMiniGrid">
              <div><span>Animal</span><strong>{petName(pets, enclosure.pet_id)}</strong></div>
              <div><span>Size</span><strong>{enclosure.size || "Not set"}</strong></div>
              <div><span>Warm</span><strong>{enclosure.warm_temp || "Not set"}</strong></div>
              <div><span>Cool</span><strong>{enclosure.cool_temp || "Not set"}</strong></div>
              <div><span>Humidity</span><strong>{enclosure.humidity || "Not set"}</strong></div>
              <div><span>Clean every</span><strong>{enclosure.cleaning_interval_days ? `${enclosure.cleaning_interval_days} days` : "Not set"}</strong></div>
            </div>
            {enclosure.notes && <p className="careInfraRecordNote">{enclosure.notes}</p>}
          </Card>
        ))}
      </div>
    </section>
  );
}

function EquipmentPanel({ infrastructure, pets, run }) {
  const [form, setForm] = useState({ name: "", type: "Thermostat", enclosure_id: "none", pet_id: "none", brand: "", model: "", installed_at: "", next_due_at: "", replace_interval_days: "", status: "Active", notes: "" });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const result = await run({
      action: () => infrastructure.createEquipment(form),
      successTitle: "Equipment saved",
      successMessage: `${form.name || "Equipment"} was saved.`,
    });
    if (result) setForm({ name: "", type: "Thermostat", enclosure_id: "none", pet_id: "none", brand: "", model: "", installed_at: "", next_due_at: "", replace_interval_days: "", status: "Active", notes: "" });
  };

  return (
    <section className="careInfraLayout">
      <Card className="careInfraFormCard">
        <CardHeader icon={<Icon name="settings" size={18} />} title="Add equipment" />
        <form className="careInfraForm" onSubmit={submit}>
          <Field label="Name"><Input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Arcadia UVB bulb, Herpstat 2..." /></Field>
          <Field label="Type"><Select value={form.type} onChange={(event) => update("type", event.target.value)}>{EQUIPMENT_TYPES.map((type) => <option key={type}>{type}</option>)}</Select></Field>
          <Field label="Enclosure"><EnclosureSelect enclosures={infrastructure.enclosures} value={form.enclosure_id} onChange={(value) => update("enclosure_id", value)} /></Field>
          <Field label="Animal"><PetSelect pets={pets} value={form.pet_id} onChange={(value) => update("pet_id", value)} /></Field>
          <Field label="Brand"><Input value={form.brand} onChange={(event) => update("brand", event.target.value)} /></Field>
          <Field label="Model"><Input value={form.model} onChange={(event) => update("model", event.target.value)} /></Field>
          <Field label="Installed"><Input type="date" value={form.installed_at} onChange={(event) => update("installed_at", event.target.value)} /></Field>
          <Field label="Next due"><Input type="date" value={form.next_due_at} onChange={(event) => update("next_due_at", event.target.value)} /></Field>
          <Field label="Replace every X days"><Input type="number" min="0" value={form.replace_interval_days} onChange={(event) => update("replace_interval_days", event.target.value)} /></Field>
          <Field label="Status"><Select value={form.status} onChange={(event) => update("status", event.target.value)}><option>Active</option><option>Needs check</option><option>Replace soon</option><option>Retired</option></Select></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Probe placement, bulb strength, filter notes..." /></Field>
          <Button type="submit" leftIcon={<Icon name="plus" size={16} />}>Save equipment</Button>
        </form>
      </Card>

      <div className="careInfraList">
        {infrastructure.equipment.length === 0 ? <Card><p>No equipment yet. Track UVB bulbs, thermostats, filters, pumps, timers, and heat sources here.</p></Card> : infrastructure.equipment.map((item) => (
          <Card key={item.id} className="careInfraRecordCard">
            <div className="careInfraRecordHeader">
              <div><span>{item.type}</span><h3>{item.name}</h3></div>
              <Button variant="ghost" size="sm" leftIcon={<Icon name="trash" size={15} />} onClick={() => run({ action: () => infrastructure.deleteEquipment(item.id), successTitle: "Equipment deleted", successMessage: `${item.name} was removed.` })}>Delete</Button>
            </div>
            <div className="careInfraMiniGrid">
              <div><span>Enclosure</span><strong>{enclosureName(infrastructure.enclosures, item.enclosure_id)}</strong></div>
              <div><span>Animal</span><strong>{petName(pets, item.pet_id)}</strong></div>
              <div><span>Brand</span><strong>{item.brand || "Not set"}</strong></div>
              <div><span>Status</span><strong>{item.status || "Active"}</strong></div>
              <div><span>Installed</span><strong>{formatInfrastructureDate(item.installed_at)}</strong></div>
              <div><span>Next due</span><strong>{formatInfrastructureDate(item.next_due_at)}</strong></div>
            </div>
            {item.notes && <p className="careInfraRecordNote">{item.notes}</p>}
          </Card>
        ))}
      </div>
    </section>
  );
}

function RemindersPanel({ infrastructure, pets, run }) {
  const [form, setForm] = useState({ title: "", type: "Feeding", pet_id: "none", enclosure_id: "none", equipment_id: "none", due_at: "", repeat_interval_days: "", notes: "" });
  const [filter, setFilter] = useState("all");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const filtered = infrastructure.reminders.filter((reminder) => filter === "all" || getDueStatus(reminder.due_at, reminder.status) === filter);

  const submit = async (event) => {
    event.preventDefault();
    const result = await run({ action: () => infrastructure.createReminder(form), successTitle: "Reminder created", successMessage: `${form.title || "Care reminder"} was saved.` });
    if (result) setForm({ title: "", type: "Feeding", pet_id: "none", enclosure_id: "none", equipment_id: "none", due_at: "", repeat_interval_days: "", notes: "" });
  };

  return (
    <section className="careInfraLayout">
      <Card className="careInfraFormCard">
        <CardHeader icon={<Icon name="calendar" size={18} />} title="Create smart reminder" />
        <form className="careInfraForm" onSubmit={submit}>
          <Field label="Title"><Input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Replace UVB bulb, feed Cora, clean tank..." /></Field>
          <Field label="Type"><Select value={form.type} onChange={(event) => update("type", event.target.value)}>{REMINDER_TYPES.map((type) => <option key={type}>{type}</option>)}</Select></Field>
          <Field label="Animal"><PetSelect pets={pets} value={form.pet_id} onChange={(value) => update("pet_id", value)} /></Field>
          <Field label="Enclosure"><EnclosureSelect enclosures={infrastructure.enclosures} value={form.enclosure_id} onChange={(value) => update("enclosure_id", value)} /></Field>
          <Field label="Equipment"><EquipmentSelect equipment={infrastructure.equipment} value={form.equipment_id} onChange={(value) => update("equipment_id", value)} /></Field>
          <Field label="Due date/time"><Input type="datetime-local" value={form.due_at} onChange={(event) => update("due_at", event.target.value)} /></Field>
          <Field label="Repeat every X days"><Input type="number" min="0" value={form.repeat_interval_days} onChange={(event) => update("repeat_interval_days", event.target.value)} placeholder="7, 14, 30, 180..." /></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} /></Field>
          <Button type="submit" leftIcon={<Icon name="plus" size={16} />}>Save reminder</Button>
        </form>
      </Card>

      <div className="careInfraList">
        <div className="careInfraFilterRow">
          {["all", "overdue", "due_today", "upcoming", "completed", "skipped"].map((status) => (
            <button key={status} type="button" className={filter === status ? "is-active" : ""} onClick={() => setFilter(status)}>{statusLabel(status)}</button>
          ))}
        </div>

        {filtered.length === 0 ? <Card><p>No reminders in this lane yet.</p></Card> : filtered.map((reminder) => {
          const dueStatus = getDueStatus(reminder.due_at, reminder.status);
          return (
            <Card key={reminder.id} className={`careInfraRecordCard due-${dueStatus}`}>
              <div className="careInfraRecordHeader">
                <div><span>{reminder.type} â€¢ {statusLabel(dueStatus)}</span><h3>{reminder.title}</h3></div>
                <div className="careInfraButtonCluster">
                  <Button variant="outline" size="sm" onClick={() => run({ action: () => infrastructure.completeReminder(reminder), successTitle: "Reminder completed", successMessage: `${reminder.title} was updated.` })}>Complete</Button>
                  <Button variant="ghost" size="sm" onClick={() => run({ action: () => infrastructure.updateReminder(reminder.id, { status: "skipped" }), successTitle: "Reminder skipped", successMessage: `${reminder.title} was skipped.` })}>Skip</Button>
                  <Button variant="ghost" size="sm" onClick={() => run({ action: () => infrastructure.deleteReminder(reminder.id), successTitle: "Reminder deleted", successMessage: `${reminder.title} was removed.` })}>Delete</Button>
                </div>
              </div>
              <div className="careInfraMiniGrid">
                <div><span>Due</span><strong>{reminder.due_at ? new Date(reminder.due_at).toLocaleString() : "Not set"}</strong></div>
                <div><span>Repeats</span><strong>{reminder.repeat_interval_days ? `Every ${reminder.repeat_interval_days} days` : "One time"}</strong></div>
                <div><span>Animal</span><strong>{petName(pets, reminder.pet_id)}</strong></div>
                <div><span>Enclosure</span><strong>{enclosureName(infrastructure.enclosures, reminder.enclosure_id)}</strong></div>
                <div><span>Equipment</span><strong>{equipmentName(infrastructure.equipment, reminder.equipment_id)}</strong></div>
              </div>
              {reminder.notes && <p className="careInfraRecordNote">{reminder.notes}</p>}
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function FilesPanel({ infrastructure, pets, run }) {
  const { workspace } = useWorkspace();
  const preferredType = workspace.id === "rescue"
    ? "Adoption agreement"
    : workspace.id === "breeder"
      ? "Sales agreement"
      : "Care sheet";

  const emptyForm = {
    file: null,
    pet_id: "none",
    enclosure_id: "none",
    file_type: preferredType,
    is_public_passport: false,
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [petFilter, setPetFilter] = useState("all");
  const [transferOnly, setTransferOnly] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        file_type: current.file_type || preferredType,
      }));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [preferredType]);

  const isAgreement = (file) => /agreement|contract|transfer/i.test(file.file_type || "");
  const formatSize = (bytes) => {
    const value = Number(bytes || 0);
    if (!value) return "Size unavailable";
    if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  };

  const visibleFiles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return infrastructure.files.filter((file) => {
      const matchesSearch = !query || [file.file_name, file.file_type, file.notes]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesType = typeFilter === "all" || file.file_type === typeFilter;
      const matchesPet = petFilter === "all"
        || (petFilter === "reusable" ? !file.pet_id : String(file.pet_id) === String(petFilter));
      const matchesTransfer = !transferOnly || Boolean(file.is_public_passport);
      return matchesSearch && matchesType && matchesPet && matchesTransfer;
    });
  }, [infrastructure.files, petFilter, search, transferOnly, typeFilter]);

  const libraryStats = useMemo(() => ({
    total: infrastructure.files.length,
    reusable: infrastructure.files.filter((file) => !file.pet_id).length,
    agreements: infrastructure.files.filter(isAgreement).length,
    transferReady: infrastructure.files.filter((file) => file.is_public_passport).length,
  }), [infrastructure.files]);

  const signedReceipts = useMemo(
    () => (infrastructure.signatureReceipts || []).map(normalizeReceipt),
    [infrastructure.signatureReceipts]
  );

  const submit = async (event) => {
    event.preventDefault();
    const result = await run({
      action: () => infrastructure.uploadPetFile(form),
      successTitle: "Document saved",
      successMessage: `${form.file?.name || "File"} is now in your library.`,
    });
    if (result) setForm({ ...emptyForm, file_type: preferredType });
  };

  const toggleTransferReady = async (file) => {
    const nextValue = !file.is_public_passport;
    await run({
      action: () => infrastructure.updateFile(file.id, { is_public_passport: nextValue }),
      successTitle: nextValue ? "Ready for transfers" : "Kept private",
      successMessage: nextValue
        ? `${file.file_name} can now be selected during a transfer.`
        : `${file.file_name} will stay private in the library.`,
    });
  };

  const workspaceCopy = workspace.id === "rescue"
    ? "Keep adoption agreements, surrender forms, medical records, and reusable rescue documents organized in one secure library."
    : workspace.id === "breeder"
      ? "Keep sales agreements, receipts, health records, care sheets, and reusable breeder documents organized in one secure library."
      : "Store records once, link them to the right animal, and choose which documents may be included in a future share or ownership transfer.";

  return (
    <section className="documentLibraryShell">
      <div className="documentLibraryIntro">
        <div>
          <p className="section-eyebrow">Workspace records</p>
          <h2>Document Library</h2>
          <p>{workspaceCopy}</p>
        </div>
        <Badge variant="info" icon={<Icon name="shield" size={14} />}>
          Private by default
        </Badge>
      </div>

      <div className="documentLibraryStats" aria-label="Document library summary">
        <div><strong>{libraryStats.total}</strong><span>Total documents</span></div>
        <div><strong>{libraryStats.reusable}</strong><span>Reusable files</span></div>
        <div><strong>{libraryStats.agreements}</strong><span>Agreements</span></div>
        <div><strong>{libraryStats.transferReady}</strong><span>Transfer-ready</span></div>
      </div>

      {signedReceipts.length > 0 && (
        <section className="signedReceiptLibrary" aria-labelledby="signed-receipts-heading">
          <div className="signedReceiptLibrary__header">
            <div>
              <p className="section-eyebrow">Permanent transfer records</p>
              <h3 id="signed-receipts-heading">Electronic transfer receipts</h3>
              <p>Both the sender and recipient can keep and download these document-review and electronic-consent records.</p>
            </div>
            <Badge variant="success" dot>{signedReceipts.length} completed</Badge>
          </div>
          <div className="signedReceiptGrid">
            {signedReceipts.map((receipt) => (
              <Card key={receipt.id || `${receipt.transferToken}-${receipt.signedAt}`} className="signedReceiptCard" padding="sm">
                <div className="signedReceiptCard__top">
                  <span className="signedReceiptCard__icon"><Icon name="check" size={18} /></span>
                  <div>
                    <strong>{receipt.petName} ownership transfer</strong>
                    <small>Accepted {formatInfrastructureDate(receipt.signedAt, "Recently")}</small>
                  </div>
                </div>
                <div className="signedReceiptCard__meta">
                  <div><span>Signed by</span><strong>{receipt.signerName}</strong></div>
                  <div><span>Documents</span><strong>{receipt.documents.length}</strong></div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon name="file" size={15} />}
                  onClick={() => downloadTransferReceipt(receipt)}
                >
                  Download receipt
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {infrastructure.filesError && (
        <Card className="documentLibraryLoadWarning" padding="sm">
          <div>
            <strong>Your saved documents could not be loaded.</strong>
            <p>{infrastructure.filesError.message || "AnyPetOS could not reach the document library."}</p>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Icon name="refresh" size={15} />} onClick={infrastructure.refresh}>
            Try again
          </Button>
        </Card>
      )}

      <div className="documentLibraryLayout">
        <Card className="documentUploadCard">
          <CardHeader
            icon={<Icon name="upload" size={18} />}
            title="Add to library"
            description="Upload once, then reuse the document wherever it belongs."
          />
          <form className="documentUploadForm" onSubmit={submit}>
            <Field label="Choose file">
              <Input
                type="file"
                required
                onChange={(event) => update("file", event.target.files?.[0] || null)}
              />
            </Field>
            <Field label="Document type">
              <Select value={form.file_type} onChange={(event) => update("file_type", event.target.value)}>
                {FILE_TYPES.map((type) => <option key={type}>{type}</option>)}
              </Select>
            </Field>
            <Field label="Animal association">
              <PetSelect pets={pets} value={form.pet_id} onChange={(value) => update("pet_id", value)} />
            </Field>
            <p className="documentFormHint">
              Leave the animal unassigned for reusable agreements and organization-wide forms.
            </p>
            <label className="documentTransferToggle">
              <input
                type="checkbox"
                checked={form.is_public_passport}
                onChange={(event) => update("is_public_passport", event.target.checked)}
              />
              <span>
                <strong>Available during shares and transfers</strong>
                <small>You still choose whether to attach it each time.</small>
              </span>
            </label>
            <Field label="Notes">
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Version, expiration, signing instructions, or anything your team should know."
              />
            </Field>
            <Button type="submit" fullWidth leftIcon={<Icon name="upload" size={16} />}>
              Save document
            </Button>
          </form>
        </Card>

        <div className="documentLibraryMain">
          <Card className="documentToolbarCard" padding="sm">
            <div className="documentToolbar">
              <div className="documentSearchBox">
                <Icon name="search" size={17} />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search documents"
                  aria-label="Search documents"
                />
              </div>
              <Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="Filter by document type">
                <option value="all">All document types</option>
                {FILE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
              <Select value={petFilter} onChange={(event) => setPetFilter(event.target.value)} aria-label="Filter by animal">
                <option value="all">All animals</option>
                <option value="reusable">Reusable / unassigned</option>
                {pets.map((pet) => (
                  <option key={pet.cloudId || pet.id} value={String(pet.cloudId || pet.id)}>{pet.name}</option>
                ))}
              </Select>
              <button
                type="button"
                className={["documentFilterToggle", transferOnly ? "is-active" : ""].filter(Boolean).join(" ")}
                aria-pressed={transferOnly}
                onClick={() => setTransferOnly((current) => !current)}
              >
                <Icon name="share" size={16} />
                Transfer-ready
              </button>
            </div>
          </Card>

          {visibleFiles.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Icon name="file" size={28} />}
                title={infrastructure.files.length === 0 ? "Your document library is empty" : "No documents match these filters"}
                description={infrastructure.files.length === 0
                  ? "Upload a care sheet, vet record, sales agreement, adoption agreement, or reusable form to begin."
                  : "Try a broader search or clear one of the filters."}
              />
            </Card>
          ) : (
            <div className="documentCardGrid">
              {visibleFiles.map((file) => (
                <Card key={file.id} className="documentCard" padding="sm">
                  <div className="documentCardTop">
                    <span className="documentTypeIcon" aria-hidden="true">
                      <Icon name={isAgreement(file) ? "clipboard" : "file"} size={20} />
                    </span>
                    <div className="documentCardTitle">
                      <div className="documentBadgeRow">
                        <Badge variant={isAgreement(file) ? "info" : "neutral"}>{file.file_type || "Other"}</Badge>
                        {file.is_public_passport && <Badge variant="success" dot>Transfer-ready</Badge>}
                      </div>
                      <h3 title={file.file_name}>{file.file_name}</h3>
                    </div>
                  </div>

                  <div className="documentMetaList">
                    <div><span>Linked to</span><strong>{file.pet_id ? petName(pets, file.pet_id) : "Reusable library file"}</strong></div>
                    <div><span>Size</span><strong>{formatSize(file.size_bytes)}</strong></div>
                    <div><span>Added</span><strong>{formatInfrastructureDate(file.created_at, "Recently")}</strong></div>
                  </div>

                  {file.notes && <p className="documentCardNote">{file.notes}</p>}

                  <div className="documentCardActions">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Icon name="file" size={15} />}
                      onClick={() => run({
                        action: () => infrastructure.openFile(file),
                        successTitle: "Opening document",
                        successMessage: "A temporary secure link was created.",
                      })}
                    >
                      Open
                    </Button>
                    <Button
                      variant={file.is_public_passport ? "secondary" : "ghost"}
                      size="sm"
                      leftIcon={<Icon name={file.is_public_passport ? "shield" : "share"} size={15} />}
                      onClick={() => toggleTransferReady(file)}
                    >
                      {file.is_public_passport ? "Keep private" : "Allow transfer"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Icon name="trash" size={15} />}
                      onClick={() => run({
                        action: () => infrastructure.deleteFile(file),
                        successTitle: "Document deleted",
                        successMessage: `${file.file_name} was removed.`,
                      })}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AccessPanel({ infrastructure, pets, run }) {
  const getFirstPetId = () => {
    const firstPet = pets[0];
    return firstPet ? String(firstPet.cloudId || firstPet.id) : "none";
  };

  const [form, setForm] = useState({
    pet_id: getFirstPetId(),
    recipient_email: "",
    access_level: "view_only",
    expires_in_days: "7",
    notes: "",
  });
  const [lastInviteUrl, setLastInviteUrl] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (form.pet_id !== "none" || pets.length === 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setForm((current) => {
        if (current.pet_id !== "none") {
          return current;
        }

        return {
          ...current,
          pet_id: String(pets[0].cloudId || pets[0].id),
        };
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [form.pet_id, pets]);

  const submit = async (event) => {
    event.preventDefault();

    const result = await run({
      action: () => infrastructure.createAccessInvite(form),
      successTitle: "Access invite created",
      successMessage: "The temporary access link is ready.",
    });

    if (result?.inviteUrl) {
      setLastInviteUrl(result.inviteUrl);

      try {
        await copyTextToClipboard(result.inviteUrl);
      } catch (clipboardError) {
        console.warn("Invite created, but the browser could not copy it automatically:", clipboardError);
      }
    }

    if (result) {
      setForm({
        pet_id: getFirstPetId(),
        recipient_email: "",
        access_level: "view_only",
        expires_in_days: "7",
        notes: "",
      });
    }
  };

  return (
    <section className="careInfraLayout">
      <Card className="careInfraFormCard">
        <CardHeader icon={<Icon name="users" size={18} />} title="Create access invite" />
        <form className="careInfraForm" onSubmit={submit}>
          <Field label="Animal">
            <PetSelect
              pets={pets}
              value={form.pet_id}
              onChange={(value) => update("pet_id", value)}
              includeNone={false}
            />
          </Field>
          {pets.length === 0 && (
            <p className="careInfraFormHint">
              Add or cloud-sync an animal before creating temporary access.
            </p>
          )}
          <Field label="Recipient email"><Input type="email" value={form.recipient_email} onChange={(event) => update("recipient_email", event.target.value)} placeholder="sitter@example.com" /></Field>
          <Field label="Access level"><Select value={form.access_level} onChange={(event) => update("access_level", event.target.value)}>{ACCESS_LEVELS.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}</Select></Field>
          <Field label="Expires"><Select value={form.expires_in_days} onChange={(event) => update("expires_in_days", event.target.value)}>{ACCESS_EXPIRY_OPTIONS.map((option) => <option key={option.label} value={option.days}>{option.label}</option>)}</Select></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Care instructions, visit dates, clinic reason..." /></Field>
          <Button
            type="submit"
            disabled={pets.length === 0 || form.pet_id === "none"}
            leftIcon={<Icon name="share" size={16} />}
          >
            Create and copy invite
          </Button>
        </form>

        {lastInviteUrl && (
          <div className="careInfraInviteBox">
            <span>Last invite link</span>

            <input
              className="careInfraInviteUrl"
              type="text"
              value={lastInviteUrl}
              readOnly
              aria-label="Temporary access invite link"
              onFocus={(event) => event.currentTarget.select()}
              onClick={(event) => event.currentTarget.select()}
            />

            <div className="careInfraInviteActions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyTextToClipboard(lastInviteUrl)}
              >
                Copy again
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(lastInviteUrl, "_blank", "noopener,noreferrer")}
              >
                Open invite
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="careInfraList">
        <Card className="careInfraSectionIntro">
          <CardHeader icon={<Icon name="shield" size={18} />} title="Permission levels" />
          <div className="careInfraAccessLevels">
            {ACCESS_LEVELS.map((level) => (
              <div key={level.id}><strong>{level.label}</strong><span>{level.description}</span></div>
            ))}
          </div>
        </Card>

        {infrastructure.permissions.length === 0 ? <Card><p>No access invites yet. Create temporary sitter, foster, vet, or view-only links here.</p></Card> : infrastructure.permissions.map((invite) => (
          <Card key={invite.id} className="careInfraRecordCard">
            <div className="careInfraRecordHeader">
              <div><span>{getAccessLevelLabel(invite.access_level)} â€¢ {invite.status}</span><h3>{petName(pets, invite.pet_id)}</h3></div>
              {invite.status !== "revoked" && <Button variant="ghost" size="sm" onClick={() => run({ action: () => infrastructure.revokeAccessInvite(invite.id), successTitle: "Access revoked", successMessage: "This invite no longer works." })}>Revoke</Button>}
            </div>
            <div className="careInfraMiniGrid">
              <div><span>Email</span><strong>{invite.recipient_email || "Not specified"}</strong></div>
              <div><span>Expires</span><strong>{formatInfrastructureDate(invite.expires_at, "No expiration")}</strong></div>
              <div><span>Accepted</span><strong>{formatInfrastructureDate(invite.accepted_at, "Not accepted")}</strong></div>
              <div><span>Created</span><strong>{formatInfrastructureDate(invite.created_at)}</strong></div>
            </div>
            {invite.notes && <p className="careInfraRecordNote">{invite.notes}</p>}
          </Card>
        ))}
      </div>
    </section>
  );
}
