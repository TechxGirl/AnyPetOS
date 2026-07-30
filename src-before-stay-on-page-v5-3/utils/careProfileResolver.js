import { CARE_PROFILES } from "../data/careProfiles";

// =====================================================
// 🟢 Care Profile Resolver
//
// Finds the best care profile for a selected species.
// Exact profiles win first. Generic group profiles are used
// when a species is in the taxonomy but does not have its own
// full profile yet.
//
// =====================================================

export function getCareKey(speciesName = "") {
  return String(speciesName)
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_")
    .replaceAll("'", "")
    .replaceAll("’", "")
    .replaceAll("/", "_")
    .replaceAll(".", "")
    .replaceAll("á", "a")
    .replaceAll("é", "e")
    .replaceAll("í", "i")
    .replaceAll("ó", "o")
    .replaceAll("ú", "u")
    .replaceAll("á", "a");
}

// =====================================================
// 🟢 Generic Beta Care Profiles
// =====================================================

const GENERIC_PROFILES = {
  reptile_snake: {
    name: "Snake",
    feeding: {
      defaultFrequency: 7,
      foodOptions: [
        "Pinkie Mouse",
        "Fuzzy Mouse",
        "Adult Mouse",
        "Small Rat",
        "Medium Rat",
        "Large Rat",
        "Chick",
        "Quail",
      ],
    },
    substrateOptions: [
      "Paper Towels",
      "Coco Husk",
      "Cypress Mulch",
      "Aspen",
      "Bioactive",
    ],
    temperamentOptions: [
      "Calm",
      "Shy",
      "Defensive",
      "Food motivated",
      "Curious",
      "Stressed",
    ],
  },

  reptile_lizard: {
    name: "Lizard",
    feeding: {
      defaultFrequency: 2,
      foodOptions: [
        "Dubia Roaches",
        "Crickets",
        "Mealworms",
        "Superworms",
        "BSFL",
        "Greens",
        "Vegetables",
        "Fruit",
        "Prepared Diet",
      ],
    },
    substrateOptions: [
      "Paper Towels",
      "Tile",
      "Coco Fiber",
      "Bioactive Arid",
      "Bioactive Tropical",
    ],
    temperamentOptions: [
      "Calm",
      "Alert",
      "Skittish",
      "Defensive",
      "Food motivated",
      "Stressed",
    ],
  },

  reptile_turtle: {
    name: "Turtle",
    feeding: {
      defaultFrequency: 1,
      foodOptions: [
        "Aquatic Turtle Pellets",
        "Greens",
        "Crickets",
        "Earthworms",
        "Fish",
        "Shrimp",
      ],
    },
    substrateOptions: ["Bare Bottom", "Sand", "River Rock", "Aquatic Setup"],
    temperamentOptions: ["Active", "Basking", "Hiding", "Lethargic", "Alert"],
  },

  reptile_tortoise: {
    name: "Tortoise",
    feeding: {
      defaultFrequency: 1,
      foodOptions: [
        "Grass Hay",
        "Weeds",
        "Leafy Greens",
        "Flowers",
        "Vegetables",
        "Tortoise Pellets",
      ],
    },
    substrateOptions: ["Topsoil Mix", "Coco Coir", "Orchid Bark", "Bioactive"],
    temperamentOptions: ["Calm", "Active", "Shy", "Food motivated", "Lethargic"],
  },

  amphibian_frog: {
    name: "Frog",
    feeding: {
      defaultFrequency: 2,
      foodOptions: ["Crickets", "Dubia Roaches", "Earthworms", "Waxworms"],
    },
    substrateOptions: ["Coco Fiber", "ABG Mix", "Bioactive Tropical", "Sphagnum Moss"],
    temperamentOptions: ["Active", "Hiding", "Skittish", "Lethargic"],
  },

  amphibian_toad: {
    name: "Toad",
    feeding: {
      defaultFrequency: 2,
      foodOptions: ["Crickets", "Dubia Roaches", "Earthworms", "Mealworms"],
    },
    substrateOptions: ["Coco Fiber", "Topsoil Mix", "Sphagnum Moss", "Bioactive"],
    temperamentOptions: ["Calm", "Burrowing", "Hiding", "Lethargic"],
  },

  amphibian_salamander: {
    name: "Salamander / Newt",
    feeding: {
      defaultFrequency: 2,
      foodOptions: ["Earthworms", "Blackworms", "Bloodworms", "Waxworms"],
    },
    substrateOptions: ["Coco Fiber", "Sphagnum Moss", "Aquatic Setup", "Bioactive"],
    temperamentOptions: ["Hiding", "Active at night", "Stressed", "Lethargic"],
  },

  arachnid_tarantula: {
    name: "Tarantula",
    feeding: {
      defaultFrequency: 7,
      foodOptions: ["Crickets", "Dubia Roaches", "Mealworms", "Superworms"],
    },
    substrateOptions: ["Coco Fiber", "Topsoil Mix", "Arboreal Setup", "Burrowing Setup"],
    temperamentOptions: ["Calm", "Defensive", "Bolty", "In premolt", "Hidden"],
  },

  arachnid_spider: {
    name: "Spider",
    feeding: {
      defaultFrequency: 3,
      foodOptions: ["Fruit Flies", "Crickets", "Mealworms", "Small Roaches"],
    },
    substrateOptions: ["Coco Fiber", "Bioactive", "Arboreal Setup"],
    temperamentOptions: ["Active", "Webbing", "Hiding", "Defensive"],
  },

  arachnid_scorpion: {
    name: "Scorpion",
    feeding: {
      defaultFrequency: 7,
      foodOptions: ["Crickets", "Dubia Roaches", "Mealworms", "Superworms"],
    },
    substrateOptions: ["Coco Fiber", "Sand Mix", "Burrowing Setup"],
    temperamentOptions: ["Calm", "Defensive", "Burrowing", "Hiding"],
  },

  invertebrate_isopod: {
    name: "Isopod",
    feeding: {
      defaultFrequency: 3,
      foodOptions: ["Leaf Litter", "Rotting Wood", "Vegetables", "Protein", "Calcium"],
    },
    substrateOptions: ["Bioactive Isopod Mix", "ABG Mix", "Leaf Litter"],
    temperamentOptions: ["Active", "Breeding", "Hiding", "Dry", "Stressed"],
  },

  invertebrate_default: {
    name: "Invertebrate",
    feeding: {
      defaultFrequency: 3,
      foodOptions: ["Vegetables", "Fruit", "Protein", "Prepared Diet", "Leaf Litter"],
    },
    substrateOptions: ["Coco Fiber", "Bioactive", "Species-Specific Setup"],
    temperamentOptions: ["Active", "Hiding", "Stressed", "Lethargic"],
  },

  fish_freshwater: {
    name: "Freshwater Fish",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Flakes", "Pellets", "Frozen Food", "Live Food", "Vegetables"],
    },
    substrateOptions: ["Gravel", "Sand", "Bare Bottom", "Aquasoil"],
    temperamentOptions: ["Normal Activity", "Hiding", "Aggressive", "Lethargic", "Schooling"],
  },

  fish_saltwater: {
    name: "Saltwater Fish",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Marine Pellets", "Frozen Food", "Nori", "Live Food"],
    },
    substrateOptions: ["Live Sand", "Bare Bottom", "Reef Setup"],
    temperamentOptions: ["Normal Activity", "Hiding", "Aggressive", "Lethargic"],
  },

  bird_default: {
    name: "Bird",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Pellets", "Seeds", "Vegetables", "Fruit", "Treats"],
    },
    substrateOptions: ["Paper Liner", "Pine Shavings", "Straw"],
    temperamentOptions: ["Calm", "Vocal", "Nippy", "Affectionate", "Stressed"],
  },

  mammal_rodent: {
    name: "Small Mammal",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Pellets", "Hay", "Vegetables", "Seeds", "Treats"],
    },
    substrateOptions: ["Paper Bedding", "Aspen", "Fleece", "Kiln-Dried Pine"],
    temperamentOptions: ["Calm", "Skittish", "Curious", "Reactive", "Tired"],
  },

  mammal_default: {
    name: "Mammal",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Dry Food", "Wet Food", "Hay", "Vegetables", "Species-Specific Diet"],
    },
    substrateOptions: ["Bedding", "Litter", "Pasture", "Species-Specific Housing"],
    temperamentOptions: ["Calm", "Playful", "Anxious", "Reactive", "Tired", "Excited"],
  },

  other_default: {
    name: "Custom Animal",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Custom Food"],
    },
    substrateOptions: ["Custom Housing"],
    temperamentOptions: ["Calm", "Active", "Hiding", "Stressed", "Unknown"],
  },
};

