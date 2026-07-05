import { useState } from "react";

export default function ShedModal({ pet, close, logShed }) {
  // 🟢 Shed Form State
  const [shedType, setShedType] = useState("Full Shed");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  if (!pet) return null;

  // 🟢 Save Shed Log
  const saveShed = () => {
    logShed(pet.id, {
      shedType,
      date,
      notes,
    });

    close();
  };

  return (
    <div className="modalOverlay" onClick={close}>
      <div
        className="modal petProfileModal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🟢 Header */}
        <div className="profileHeader">
          <div>
            <h2>🐍 Log Shed</h2>
            <p>{pet.name}</p>
          </div>

          <button onClick={close}>✕</button>
        </div>

        {/* 🟢 Shed Form */}
        <div className="card innerCard">
          <label>Shed Type</label>
          <select
            value={shedType}
            onChange={(e) => setShedType(e.target.value)}
          >
            <option>Full Shed</option>
            <option>Partial Shed</option>
            <option>Stuck Shed</option>
            <option>Retained Eye Caps</option>
            <option>Pre-Shed / In Blue</option>
          </select>

          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label>Notes</label>
          <textarea
            placeholder="Example: full one-piece shed, stuck tail tip, humidity increased..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* 🟢 Buttons */}
          <div className="buttonRow">
            <button onClick={saveShed}>Save Shed</button>
            <button onClick={close}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}