export const CARE_PROFILES = {
  ball_python: {
    name: "Ball Python",
    environment: {
      warmSide: { min: 88, max: 92 },
      coolSide: { min: 76, max: 80 },
      humidity: { min: 55, max: 75 },
    },
    feeding: {
      defaultFrequency: 14,
      foodOptions: ["Mouse", "Rat", "ASF Rat", "Chick"],
    },
    substrateOptions: [
      "Coco Husk",
      "Cypress Mulch",
      "Bioactive Tropical",
      "Paper Towels",
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

  corn_snake: {
    name: "Corn Snake",
    environment: {
      warmSide: { min: 84, max: 87 },
      coolSide: { min: 72, max: 75 },
      humidity: { min: 40, max: 60 },
    },
    feeding: {
      defaultFrequency: 7,
      foodOptions: ["Pinkie Mouse", "Fuzzy Mouse", "Hopper Mouse", "Adult Mouse"],
    },
    substrateOptions: ["Aspen", "Coco Fiber", "Bioactive Temperate", "Paper Towels"],
    temperamentOptions: ["Calm", "Flighty", "Curious", "Defensive", "Stressed"],
  },

  bearded_dragon: {
    name: "Bearded Dragon",
    environment: {
      basking: { min: 100, max: 110 },
      coolSide: { min: 75, max: 85 },
      humidity: { min: 30, max: 40 },
      uvb: true,
    },
    feeding: {
      defaultFrequency: 1,
      foodOptions: [
        "Dubia Roaches",
        "Crickets",
        "BSFL",
        "Collard Greens",
        "Mustard Greens",
        "Turnip Greens",
        "Squash",
        "Bell Pepper",
      ],
    },
    substrateOptions: ["Tile", "Paper Towels", "Bioactive Arid", "Excavator Clay"],
    temperamentOptions: [
      "Calm",
      "Alert",
      "Skittish",
      "Aggressive",
      "Lethargic",
      "Food motivated",
    ],
  },

  leopard_gecko: {
    name: "Leopard Gecko",
    environment: {
      warmSide: { min: 88, max: 92 },
      coolSide: { min: 74, max: 78 },
      humidity: { min: 30, max: 40 },
    },
    feeding: {
      defaultFrequency: 2,
      foodOptions: ["Dubia Roaches", "Mealworms", "Crickets", "BSFL"],
    },
    substrateOptions: ["Paper Towels", "Tile", "Bioactive Arid"],
    temperamentOptions: ["Calm", "Shy", "Skittish", "Defensive", "Stressed"],
  },

  dog: {
    name: "Dog",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Dry Food", "Wet Food", "Raw Diet", "Homemade"],
    },
    substrateOptions: [],
    temperamentOptions: ["Calm", "Playful", "Anxious", "Reactive", "Tired", "Excited"],
  },

  cat: {
    name: "Cat",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Dry Food", "Wet Food", "Prescription Diet"],
    },
    substrateOptions: [],
    temperamentOptions: ["Calm", "Playful", "Anxious", "Hiding", "Irritable", "Affectionate"],
  },

  freshwater_aquarium: {
    name: "Freshwater Aquarium",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Pellets", "Flakes", "Frozen Food", "Live Food"],
    },
    substrateOptions: ["Gravel", "Sand", "Bare Bottom", "Aquasoil"],
    temperamentOptions: ["Normal Activity", "Hiding", "Aggressive", "Lethargic", "Schooling"],
  },

  parrot: {
    name: "Parrot",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Pellets", "Seeds", "Vegetables", "Fruit"],
    },
    substrateOptions: [],
    temperamentOptions: ["Calm", "Vocal", "Nippy", "Affectionate", "Stressed"],
  },

  chicken: {
    name: "Chicken",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Layer Feed", "Scratch", "Mealworms", "Vegetables"],
    },
    substrateOptions: ["Pine Shavings", "Straw", "Sand", "Deep Litter"],
    temperamentOptions: ["Calm", "Broody", "Aggressive", "Lethargic", "Alert"],
  },

  horse: {
    name: "Horse",
    feeding: {
      defaultFrequency: 1,
      foodOptions: ["Hay", "Grain", "Pasture"],
    },
    substrateOptions: ["Shavings", "Straw", "Pellet Bedding", "Pasture"],
    temperamentOptions: ["Calm", "Anxious", "Spooky", "Energetic", "Lethargic"],
  },
};