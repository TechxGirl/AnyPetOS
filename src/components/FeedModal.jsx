import { useMemo, useState } from "react";
import { Button, Icon, IconButton } from "./ui";
import {
  buildFeedingPlan,
  describeMealItem,
  getSizeOptionsForFood,
} from "../data/feedingOptions";

// =====================================================
// 🟢 FeedModal.jsx
//
// Species-aware smart feeding log:
// - food dropdown
// - meal-size dropdown when applicable
// - custom food for every species
// - accepted/refused/partial/regurgitated results
// - dusting/gut-load tracking for insect eaters
// =====================================================

export default function FeedModal({ pet, close, feedPet, saving = false }) {
  if (!pet) return null;

  // =====================================================
  // 🟢 Feeding Plan
  // =====================================================

  const feedingPlan = useMemo(() => buildFeedingPlan(pet), [pet]);

  // =====================================================
  // 🟢 State
  // =====================================================

  const [mealItems, setMealItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [customFood, setCustomFood] = useState("");
  const [customCategory, setCustomCategory] = useState("Other");
  const [saveCustomFood, setSaveCustomFood] = useState(true);
  const [result, setResult] = useState("Ate");
  const [refusalReason, setRefusalReason] = useState("Unknown");
  const [gutLoaded, setGutLoaded] = useState(false);
  const [calciumDusted, setCalciumDusted] = useState(false);
  const [vitaminDusted, setVitaminDusted] = useState(false);
  const [petWeight, setPetWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const activeFood = customFood.trim() || selectedFood;
  const sizeOptions = activeFood ? getSizeOptionsForFood(activeFood, pet) : [];
  const isInsectPlan = feedingPlan.type === "insectivore" || feedingPlan.type === "omnivore";
  const isResultConcern = ["Refused", "Partial", "Regurgitated"].includes(result);

  // =====================================================
  // 🟢 Meal Item Actions
  // =====================================================

  const resetFoodEntry = () => {
    setSelectedFood("");
    setSelectedSize("");
    setQuantity("1");
    setUnit("");
    setCustomFood("");
    setCustomCategory("Other");
  };

  const addMealItem = () => {
    const food = activeFood.trim();

    if (!food) return;

    const item = {
      id: `${food}-${selectedSize}-${quantity}-${Date.now()}`,
      food,
      size: selectedSize,
      quantity,
      unit,
      custom: Boolean(customFood.trim()),
      category: customFood.trim() ? customCategory : "Saved option",
    };

    setMealItems((previous) => [...previous, item]);
    resetFoodEntry();
  };

  const removeMealItem = (itemId) => {
    setMealItems((previous) => previous.filter((item) => item.id !== itemId));
  };

  // =====================================================
  // 🟢 Save Feeding
  // =====================================================

  const saveFeeding = async () => {
    const unsavedFood = activeFood.trim();
    const finalItems = mealItems.length > 0 ? mealItems : unsavedFood ? [
      {
        id: `${unsavedFood}-${Date.now()}`,
        food: unsavedFood,
        size: selectedSize,
        quantity,
        unit,
        custom: Boolean(customFood.trim()),
        category: customFood.trim() ? customCategory : "Saved option",
      },
    ] : [];

    const finalFoods = finalItems.map((item) => item.food);

    const resultPayload = await feedPet(pet.id, {
      items: finalItems,
      foods: finalFoods,
      result,
      accepted: result,
      refusalReason: isResultConcern ? refusalReason : "",
      gutLoaded,
      calciumDusted,
      vitaminDusted,
      petWeight,
      customFoodsToSave: saveCustomFood
        ? finalItems.filter((item) => item.custom).map((item) => item.food)
        : [],
      notes,
      date,
    });

    if (resultPayload?.ok) {
      close();
    }
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div
      className="modalOverlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) close();
      }}
    >
      <section
        className="modal petProfileModal smartFeedModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feeding-modal-title"
      >
        <div className="profileHeader smartFeedHeader">
          <div>
            <span className="miniEyebrow">Smart feeding log</span>
            <h2 id="feeding-modal-title">Log feeding</h2>
            <p>{pet.name} • {pet.species || "Species not set"}</p>
          </div>

          <IconButton
            variant="ghost"
            icon={<Icon name="close" size={19} />}
            label="Close feeding form"
            onClick={close}
            disabled={saving}
          />
        </div>

        <div className="smartFeedGrid">
          <div className="card innerCard smartFeedPanel">
            <div className="smartFeedPanelHeader">
              <div>
                <h3>Meal details</h3>
                <p>{feedingPlan.helper}</p>
              </div>
              <span className="smartFeedTypePill">{feedingPlan.type}</span>
            </div>

            <label>Feeding date</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />

            <div className="smartFeedFields">
              <div>
                <label>Food</label>
                <select
                  value={selectedFood}
                  onChange={(event) => {
                    setSelectedFood(event.target.value);
                    setSelectedSize("");
                    setCustomFood("");
                  }}
                >
                  <option value="">Choose food...</option>
                  {feedingPlan.foodOptions.map((food) => (
                    <option key={food} value={food}>{food}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Size / portion</label>
                <select
                  value={selectedSize}
                  onChange={(event) => setSelectedSize(event.target.value)}
                  disabled={!activeFood}
                >
                  <option value="">Choose size...</option>
                  {sizeOptions.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Quantity</label>
                <input
                  value={quantity}
                  placeholder="1"
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>

              <div>
                <label>Unit / note</label>
                <input
                  value={unit}
                  placeholder="optional"
                  onChange={(event) => setUnit(event.target.value)}
                />
              </div>
            </div>

            <div className="smartFeedCustomFood">
              <div>
                <label>Add custom food</label>
                <input
                  placeholder="Example: Quail chick, dandelion greens, tilapia"
                  value={customFood}
                  onChange={(event) => {
                    setCustomFood(event.target.value);
                    setSelectedFood("");
                    setSelectedSize("");
                  }}
                />
              </div>

              <div>
                <label>Custom category</label>
                <select
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  disabled={!customFood.trim()}
                >
                  {feedingPlan.foodCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {customFood.trim() && (
              <label className="checkboxLine smartFeedCheck">
                <input
                  type="checkbox"
                  checked={saveCustomFood}
                  onChange={(event) => setSaveCustomFood(event.target.checked)}
                />
                Save this custom food to {pet.name}'s food list
              </label>
            )}

            <Button
              variant="secondary"
              leftIcon={<Icon name="plus" size={16} />}
              onClick={addMealItem}
              disabled={!activeFood}
            >
              Add meal item
            </Button>

            {mealItems.length > 0 && (
              <div className="smartMealList">
                <span>Meal items</span>
                {mealItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="smartMealItem"
                    onClick={() => removeMealItem(item.id)}
                    title="Remove meal item"
                  >
                    <strong>{describeMealItem(item)}</strong>
                    <small>{item.custom ? "Custom" : "Saved"} • click to remove</small>
                  </button>
                ))}
              </div>
            )}

            {feedingPlan.showPreyReminder && (
              <p className="smartFeedHint">
                Prey sizing note: use the size dropdown to record what was offered. Adjust prey choice for the animal's age, body condition, and safe husbandry guidance.
              </p>
            )}
          </div>

          <div className="card innerCard smartFeedPanel">
            <div className="smartFeedPanelHeader">
              <div>
                <h3>Result & notes</h3>
                <p>Track response, refusals, dusting, and weight context.</p>
              </div>
            </div>

            <label>Meal result</label>
            <select value={result} onChange={(event) => setResult(event.target.value)}>
              {feedingPlan.resultOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            {isResultConcern && (
              <>
                <label>Reason / context</label>
                <select
                  value={refusalReason}
                  onChange={(event) => setRefusalReason(event.target.value)}
                >
                  {feedingPlan.refusalReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </>
            )}

            {isInsectPlan && (
              <div className="smartFeedChecks">
                <label className="checkboxLine smartFeedCheck">
                  <input type="checkbox" checked={gutLoaded} onChange={(event) => setGutLoaded(event.target.checked)} />
                  Gut-loaded
                </label>
                <label className="checkboxLine smartFeedCheck">
                  <input type="checkbox" checked={calciumDusted} onChange={(event) => setCalciumDusted(event.target.checked)} />
                  Calcium dusted
                </label>
                <label className="checkboxLine smartFeedCheck">
                  <input type="checkbox" checked={vitaminDusted} onChange={(event) => setVitaminDusted(event.target.checked)} />
                  Vitamin dusted
                </label>
              </div>
            )}

            <label>Pet weight (optional)</label>
            <input
              placeholder="Example: 1540 g"
              value={petWeight}
              onChange={(event) => setPetWeight(event.target.value)}
            />

            <label>Notes</label>
            <textarea
              placeholder="Appetite, strike/feed response, shed/premolt, water quality, supplement notes..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />

            <div className="buttonRow smartFeedActions">
              <Button
                loading={saving}
                leftIcon={<Icon name="utensils" size={16} />}
                onClick={saveFeeding}
                disabled={!activeFood && mealItems.length === 0}
              >
                Save feeding
              </Button>

              <Button variant="outline" onClick={close} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
