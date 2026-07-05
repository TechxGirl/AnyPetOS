import { useState } from "react";

export default function FeedModal({ pet, close, feedPet }) {
  // 🟢 Feeding Form
  const [foods, setFoods] = useState(pet.foodList || []);
  const [customFood, setCustomFood] = useState("");
  const [amount, setAmount] = useState("");
  const [weight, setWeight] = useState("");
  const [accepted, setAccepted] = useState("Accepted");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  if (!pet) return null;

  // 🟢 Toggle Food Selection
  const toggleFood = (food) => {
    setFoods((prev) =>
      prev.includes(food)
        ? prev.filter((item) => item !== food)
        : [...prev, food]
    );
  };

  // 🟢 Save Feeding
  const saveFeeding = () => {
    const finalFoods =
      customFood.trim() !== ""
        ? [...foods, customFood.trim()]
        : foods;

    feedPet(pet.id, {
      foods: finalFoods,
      amount,
      weight,
      accepted,
      notes,
      date,
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
            <h2>🍽 Log Feeding</h2>
            <p>{pet.name}</p>
          </div>

          <button onClick={close}>✕</button>
        </div>

        <div className="card innerCard">

          {/* 🟢 Date */}
          <label>Feeding Date</label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* 🟢 Foods */}
          <label>Foods Offered</label>

          {pet.foodOptions?.length > 0 ? (
            <div className="tagGrid">
              {pet.foodOptions.map((food) => (
                <button
                  key={food}
                  type="button"
                  className={
                    foods.includes(food)
                      ? "tagButton selectedTag"
                      : "tagButton"
                  }
                  onClick={() => toggleFood(food)}
                >
                  {foods.includes(food) ? "✓ " : "+ "}
                  {food}
                </button>
              ))}
            </div>
          ) : (
            <input
              placeholder="Foods offered"
              value={customFood}
              onChange={(e) => setCustomFood(e.target.value)}
            />
          )}

          {pet.foodOptions?.length > 0 && (
            <>
              <label>Other Food (Optional)</label>

              <input
                placeholder="Example: Quail, Tilapia, Blueberries..."
                value={customFood}
                onChange={(e) => setCustomFood(e.target.value)}
              />
            </>
          )}

          {foods.length > 0 && (
            <p className="helperText">
              Selected: {foods.join(", ")}
            </p>
          )}

          {/* 🟢 Amount */}
          <label>Size / Amount</label>

          <input
            placeholder="Example: Medium Rat, 12 Dubias, Bowl of Greens"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          {/* 🟢 Weight */}
          <label>Pet Weight (Optional)</label>

          <input
            placeholder="Example: 1540 g"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />

          {/* 🟢 Result */}
          <label>Meal Result</label>

          <select
            value={accepted}
            onChange={(e) => setAccepted(e.target.value)}
          >
            <option>Accepted</option>
            <option>Partial</option>
            <option>Refused</option>
          </select>

          {/* 🟢 Notes */}
          <label>Notes</label>

          <textarea
            placeholder="Strike response, regurgitation concerns, appetite, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* 🟢 Buttons */}
          <div className="buttonRow">
            <button onClick={saveFeeding}>
              Save Feeding
            </button>

            <button onClick={close}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}