// =====================================================
// 🟢 Smart Feeding Options
//
// Species-aware feeding helpers for the beta feeding modal.
// These are husbandry logging options, not medical advice.
// =====================================================

const MOUSE_SIZES = [
  "Pinky Mouse",
  "Fuzzy Mouse",
  "Hopper Mouse",
  "Weaned Mouse",
  "Small Mouse",
  "Adult Mouse",
  "Large Mouse",
  "Jumbo Mouse",
];

const RAT_SIZES = [
  "Rat Pinky",
  "Rat Fuzzy",
  "Rat Pup",
  "Weaned Rat",
  "Small Rat",
  "Medium Rat",
  "Large Rat",
  "Jumbo Rat",
];

const BIRD_PREY_SIZES = [
  "Small Chick",
  "Medium Chick",
  "Large Chick",
  "Small Quail",
  "Medium Quail",
  "Large Quail",
];

const INSECT_SIZES = [
  "Pinhead",
  "Extra small",
  "Small",
  "Medium",
  "Large",
  "Adult",
];

const PRODUCE_AMOUNTS = ["Pinch", "Leaf", "Pieces", "Small serving", "Medium serving", "Large serving"];
const AQUATIC_AMOUNTS = ["Pinch", "Few pieces", "Small portion", "Medium portion", "Large portion"];
const GENERIC_AMOUNTS = ["Tiny", "Small", "Medium", "Large", "Custom"];

export const MEAL_RESULTS = [
  "Ate",
  "Partial",
  "Refused",
  "Regurgitated",
  "Skipped intentionally",
];

export const REFUSAL_REASONS = [
  "Unknown",
  "In shed / premolt",
  "Breeding season",
  "Stress",
  "Too cold",
  "Wrong prey / food",
  "Too large",
  "Not hungry",
  "Recently moved",
  "Other",
];

export const FOOD_CATEGORIES = [
  "Rodent prey",
  "Bird prey",
  "Insects",
  "Worms / larvae",
  "Greens",
  "Vegetables",
  "Fruit",
  "Pellets / prepared",
  "Hay / forage",
  "Aquatic foods",
  "Other",
];

const SNAKE_FOODS = ["Mouse", "Rat", "ASF Rat", "Chick", "Quail", "Egg", "Fish", "Other"];
const INSECTIVORE_FOODS = [
  "Dubia Roaches",
  "Crickets",
  "Mealworms",
  "Superworms",
  "BSFL",
  "Hornworms",
  "Silkworms",
  "Waxworms",
  "Fruit Flies",
  "Blue Bottle Flies",
  "Other",
];
const OMNIVORE_FOODS = [
  "Dubia Roaches",
  "Crickets",
  "BSFL",
  "Collard Greens",
  "Mustard Greens",
  "Turnip Greens",
  "Squash",
  "Bell Pepper",
  "Blueberries",
  "Pellets",
  "Other",
];
const HERBIVORE_FOODS = [
  "Grass Hay",
  "Leafy Greens",
  "Weeds",
  "Flowers",
  "Vegetables",
  "Fruit",
  "Pellets",
  "Other",
];
const AQUATIC_FOODS = ["Pellets", "Flakes", "Frozen Food", "Live Food", "Bloodworms", "Brine Shrimp", "Vegetables", "Other"];
const MAMMAL_FOODS = ["Dry Food", "Wet Food", "Prescription Diet", "Raw Diet", "Hay", "Pellets", "Vegetables", "Fruit", "Other"];
const BIRD_FOODS = ["Pellets", "Seeds", "Vegetables", "Fruit", "Sprouts", "Nuts", "Treats", "Other"];

