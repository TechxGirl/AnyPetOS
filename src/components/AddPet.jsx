import { useState } from "react";
import { CARE_PROFILES } from "../data/careProfiles";
import { ANIMAL_TAXONOMY } from "../data/animalTaxonomy";
import { PET_STATUSES } from "../data/statuses";

export default function AddPet({ addPet }) {
  // 🟢 Empty Add Pet Form
  const emptyForm = {
    name: "",
    category: "",
    animalGroup: "",
    species: "",
    careProfile: "",

    morph: "",
    sex: "",
    dob: "",
    ageType: "unknown",
    estimatedAge: "",
    ageNote: "",

    temperament: "",
    status: "Healthy",

    diet: "",
    foodList: [],
    frequency: 0,
    substrate: "",

    notes: "",

    foodOptions: [],
    substrateOptions: [],
    temperamentOptions: [],
  };

  // 🟢 State
  const [form, setForm] = useState(emptyForm);
  const [speciesSearch, setSpeciesSearch] = useState("");

  // 🟢 Animal Taxonomy Helpers
  const animalClasses = Object.keys(ANIMAL_TAXONOMY);

  const animalGroups = form.category
    ? Object.keys(ANIMAL_TAXONOMY[form.category] || {})
    : [];

  const speciesOptions =
    form.category && form.animalGroup
      ? ANIMAL_TAXONOMY[form.category]?.[form.animalGroup] || []
      : [];

  const allSpecies = Object.entries(ANIMAL_TAXONOMY).flatMap(
    ([category, groups]) =>
      Object.entries(groups).flatMap(([animalGroup, speciesList]) =>
        speciesList.map((species) => ({
          category,
          animalGroup,
          species,
        }))
      )
  );

  const searchResults = speciesSearch
    ? allSpecies
        .filter((item) =>
          item.species.toLowerCase().includes(speciesSearch.toLowerCase())
        )
        .slice(0, 8)
    : [];

  // 🟢 Care Profile Helpers
  const getCareKey = (speciesName) =>
    speciesName
      .toLowerCase()
      .replaceAll(" ", "_")
      .replaceAll("-", "_")
      .replaceAll("'", "");

  const applySpeciesData = (speciesName, extraData = {}) => {
    const careKey = getCareKey(speciesName);
    const profile = CARE_PROFILES[careKey];

    const defaultFoodOptions = profile?.feeding?.foodOptions || [];
    const defaultFood = defaultFoodOptions[0] || "";

    setForm((prev) => ({
      ...prev,
      ...extraData,
      species: speciesName,
      careProfile: careKey,

      temperament: profile?.temperamentOptions?.[0] || "",
      diet: defaultFood,
      foodList: defaultFood ? [defaultFood] : [],

      frequency: profile?.feeding?.defaultFrequency || 0,
      substrate: profile?.substrateOptions?.[0] || "",

      foodOptions: defaultFoodOptions,
      substrateOptions: profile?.substrateOptions || [],
      temperamentOptions: profile?.temperamentOptions || [],
    }));
  };

  // 🟢 Species Selection
  const selectSpecies = (speciesName) => {
    applySpeciesData(speciesName);
  };

  const selectSpeciesFromSearch = (item) => {
    applySpeciesData(item.species, {
      category: item.category,
      animalGroup: item.animalGroup,
    });

    setSpeciesSearch(item.species);
  };

  const clearAnimalSelection = () => {
    setForm({
      ...form,
      category: "",
      animalGroup: "",
      species: "",
      careProfile: "",
      diet: "",
      foodList: [],
      foodOptions: [],
      substrateOptions: [],
      temperamentOptions: [],
    });

    setSpeciesSearch("");
  };

  // 🟢 Multiple Food Selection
  const toggleFood = (food) => {
    setForm((prev) => {
      const alreadySelected = prev.foodList.includes(food);

      const updatedFoodList = alreadySelected
        ? prev.foodList.filter((item) => item !== food)
        : [...prev.foodList, food];

      return {
        ...prev,
        foodList: updatedFoodList,
        diet: updatedFoodList.join(", "),
      };
    });
  };

  // 🟢 Save Pet
  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert("Please enter a pet name or ID.");
      return;
    }

    if (!form.species) {
      alert("Please choose a species.");
      return;
    }

    addPet(form);
    setForm(emptyForm);
    setSpeciesSearch("");
  };

  return (
    <div className="card">
      <h2>➕ Add Pet</h2>

      {/* 🟢 Quick Species Search */}
      <label>Quick Species Search</label>
      <input
        placeholder="Search species: reticulated python, isopod, skink..."
        value={speciesSearch}
        onChange={(e) => setSpeciesSearch(e.target.value)}
      />

      {searchResults.length > 0 && (
        <div className="suggestions">
          {searchResults.map((item) => (
            <div
              key={`${item.category}-${item.animalGroup}-${item.species}`}
              className="suggestion"
              onClick={() => selectSpeciesFromSearch(item)}
            >
              {item.species} • {item.category} / {item.animalGroup}
            </div>
          ))}
        </div>
      )}

      {/* 🟢 Animal Class / Group / Species */}
      <label>Animal Class</label>
      <select
        value={form.category}
        onChange={(e) => {
          setSpeciesSearch("");

          setForm({
            ...form,
            category: e.target.value,
            animalGroup: "",
            species: "",
            careProfile: "",
            diet: "",
            foodList: [],
            foodOptions: [],
            substrateOptions: [],
            temperamentOptions: [],
          });
        }}
      >
        <option value="">Choose animal class...</option>
        {animalClasses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {form.category && (
        <>
          <label>Animal Group</label>
          <select
            value={form.animalGroup}
            onChange={(e) => {
              setSpeciesSearch("");

              setForm({
                ...form,
                animalGroup: e.target.value,
                species: "",
                careProfile: "",
                diet: "",
                foodList: [],
                foodOptions: [],
                substrateOptions: [],
                temperamentOptions: [],
              });
            }}
          >
            <option value="">Choose group...</option>
            {animalGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </>
      )}

      {form.animalGroup && (
        <>
          <label>Species</label>
          <select
            value={form.species}
            onChange={(e) => selectSpecies(e.target.value)}
          >
            <option value="">Choose species...</option>
            {speciesOptions.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>
        </>
      )}

      {(form.category || form.animalGroup || form.species) && (
        <button type="button" onClick={clearAnimalSelection}>
          Clear Animal Selection
        </button>
      )}

      {/* 🟢 Identity */}
      <label>Pet Name / ID</label>
      <input
        placeholder="Example: Big Mama, Expo 001, Holdback 3"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <label>Morph / Breed</label>
      <input
        placeholder="Example: Banana, Tabby, Mixed Breed"
        value={form.morph}
        onChange={(e) => setForm({ ...form, morph: e.target.value })}
      />

      <label>Sex</label>
      <select
        value={form.sex}
        onChange={(e) => setForm({ ...form, sex: e.target.value })}
      >
        <option value="">Unknown</option>
        <option value="Female">Female</option>
        <option value="Male">Male</option>
        <option value="Unsexed">Unsexed</option>
      </select>

      {/* 🟢 Age */}
      <label>DOB / Hatch Date</label>
      <input
        type="date"
        value={form.dob}
        onChange={(e) => setForm({ ...form, dob: e.target.value })}
      />

      <label>Age Type</label>
      <select
        value={form.ageType}
        onChange={(e) => setForm({ ...form, ageType: e.target.value })}
      >
        <option value="exact">Exact DOB / Hatch Date</option>
        <option value="estimated">Estimated Age</option>
        <option value="unknown">Unknown</option>
      </select>

      {form.ageType === "estimated" && (
        <>
          <label>Estimated Age</label>
          <input
            placeholder="Example: 3 years, adult, juvenile"
            value={form.estimatedAge}
            onChange={(e) =>
              setForm({ ...form, estimatedAge: e.target.value })
            }
          />

          <label>Age Note</label>
          <textarea
            placeholder="Example: Previous owner said around 3-5 years old."
            value={form.ageNote}
            onChange={(e) => setForm({ ...form, ageNote: e.target.value })}
          />
        </>
      )}

      {/* 🟢 Status / Temperament */}
<label>Temperament</label>

{form.temperamentOptions.length > 0 ? (
  <select
    value={form.temperament}
    onChange={(e) =>
      setForm({ ...form, temperament: e.target.value })
    }
  >
    {form.temperamentOptions.map((temperament) => (
      <option key={temperament} value={temperament}>
        {temperament}
      </option>
    ))}
  </select>
) : (
  <input
    placeholder="Example: Calm, spicy, shy, defensive"
    value={form.temperament}
    onChange={(e) =>
      setForm({ ...form, temperament: e.target.value })
    }
  />
)}

      <label>Status</label>

<select
  value={form.status}
  onChange={(e) => setForm({ ...form, status: e.target.value })}
>
  {PET_STATUSES.map((status) => (
    <option key={status} value={status}>
      {status === "Healthy" && "🟢 "}
      {status === "Monitoring" && "🟡 "}
      {status === "Quarantine" && "🔵 "}
      {status === "Sick" && "🔴 "}
      {status === "Breeding" && "🧬 "}
      {status === "For Sale" && "💰 "}
      {status === "Holdback" && "⭐ "}
      {status === "Retired" && "🏡 "}
      {status === "Memorial" && "⚫ "}

      {status}
    </option>
  ))}
</select>

      {/* 🟢 Feeding */}
      <label>Foods This Animal Eats</label>

      {form.foodOptions.length > 0 ? (
        <div className="tagGrid">
          {form.foodOptions.map((food) => {
            const selected = form.foodList.includes(food);

            return (
              <button
                type="button"
                key={food}
                className={selected ? "tagButton selectedTag" : "tagButton"}
                onClick={() => toggleFood(food)}
              >
                {selected ? "✓ " : "+ "}
                {food}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          placeholder="Example: Medium Rat, Chick, Dubia Roaches, Collard Greens"
          value={form.diet}
          onChange={(e) => {
            const typedFoods = e.target.value
              ? e.target.value.split(",").map((item) => item.trim())
              : [];

            setForm({
              ...form,
              diet: e.target.value,
              foodList: typedFoods,
            });
          }}
        />
      )}

      {form.foodList.length > 0 && (
        <p className="helperText">Selected: {form.foodList.join(", ")}</p>
      )}

      <label>Feeding Frequency Days</label>
      <input
        type="number"
        value={form.frequency}
        onChange={(e) => setForm({ ...form, frequency: e.target.value })}
      />

      {/* 🟢 Housing */}
      <label>Substrate / Housing</label>
      {form.substrateOptions.length > 0 ? (
        <select
          value={form.substrate}
          onChange={(e) => setForm({ ...form, substrate: e.target.value })}
        >
          {form.substrateOptions.map((substrate) => (
            <option key={substrate} value={substrate}>
              {substrate}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>
      ) : (
        <input
          placeholder="Example: Coco husk, bioactive, paper towels"
          value={form.substrate}
          onChange={(e) => setForm({ ...form, substrate: e.target.value })}
        />
      )}

      {/* 🟢 Notes */}
      <label>Notes</label>
      <textarea
        placeholder="Anything important about this animal..."
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      <button onClick={handleSubmit}>Save Pet</button>
    </div>
  );
}