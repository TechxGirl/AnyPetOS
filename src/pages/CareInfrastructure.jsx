import { useMemo, useState } from "react";
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
  Button,
  Card,
  CardHeader,
  Icon,
  Input,
  PageHeader,
  Select,
  Textarea,
  useToast,
} from "../components/ui";
import { copyTextToClipboard } from "../utils/passportTransport";

const TAB_OPTIONS = [
  { id: "enclosures", label: "Enclosures", icon: "package" },
  { id: "equipment", label: "Equipment", icon: "settings" },
  { id: "reminders", label: "Smart Reminders", icon: "calendar" },
  { id: "files", label: "Files", icon: "file" },
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
      {includeNone && <option value="none">No animal assigned</option>}
      {pets.map((pet) => (
        <option key={pet.cloudId || pet.id} value={pet.cloudId || pet.id}>
          {pet.name} {pet.species ? `• ${pet.species}` : ""}
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

export default function CareInfrastructure({ pets = [], initialTab = "enclosures", setPage }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { showToast } = useToast();
  const infrastructure = useCareInfrastructure(pets);

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
      showToast({ title: errorTitle, message: error.message || "PetPassport could not save that record.", variant: "error" });
      return null;
    }
  };

  if (infrastructure.error) {
    return (
      <main className="pageContent careInfraPage">
        <PageHeader
          eyebrow="Care Infrastructure"
          title="Care tables need to be installed"
          description="Run PETPASSPORT_CARE_INFRASTRUCTURE_V1.sql in Supabase, then return here. Your existing pets were not changed."
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
        eyebrow="Care Infrastructure"
        title="Enclosures, reminders, files, and access"
        description="Track the habitat, equipment, files, tasks, and temporary access that sit around every animal Passport."
        icon={<Icon name="database" size={22} />}
        actions={<Button variant="outline" leftIcon={<Icon name="refresh" size={16} />} onClick={infrastructure.refresh}>Refresh</Button>}
      />

      <section className="careInfraStats">
        <div><strong>{stats.enclosures}</strong><span>Enclosures</span></div>
        <div><strong>{stats.equipment}</strong><span>Equipment</span></div>
        <div><strong>{stats.dueToday}</strong><span>Due today</span></div>
        <div className={stats.overdue > 0 ? "is-danger" : ""}><strong>{stats.overdue}</strong><span>Overdue</span></div>
        <div><strong>{stats.files}</strong><span>Files</span></div>
        <div><strong>{stats.access}</strong><span>Access invites</span></div>
      </section>

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
          <Field label="Warm side"><Input value={form.warm_temp} onChange={(event) => update("warm_temp", event.target.value)} placeholder="88–90°F" /></Field>
          <Field label="Cool side"><Input value={form.cool_temp} onChange={(event) => update("cool_temp", event.target.value)} placeholder="75–78°F" /></Field>
          <Field label="Humidity"><Input value={form.humidity} onChange={(event) => update("humidity", event.target.value)} placeholder="55–70%" /></Field>
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
                <div><span>{reminder.type} • {statusLabel(dueStatus)}</span><h3>{reminder.title}</h3></div>
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
  const [form, setForm] = useState({ file: null, pet_id: "none", enclosure_id: "none", file_type: "Gallery photo", is_public_passport: false, notes: "" });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const result = await run({ action: () => infrastructure.uploadPetFile(form), successTitle: "File uploaded", successMessage: `${form.file?.name || "File"} was attached.` });
    if (result) setForm({ file: null, pet_id: "none", enclosure_id: "none", file_type: "Gallery photo", is_public_passport: false, notes: "" });
  };

  return (
    <section className="careInfraLayout">
      <Card className="careInfraFormCard">
        <CardHeader icon={<Icon name="file" size={18} />} title="Upload file or photo" />
        <form className="careInfraForm" onSubmit={submit}>
          <Field label="File"><Input type="file" onChange={(event) => update("file", event.target.files?.[0] || null)} /></Field>
          <Field label="File type"><Select value={form.file_type} onChange={(event) => update("file_type", event.target.value)}>{FILE_TYPES.map((type) => <option key={type}>{type}</option>)}</Select></Field>
          <Field label="Animal"><PetSelect pets={pets} value={form.pet_id} onChange={(value) => update("pet_id", value)} /></Field>
          <Field label="Enclosure"><EnclosureSelect enclosures={infrastructure.enclosures} value={form.enclosure_id} onChange={(value) => update("enclosure_id", value)} /></Field>
          <label className="careInfraCheck"><input type="checkbox" checked={form.is_public_passport} onChange={(event) => update("is_public_passport", event.target.checked)} /> Include in shared Passport files later</label>
          <Field label="Notes"><Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Vet record, shed photo, receipt, care sheet..." /></Field>
          <Button type="submit" leftIcon={<Icon name="upload" size={16} />}>Upload file</Button>
        </form>
      </Card>

      <div className="careInfraList">
        {infrastructure.files.length === 0 ? <Card><p>No files uploaded yet. Add photos, vet records, receipts, test results, and transfer documents here.</p></Card> : infrastructure.files.map((file) => (
          <Card key={file.id} className="careInfraRecordCard">
            <div className="careInfraRecordHeader">
              <div><span>{file.file_type}</span><h3>{file.file_name}</h3></div>
              <div className="careInfraButtonCluster">
                <Button variant="outline" size="sm" onClick={() => run({ action: () => infrastructure.openFile(file), successTitle: "Opening file", successMessage: "A temporary secure link was created." })}>Open</Button>
                <Button variant="ghost" size="sm" onClick={() => run({ action: () => infrastructure.deleteFile(file), successTitle: "File deleted", successMessage: `${file.file_name} was removed.` })}>Delete</Button>
              </div>
            </div>
            <div className="careInfraMiniGrid">
              <div><span>Animal</span><strong>{petName(pets, file.pet_id)}</strong></div>
              <div><span>Enclosure</span><strong>{enclosureName(infrastructure.enclosures, file.enclosure_id)}</strong></div>
              <div><span>Size</span><strong>{file.size_bytes ? `${Math.round(file.size_bytes / 1024)} KB` : "Unknown"}</strong></div>
              <div><span>Shared flag</span><strong>{file.is_public_passport ? "Can include later" : "Private"}</strong></div>
            </div>
            {file.notes && <p className="careInfraRecordNote">{file.notes}</p>}
          </Card>
        ))}
      </div>
    </section>
  );
}

function AccessPanel({ infrastructure, pets, run }) {
  const [form, setForm] = useState({ pet_id: "none", recipient_email: "", access_level: "view_only", expires_in_days: "7", notes: "" });
  const [lastInviteUrl, setLastInviteUrl] = useState("");
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const result = await run({ action: () => infrastructure.createAccessInvite(form), successTitle: "Access invite created", successMessage: "The temporary access link is ready." });
    if (result?.inviteUrl) {
      setLastInviteUrl(result.inviteUrl);
      await copyTextToClipboard(result.inviteUrl);
    }
    if (result) setForm({ pet_id: "none", recipient_email: "", access_level: "view_only", expires_in_days: "7", notes: "" });
  };

  return (
    <section className="careInfraLayout">
      <Card className="careInfraFormCard">
        <CardHeader icon={<Icon name="users" size={18} />} title="Create access invite" />
        <form className="careInfraForm" onSubmit={submit}>
          <Field label="Animal"><PetSelect pets={pets} value={form.pet_id} onChange={(value) => update("pet_id", value)} includeNone={false} /></Field>
          <Field label="Recipient email"><Input type="email" value={form.recipient_email} onChange={(event) => update("recipient_email", event.target.value)} placeholder="sitter@example.com" /></Field>
          <Field label="Access level"><Select value={form.access_level} onChange={(event) => update("access_level", event.target.value)}>{ACCESS_LEVELS.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}</Select></Field>
          <Field label="Expires"><Select value={form.expires_in_days} onChange={(event) => update("expires_in_days", event.target.value)}>{ACCESS_EXPIRY_OPTIONS.map((option) => <option key={option.label} value={option.days}>{option.label}</option>)}</Select></Field>
          <Field label="Notes"><Textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Care instructions, visit dates, clinic reason..." /></Field>
          <Button type="submit" leftIcon={<Icon name="share" size={16} />}>Create and copy invite</Button>
        </form>

        {lastInviteUrl && (
          <div className="careInfraInviteBox">
            <span>Last invite link</span>
            <code>{lastInviteUrl}</code>
            <Button variant="outline" size="sm" onClick={() => copyTextToClipboard(lastInviteUrl)}>Copy again</Button>
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
              <div><span>{getAccessLevelLabel(invite.access_level)} • {invite.status}</span><h3>{petName(pets, invite.pet_id)}</h3></div>
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