function unique(items = []) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function splitDiet(diet) {
  if (!diet) return [];
  return String(diet)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferPlanType(pet = {}) {
  const category = normalize(pet.category);
  const group = normalize(pet.animalGroup);
  const species = normalize(pet.species);

  if (group.includes("snake") || species.includes("python") || species.includes("boa") || species.includes("snake")) {
    return "snake";
  }

  if (species.includes("bearded dragon") || species.includes("blue tongue") || species.includes("uromastyx") || species.includes("iguana")) {
    return "omnivore";
  }

  if (group.includes("tortoise") || species.includes("tortoise") || species.includes("rabbit") || species.includes("guinea pig") || species.includes("chinchilla")) {
    return "herbivore";
  }

  if (
    group.includes("lizard") ||
    species.includes("gecko") ||
    species.includes("skink") ||
    species.includes("frog") ||
    species.includes("toad") ||
    species.includes("salamander") ||
    category.includes("arachnid") ||
    category.includes("invertebrate")
  ) {
    return "insectivore";
  }

  if (category.includes("fish") || species.includes("axolotl") || group.includes("turtle")) {
    return "aquatic";
  }

  if (category.includes("bird") || species.includes("parrot") || species.includes("chicken")) {
    return "bird";
  }

  if (category.includes("mammal") || ["dog", "cat", "horse"].some((word) => species.includes(word))) {
    return "mammal";
  }

  return "generic";
}

function getBaseFoodsForType(type) {
  switch (type) {
    case "snake":
      return SNAKE_FOODS;
    case "insectivore":
      return INSECTIVORE_FOODS;
    case "omnivore":
      return OMNIVORE_FOODS;
    case "herbivore":
      return HERBIVORE_FOODS;
    case "aquatic":
      return AQUATIC_FOODS;
    case "bird":
      return BIRD_FOODS;
    case "mammal":
      return MAMMAL_FOODS;
    default:
      return ["Prepared Diet", "Pellets", "Fresh Food", "Treat", "Other"];
  }
}

export function getSizeOptionsForFood(food, pet = {}) {
  const value = normalize(food);
  const type = inferPlanType(pet);

  if (value.includes("mouse") || value === "mouse") return MOUSE_SIZES;
  if (value.includes("rat") || value.includes("asf")) return RAT_SIZES;
  if (value.includes("chick") || value.includes("quail") || value.includes("bird")) return BIRD_PREY_SIZES;
  if (
    value.includes("roach") ||
    value.includes("cricket") ||
    value.includes("worm") ||
    value.includes("larva") ||
    value.includes("bsfl") ||
    value.includes("fly") ||
    value.includes("insect")
  ) {
    return INSECT_SIZES;
  }
  if (value.includes("green") || value.includes("vegetable") || value.includes("fruit") || value.includes("squash") || value.includes("pepper")) {
    return PRODUCE_AMOUNTS;
  }
  if (type === "snake") return [...MOUSE_SIZES, ...RAT_SIZES, ...BIRD_PREY_SIZES, "Custom"];
  if (type === "insectivore") return INSECT_SIZES;
  if (type === "omnivore" || type === "herbivore") return PRODUCE_AMOUNTS;
  if (type === "aquatic") return AQUATIC_AMOUNTS;
  return GENERIC_AMOUNTS;
}

export function buildFeedingPlan(pet = {}) {
  const type = inferPlanType(pet);
  const customFoods = Array.isArray(pet.customFoodOptions) ? pet.customFoodOptions : [];

  const foodOptions = unique([
    ...getBaseFoodsForType(type),
    ...(Array.isArray(pet.foodOptions) ? pet.foodOptions : []),
    ...(Array.isArray(pet.foodList) ? pet.foodList : []),
    ...splitDiet(pet.diet),
    ...customFoods,
  ]);

  return {
    type,
    foodOptions,
    foodCategories: FOOD_CATEGORIES,
    resultOptions: MEAL_RESULTS,
    refusalReasons: REFUSAL_REASONS,
    showPreyReminder: type === "snake",
    supportsMealSize: ["snake", "insectivore", "omnivore", "herbivore", "aquatic"].includes(type),
    helper:
      type === "snake"
        ? "Choose the prey type, then choose the specific size. A good prey item is usually close to the snake's body girth and appropriate for age/body condition."
        : type === "insectivore"
        ? "Log feeder type, size, quantity, and whether insects were gut-loaded or dusted."
        : type === "omnivore" || type === "herbivore"
        ? "Log greens, vegetables, fruit, pellets, supplements, or custom foods with an amount."
        : "Log the food, amount, result, and notes.",
  };
}

export function describeMealItem(item = {}) {
  return [item.food, item.size, item.quantity ? `x${item.quantity}` : "", item.unit]
    .filter(Boolean)
    .join(" • ");
}
