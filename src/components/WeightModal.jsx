import { useState } from "react";

// =====================================================
// 🟢 WeightModal.jsx
//
// Logs a weight entry for a pet.
//
// Includes:
// • Weight
// • Unit
// • Date
// • Notes
//
// =====================================================

export default function WeightModal({ pet, close, logWeight }) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [form, setForm] = useState({
    weight: "",
    unit: "g",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  // =====================================================
  // 🟢 Actions
  // =====================================================

  const handleSave = () => {
    if (!form.weight) {
      alert("Please enter a weight.");
      return;
    }

    logWeight(pet.id, {
      weight: Number(form.weight),
      unit: form.unit,
      date: form.date,
      notes: form.notes,
    });

    close();
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="modalOverlay" onClick={close}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🟢 Header */}
        <div className="profileHeader">
          <div>
            <h2>⚖️ Log Weight</h2>
            <p>{pet.name}</p>
          </div>

          <button onClick={close}>✕</button>
        </div>

        {/* 🟢 Weight */}
        <label>Weight</label>

        <input
          type="number"
          placeholder="Example: 1543"
          value={form.weight}
          onChange={(e) =>
            setForm({
              ...form,
              weight: e.target.value,
            })
          }
        />

        {/* 🟢 Unit */}
        <label>Unit</label>

        <select
          value={form.unit}
          onChange={(e) =>
            setForm({
              ...form,
              unit: e.target.value,
            })
          }
        >
          <option value="g">Grams</option>
          <option value="kg">Kilograms</option>
          <option value="oz">Ounces</option>
          <option value="lb">Pounds</option>
        </select>

        {/* 🟢 Date */}
        <label>Date</label>

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({
              ...form,
              date: e.target.value,
            })
          }
        />

        {/* 🟢 Notes */}
        <label>Notes</label>

        <textarea
          placeholder="Example: weighed before feeding"
          value={form.notes}
          onChange={(e) =>
            setForm({
              ...form,
              notes: e.target.value,
            })
          }
        />

        {/* 🟢 Buttons */}
        <div className="buttonRow">
          <button onClick={handleSave}>
            Save Weight
          </button>

          <button onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}