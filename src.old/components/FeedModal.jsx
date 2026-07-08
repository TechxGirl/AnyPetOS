import { useState } from "react";
import { Button, Icon, IconButton } from "./ui";

export default function FeedModal({ pet, close, feedPet, saving = false }) {
  const [foods, setFoods] = useState(pet?.foodList || []);
  const [customFood, setCustomFood] = useState("");
  const [amount, setAmount] = useState("");
  const [weight, setWeight] = useState("");
  const [accepted, setAccepted] = useState("Accepted");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  if (!pet) return null;

  const toggleFood = (food) => {
    setFoods((previous) => previous.includes(food) ? previous.filter((item) => item !== food) : [...previous, food]);
  };

  const saveFeeding = async () => {
    const finalFoods = customFood.trim() ? [...foods, customFood.trim()] : foods;
    const result = await feedPet(pet.id, { foods: finalFoods, amount, weight, accepted, notes, date });
    if (result?.ok) close();
  };

  return (
    <div className="modalOverlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) close(); }}>
      <section className="modal petProfileModal" role="dialog" aria-modal="true" aria-labelledby="feeding-modal-title">
        <div className="profileHeader">
          <div>
            <h2 id="feeding-modal-title">Log feeding</h2>
            <p>{pet.name}</p>
          </div>
          <IconButton variant="ghost" icon={<Icon name="close" size={19} />} label="Close feeding form" onClick={close} disabled={saving} />
        </div>

        <div className="card innerCard">
          <label>Feeding date</label>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />

          <label>Foods offered</label>
          {pet.foodOptions?.length > 0 ? (
            <div className="tagGrid">
              {pet.foodOptions.map((food) => (
                <button
                  key={food}
                  type="button"
                  className={foods.includes(food) ? "tagButton selectedTag" : "tagButton"}
                  onClick={() => toggleFood(food)}
                  aria-pressed={foods.includes(food)}
                >
                  {foods.includes(food) ? "Selected: " : "Add: "}{food}
                </button>
              ))}
            </div>
          ) : (
            <input placeholder="Foods offered" value={customFood} onChange={(event) => setCustomFood(event.target.value)} />
          )}

          {pet.foodOptions?.length > 0 && (
            <>
              <label>Other food (optional)</label>
              <input placeholder="Example: quail, tilapia, blueberries" value={customFood} onChange={(event) => setCustomFood(event.target.value)} />
            </>
          )}

          {foods.length > 0 && <p className="helperText">Selected: {foods.join(", ")}</p>}

          <label>Size / amount</label>
          <input placeholder="Example: medium rat, 12 dubias, bowl of greens" value={amount} onChange={(event) => setAmount(event.target.value)} />

          <label>Pet weight (optional)</label>
          <input placeholder="Example: 1540 g" value={weight} onChange={(event) => setWeight(event.target.value)} />

          <label>Meal result</label>
          <select value={accepted} onChange={(event) => setAccepted(event.target.value)}>
            <option>Accepted</option><option>Partial</option><option>Refused</option>
          </select>

          <label>Notes</label>
          <textarea placeholder="Appetite, feeding response, or concerns" value={notes} onChange={(event) => setNotes(event.target.value)} />

          <div className="buttonRow">
            <Button loading={saving} leftIcon={<Icon name="utensils" size={16} />} onClick={saveFeeding}>Save feeding</Button>
            <Button variant="outline" onClick={close} disabled={saving}>Cancel</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