// =====================================================
// 🟢 Species Aliases
// =====================================================

const SPECIES_ALIASES = {
  boa_constrictor: "reptile_snake",
  red_tailed_boa: "reptile_snake",
  dumerils_boa: "reptile_snake",
  kenyan_sand_boa: "reptile_snake",
  rosy_boa: "reptile_snake",
  rubber_boa: "reptile_snake",
  carpet_python: "reptile_snake",
  jungle_carpet_python: "reptile_snake",
  coastal_carpet_python: "reptile_snake",
  green_tree_python: "reptile_snake",
  blood_python: "reptile_snake",
  short_tailed_python: "reptile_snake",
  hognose_snake: "reptile_snake",
  western_hognose: "reptile_snake",
  eastern_hognose: "reptile_snake",
  milk_snake: "reptile_snake",
  kingsnake: "reptile_snake",
  garter_snake: "reptile_snake",
  rat_snake: "reptile_snake",
  bullsnake: "reptile_snake",
  pine_snake: "reptile_snake",
  crested_gecko: "reptile_lizard",
  gargoyle_gecko: "reptile_lizard",
  chahoua_gecko: "reptile_lizard",
  tokay_gecko: "reptile_lizard",
  day_gecko: "reptile_lizard",
  african_fat_tailed_gecko: "reptile_lizard",
  blue_tongue_skink: "reptile_lizard",
  red_eyed_crocodile_skink: "reptile_lizard",
  ackie_monitor: "reptile_lizard",
  savannah_monitor: "reptile_lizard",
  green_iguana: "reptile_lizard",
  uromastyx: "reptile_lizard",
  painted_turtle: "reptile_turtle",
  red_eared_slider: "reptile_turtle",
  russian_tortoise: "reptile_tortoise",
  sulcata_tortoise: "reptile_tortoise",
  horse: "horse",
  pony: "horse",
  miniature_horse: "horse",
  dog: "dog",
  cat: "cat",
  chicken: "chicken",
  cockatiel: "parrot",
  budgie: "parrot",
  conure: "parrot",
};

