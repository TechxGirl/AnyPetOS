import { useState } from "react";
import { Button, Icon, IconButton } from "./ui";

export default function WeightModal({ pet, close, logWeight, saving = false }) {
  const [form, setForm] = useState({ weight: "", unit: "g", date: new Date().toISOString().slice(0, 10), notes: "" });
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.weight) { setError("Please enter a weight."); return; }
    setError("");
    const result = await logWeight(pet.id, { weight: Number(form.weight), unit: form.unit, date: form.date, notes: form.notes });
    if (result?.ok) close();
  };

  return (
    <div className="modalOverlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) close(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="weight-modal-title">
        <div className="profileHeader">
          <div><h2 id="weight-modal-title">Log weight</h2><p>{pet.name}</p></div>
          <IconButton variant="ghost" icon={<Icon name="close" size={19} />} label="Close weight form" onClick={close} disabled={saving} />
        </div>

        <label>Weight</label>
        <input type="number" min="0" step="any" placeholder="Example: 1543" value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} />
        {error && <p className="warningText">{error}</p>}

        <label>Unit</label>
        <select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}>
          <option value="g">Grams</option><option value="kg">Kilograms</option><option value="oz">Ounces</option><option value="lb">Pounds</option>
        </select>

        <label>Date</label>
        <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />

        <label>Notes</label>
        <textarea placeholder="Example: weighed before feeding" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />

        <div className="buttonRow">
          <Button loading={saving} leftIcon={<Icon name="weight" size={16} />} onClick={handleSave}>Save weight</Button>
          <Button variant="outline" onClick={close} disabled={saving}>Cancel</Button>
        </div>
      </section>
    </div>
  );
}
