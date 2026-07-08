import { useState } from "react";
import { Button, Icon, IconButton } from "./ui";

export default function ShedModal({ pet, close, logShed, saving = false }) {
  const [shedType, setShedType] = useState("Full Shed");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  if (!pet) return null;

  const saveShed = async () => {
    const result = await logShed(pet.id, { shedType, date, notes });
    if (result?.ok) close();
  };

  return (
    <div className="modalOverlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) close(); }}>
      <section className="modal petProfileModal" role="dialog" aria-modal="true" aria-labelledby="shed-modal-title">
        <div className="profileHeader">
          <div><h2 id="shed-modal-title">Log shed or molt</h2><p>{pet.name}</p></div>
          <IconButton variant="ghost" icon={<Icon name="close" size={19} />} label="Close shed form" onClick={close} disabled={saving} />
        </div>
        <div className="card innerCard">
          <label>Shed type</label>
          <select value={shedType} onChange={(event) => setShedType(event.target.value)}>
            <option>Full Shed</option><option>Partial Shed</option><option>Stuck Shed</option><option>Retained Eye Caps</option><option>Pre-Shed / In Blue</option><option>Molt</option>
          </select>
          <label>Date</label>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <label>Notes</label>
          <textarea placeholder="Condition, retained areas, humidity changes, or observations" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <div className="buttonRow">
            <Button loading={saving} leftIcon={<Icon name="history" size={16} />} onClick={saveShed}>Save record</Button>
            <Button variant="outline" onClick={close} disabled={saving}>Cancel</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