// =====================================================
// 🟢 Group Fallbacks
// =====================================================

function getGroupFallbackKey(category = "", animalGroup = "") {
  const normalizedCategory = getCareKey(category);
  const normalizedGroup = getCareKey(animalGroup);

  if (normalizedCategory === "reptile" && normalizedGroup === "snake") return "reptile_snake";
  if (normalizedCategory === "reptile" && normalizedGroup === "lizard") return "reptile_lizard";
  if (normalizedCategory === "reptile" && normalizedGroup === "turtle") return "reptile_turtle";
  if (normalizedCategory === "reptile" && normalizedGroup === "tortoise") return "reptile_tortoise";

  if (normalizedCategory === "amphibian" && normalizedGroup === "frog") return "amphibian_frog";
  if (normalizedCategory === "amphibian" && normalizedGroup === "toad") return "amphibian_toad";
  if (normalizedCategory === "amphibian" && normalizedGroup === "salamander") return "amphibian_salamander";

  if (normalizedCategory === "arachnid" && normalizedGroup === "tarantula") return "arachnid_tarantula";
  if (normalizedCategory === "arachnid" && normalizedGroup === "spider") return "arachnid_spider";
  if (normalizedCategory === "arachnid" && normalizedGroup === "scorpion") return "arachnid_scorpion";

  if (normalizedCategory === "invertebrate" && normalizedGroup === "isopod") return "invertebrate_isopod";
  if (normalizedCategory === "invertebrate") return "invertebrate_default";

  if (normalizedCategory === "fish" && normalizedGroup === "saltwater") return "fish_saltwater";
  if (normalizedCategory === "fish") return "fish_freshwater";

  if (normalizedCategory === "bird") return "bird_default";
  if (normalizedCategory === "mammal" && normalizedGroup === "rodent") return "mammal_rodent";
  if (normalizedCategory === "mammal") return "mammal_default";

  return "other_default";
}

// =====================================================
// 🟢 Resolve Care Profile
// =====================================================

export function resolveCareProfile({
  species = "",
  category = "",
  animalGroup = "",
  careProfile = "",
} = {}) {
  const existingKey = getCareKey(careProfile);

  if (existingKey && CARE_PROFILES[existingKey]) {
    return {
      key: existingKey,
      profile: CARE_PROFILES[existingKey],
      source: "exact",
    };
  }

  const speciesKey = getCareKey(species);

  if (speciesKey && CARE_PROFILES[speciesKey]) {
    return {
      key: speciesKey,
      profile: CARE_PROFILES[speciesKey],
      source: "exact",
    };
  }

  const aliasKey = SPECIES_ALIASES[speciesKey];

  if (aliasKey) {
    return {
      key: aliasKey,
      profile: CARE_PROFILES[aliasKey] || GENERIC_PROFILES[aliasKey],
      source: "alias",
    };
  }

  const groupKey = getGroupFallbackKey(category, animalGroup);

  return {
    key: groupKey,
    profile: CARE_PROFILES[groupKey] || GENERIC_PROFILES[groupKey] || GENERIC_PROFILES.other_default,
    source: "group",
  };
}
