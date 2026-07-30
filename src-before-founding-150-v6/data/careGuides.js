// =====================================================
// 🟢 Care Guide Data v1
//
// Detailed guides are source-backed starter guides. Fallback guides
// give safe category-level scaffolding for every species in the app
// without pretending that every species has a complete custom guide yet.
// =====================================================

import { ANIMAL_TAXONOMY } from "./animalTaxonomy";
import { getCareKey } from "../utils/careProfileResolver";

const LAST_REVIEWED = "July 2026";

export const CARE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const CARE_GUIDE_SOURCES = {
  reptifiles: {
    label: "ReptiFiles husbandry guides",
    url: "https://reptifiles.com/",
  },
  merckReptileHusbandry: {
    label: "Merck Veterinary Manual — reptile husbandry",
    url: "https://www.merckvetmanual.com/exotic-and-laboratory-animals/reptiles/management-and-husbandry-of-reptiles",
  },
  petMd: {
    label: "PetMD veterinary care sheets",
    url: "https://www.petmd.com/",
  },
  avianFallback: {
    label: "General avian husbandry starter guidance",
    url: "",
  },
  aquariumFallback: {
    label: "General aquarium husbandry starter guidance",
    url: "",
  },
};

const DETAILED_GUIDES = {
  ball_python: {
    species: "Ball Python",
    category: "Reptile",
    group: "Snake",
    status: "verified-starter",
    difficulty: "Intermediate",
    summary: "A heavy-bodied, humidity-sensitive snake that benefits from stable hides, a secure enclosure, and careful feeding records.",
    environment: [
      { label: "Warm hide", value: "88–92°F" },
      { label: "Cool side", value: "76–80°F" },
      { label: "Humidity", value: "55–75% with good ventilation" },
      { label: "Lighting", value: "Day/night cycle; UVB optional but increasingly used" },
    ],
    feeding: {
      strategy: "Prey items",
      frequency: "Juveniles often 5–7 days; many adults 14–21+ days depending on body condition.",
      foods: ["Mouse", "Rat", "ASF Rat", "Chick", "Quail"],
      sizes: ["Mouse sizes", "Rat sizes", "Bird prey sizes"],
      notes: "Log prey type, prey size, accepted/refused result, and body weight trends. Avoid repeated oversized meals.",
    },
    substrate: ["Coco husk", "Cypress mulch", "Bioactive tropical", "Paper towels for quarantine"],
    healthWarnings: ["Wheezing/clicking", "Bubbles or excess saliva", "Repeated refusals with weight loss", "Mites", "Stuck shed"],
    commonMistakes: ["Humidity without ventilation", "No secure hides", "Handling too soon after feeding", "Feeding by calendar only instead of body condition"],
    recommendedLogs: ["Feeding", "Weight", "Shed", "Humidity", "Medication", "Quarantine"],
    sources: ["reptifiles", "merckReptileHusbandry"],
    lastReviewed: LAST_REVIEWED,
  },

  corn_snake: {
    species: "Corn Snake",
    category: "Reptile",
    group: "Snake",
    status: "verified-starter",
    difficulty: "Beginner",
    summary: "An active colubrid that benefits from secure lids, climbing enrichment, and feeding intervals that change with age and body condition.",
    environment: [
      { label: "Warm side", value: "84–87°F" },
      { label: "Cool side", value: "72–78°F" },
      { label: "Humidity", value: "Moderate; often 50–75% depending setup/subspecies" },
      { label: "Security", value: "Escape-proof enclosure is critical" },
    ],
    feeding: {
      strategy: "Mouse prey",
      frequency: "Hatchlings often 5–7 days; adults commonly 14–21 days; adjust for condition.",
      foods: ["Mouse"],
      sizes: ["Pinky Mouse", "Fuzzy Mouse", "Hopper Mouse", "Weaned Mouse", "Adult Mouse", "Jumbo Mouse"],
      notes: "Log prey size and refusal/regurgitation events. Wait after regurgitation before offering again.",
    },
    substrate: ["Aspen", "Coco fiber", "Bioactive temperate", "Paper towels for quarantine"],
    healthWarnings: ["Escapes", "Regurgitation", "Respiratory signs", "Poor sheds", "Mites"],
    commonMistakes: ["Loose lid", "No humidity gradient", "Overfeeding adults", "Too little enrichment"],
    recommendedLogs: ["Feeding", "Weight", "Shed", "Escape notes", "Quarantine"],
    sources: ["reptifiles", "merckReptileHusbandry"],
    lastReviewed: LAST_REVIEWED,
  },

  leopard_gecko: {
    species: "Leopard Gecko",
    category: "Reptile",
    group: "Lizard",
    status: "verified-starter",
    difficulty: "Beginner",
    summary: "A terrestrial insectivore that needs a dry, well-ventilated setup, proper heat gradient, and supplementation tracking.",
    environment: [
      { label: "Basking surface", value: "About 94–97°F" },
      { label: "Warm hide", value: "90–92°F" },
      { label: "Cool zone", value: "70–77°F" },
      { label: "Humidity", value: "30–40% daytime with a humid hide" },
    ],
    feeding: {
      strategy: "Insects",
      frequency: "Juveniles often daily; adults commonly every 2–4 days depending body condition.",
      foods: ["Dubia Roaches", "Crickets", "Mealworms", "BSFL", "Silkworms"],
      sizes: ["Small", "Medium", "Large", "Adult"],
      notes: "Log gut-loading, calcium/vitamin dusting, and appetite changes. Avoid insects wider than appropriate for the animal.",
    },
    substrate: ["Paper towels", "Tile", "Bioactive arid", "Safe soil/sand mixes when appropriate"],
    healthWarnings: ["Thin tail", "Stuck shed on toes", "Lethargy", "Mouth issues", "Poor appetite"],
    commonMistakes: ["No humid hide", "Unsafe loose substrate for compromised animals", "No supplement tracking", "Too much constant humidity"],
    recommendedLogs: ["Feeding", "Weight", "Shed", "Supplements", "Humidity"],
    sources: ["reptifiles", "petMd", "merckReptileHusbandry"],
    lastReviewed: LAST_REVIEWED,
  },

  bearded_dragon: {
    species: "Bearded Dragon",
    category: "Reptile",
    group: "Lizard",
    status: "verified-starter",
    difficulty: "Intermediate",
    summary: "A high-UVB omnivorous lizard where lighting, basking, diet balance, and supplement logs matter a lot.",
    environment: [
      { label: "Basking", value: "High basking zone; age/setup dependent" },
      { label: "Cool side", value: "Generally mid-70s to mid-80s°F" },
      { label: "Humidity", value: "Usually arid/moderate; avoid damp stagnant setup" },
      { label: "UVB", value: "High-quality UVB is essential" },
    ],
    feeding: {
      strategy: "Omnivore",
      frequency: "Young dragons eat more insects; adults shift more heavily toward greens/vegetation.",
      foods: ["Dubia Roaches", "Crickets", "BSFL", "Collard Greens", "Mustard Greens", "Turnip Greens", "Squash"],
      sizes: ["Small", "Medium", "Large", "Leaf", "Pieces", "Serving"],
      notes: "Log insects, greens, calcium/vitamins, and appetite. Separate insect size from greens amount.",
    },
    substrate: ["Tile", "Paper towels", "Bioactive arid", "Safe loose mixes for healthy adults when appropriate"],
    healthWarnings: ["Weakness/tremors", "Swollen limbs", "Poor appetite", "Lethargy", "Abnormal stool"],
    commonMistakes: ["Weak UVB", "No temperature gradient", "Wrong insect/greens balance", "No supplement tracking"],
    recommendedLogs: ["Feeding", "Supplements", "Weight", "UVB replacement", "Basking temps"],
    sources: ["reptifiles", "merckReptileHusbandry"],
    lastReviewed: LAST_REVIEWED,
  },

  crested_gecko: {
    species: "Crested Gecko",
    category: "Reptile",
    group: "Lizard",
    status: "verified-starter",
    difficulty: "Beginner",
    summary: "An arboreal gecko that needs vertical space, misting/dry-out cycles, and a quality prepared gecko diet with insects as enrichment.",
    environment: [
      { label: "Temperature", value: "Generally comfortable room temps; avoid overheating" },
      { label: "Humidity", value: "60–80% peaks with dry-out periods" },
      { label: "Lighting", value: "Low-level UVB optional/beneficial when set up correctly" },
      { label: "Space", value: "Vertical enclosure with cover and climbing" },
    ],
    feeding: {
      strategy: "Prepared diet + insects",
      frequency: "Prepared diet several times weekly; insects as appropriate for age/condition.",
      foods: ["Crested Gecko Diet", "Pangea", "Repashy", "Dubia Roaches", "Crickets"],
      sizes: ["Small", "Medium", "Serving", "Custom"],
      notes: "Log prepared diet flavor, insect offerings, and refusals. Track weight for juveniles and breeders.",
    },
    substrate: ["Paper towels", "Coco fiber", "Bioactive tropical", "ABG mix"],
    healthWarnings: ["Weight loss", "Stuck shed", "Floppy tail concerns", "Lethargy", "Dehydration"],
    commonMistakes: ["Constantly wet enclosure", "Overheating", "Too little cover", "No feeding consistency"],
    recommendedLogs: ["Feeding", "Weight", "Humidity", "Shed", "Breeding notes"],
    sources: ["reptifiles", "merckReptileHusbandry"],
    lastReviewed: LAST_REVIEWED,
  },

  axolotl: {
    species: "Axolotl",
    category: "Amphibian",
    group: "Salamander",
    status: "verified-starter",
    difficulty: "Intermediate",
    summary: "A fully aquatic amphibian where cool, clean, cycled water and careful feeding/water quality logs are central.",
    environment: [
      { label: "Water temperature", value: "Cool water; avoid sustained warmth" },
      { label: "Water quality", value: "Cycled tank; ammonia/nitrite should be controlled" },
      { label: "Substrate", value: "Bare bottom or safe large substrate; avoid ingestible gravel" },
      { label: "Lighting", value: "Low light with hides" },
    ],
    feeding: {
      strategy: "Aquatic carnivore",
      frequency: "Juveniles more often; adults commonly several times weekly depending size/body condition.",
      foods: ["Earthworms", "Axolotl Pellets", "Bloodworms", "Blackworms"],
      sizes: ["Small", "Medium", "Large", "Pieces", "Custom"],
      notes: "Log food, amount, refusals, and water temperature/water quality changes together.",
    },
    substrate: ["Bare bottom", "Fine sand for appropriate size/age", "Large smooth stones"],
    healthWarnings: ["Floating", "Curled gills", "Fungal growth", "Lethargy", "Poor appetite"],
    commonMistakes: ["Warm water", "Uncycled tank", "Unsafe gravel", "Strong flow"],
    recommendedLogs: ["Feeding", "Water temperature", "Water test", "Health notes"],
    sources: ["petMd"],
    lastReviewed: LAST_REVIEWED,
  },
};

const FALLBACK_GUIDES = {
  reptile_snake: {
    title: "Snake starter guide",
    difficulty: "Intermediate",
    summary: "A safe snake scaffold until a species-specific guide is added. Confirm exact temperatures, humidity, enclosure security, and feeding interval for the species.",
    environment: [
      { label: "Heat", value: "Controlled warm/cool gradient with hides" },
      { label: "Humidity", value: "Species-specific with good ventilation" },
      { label: "Security", value: "Escape-proof enclosure and secure hides" },
    ],
    feeding: {
      strategy: "Whole prey",
      frequency: "Age, species, season, and body-condition dependent",
      foods: ["Mouse", "Rat", "ASF Rat", "Chick", "Quail", "Other"],
      sizes: ["Pinkie", "Fuzzy", "Hopper", "Weaned", "Small", "Medium", "Large", "Jumbo"],
      notes: "Log accepted/refused, prey type, prey size, and any shed/stress context.",
    },
    substrate: ["Paper towels for quarantine", "Aspen for appropriate species", "Coco husk/fiber", "Bioactive when appropriate"],
    healthWarnings: ["Respiratory signs", "Mites", "Stuck shed", "Weight loss", "Regurgitation"],
    commonMistakes: ["Wrong humidity", "Poor ventilation", "Insecure lid", "Overfeeding", "No quarantine notes"],
    recommendedLogs: ["Feeding", "Weight", "Shed", "Quarantine", "Health notes"],
    sources: ["merckReptileHusbandry"],
  },

  reptile_lizard: {
    title: "Lizard starter guide",
    difficulty: "Intermediate",
    summary: "A broad lizard scaffold. Confirm basking temperatures, UVB level, humidity, enclosure style, and diet for the exact species.",
    environment: [
      { label: "Heat / UVB", value: "Species-specific basking, gradient, and UVB" },
      { label: "Humidity", value: "Species-specific; avoid stagnant extremes" },
      { label: "Enrichment", value: "Hides, climbing, digging, basking, or cover as needed" },
    ],
    feeding: {
      strategy: "Species diet",
      frequency: "Species, age, and body-condition dependent",
      foods: ["Insects", "Greens", "Vegetables", "Fruit", "Prepared Diet", "Other"],
      sizes: ["Pinhead", "Small", "Medium", "Large", "Adult", "Serving", "Custom"],
      notes: "Log supplements, insect size, plant portions, appetite, and refusals.",
    },
    substrate: ["Paper towels for quarantine", "Tile", "Soil/sand mix", "Bioactive", "Species-appropriate setup"],
    healthWarnings: ["Poor appetite", "Weakness", "Stuck shed", "Lethargy", "Abnormal stool"],
    commonMistakes: ["Wrong UVB", "Wrong supplement schedule", "Unsafe substrate", "No gradient", "No hide choices"],
    recommendedLogs: ["Feeding", "Supplements", "Weight", "Shed", "Temps/UVB"],
    sources: ["merckReptileHusbandry"],
  },

  reptile_turtle: {
    title: "Aquatic turtle starter guide",
    difficulty: "Intermediate",
    summary: "Aquatic turtles need water quality, basking, UVB, filtration, and diet records tracked together.",
    environment: [
      { label: "Water", value: "Filtered, cycled, species-appropriate aquatic setup" },
      { label: "Basking", value: "Dry basking platform with heat and UVB" },
      { label: "Cleaning", value: "Water quality and filtration matter" },
    ],
    feeding: {
      strategy: "Mixed aquatic",
      frequency: "Age and species dependent",
      foods: ["Turtle Pellets", "Greens", "Fish", "Shrimp", "Insects", "Other"],
      sizes: ["Pellet serving", "Pieces", "Small portion", "Medium portion", "Custom"],
      notes: "Track feeding together with water quality and weight/body condition.",
    },
    substrate: ["Bare bottom", "Sand", "River rock", "Species-appropriate aquatic setup"],
    healthWarnings: ["Swollen eyes", "Shell issues", "Floating oddly", "Poor appetite", "Lethargy"],
    commonMistakes: ["No UVB", "Weak filtration", "No basking dock", "Poor water quality"],
    recommendedLogs: ["Feeding", "Water change", "Water tests", "UVB replacement", "Weight"],
    sources: ["merckReptileHusbandry"],
  },

  reptile_tortoise: {
    title: "Tortoise starter guide",
    difficulty: "Advanced",
    summary: "Tortoises need species-specific diet, UVB, space, humidity, hydration, and shell-growth tracking.",
    environment: [
      { label: "UVB", value: "Usually essential; species/setup dependent" },
      { label: "Humidity", value: "Species and age dependent" },
      { label: "Space", value: "Large enclosure or safe outdoor access when appropriate" },
    ],
    feeding: {
      strategy: "Forage / greens",
      frequency: "Usually frequent plant-based meals; exact diet varies by species",
      foods: ["Grass Hay", "Weeds", "Leafy Greens", "Flowers", "Vegetables", "Other"],
      sizes: ["Leaf", "Handful", "Serving", "Grams", "Custom"],
      notes: "Track plant variety, hydration, shell condition, and weight. Use fruit only when species-appropriate.",
    },
    substrate: ["Topsoil mix", "Coco coir", "Orchid bark", "Outdoor-safe grazing area"],
    healthWarnings: ["Pyramiding", "Soft shell", "Runny nose", "Poor appetite", "Lethargy"],
    commonMistakes: ["Wrong humidity", "Too much fruit", "No UVB", "Small enclosure", "No hydration tracking"],
    recommendedLogs: ["Feeding", "Weight", "Shell notes", "UVB replacement", "Hydration"],
    sources: ["merckReptileHusbandry"],
  },

  amphibian_frog: {
    title: "Frog starter guide",
    difficulty: "Intermediate",
    summary: "Frogs are moisture-sensitive and often food-response driven. Track humidity, temperature, clean water, feeding response, and skin/behavior changes.",
    environment: [
      { label: "Moisture", value: "Species-specific humidity and hydration" },
      { label: "Water", value: "Dechlorinated, clean, and species-appropriate" },
      { label: "Handling", value: "Minimal; protect skin from oils/chemicals" },
    ],
    feeding: {
      strategy: "Live feeders",
      frequency: "Species, age, and body-condition dependent",
      foods: ["Crickets", "Dubia Roaches", "Earthworms", "Fruit Flies", "Waxworms", "Other"],
      sizes: ["Pinhead", "Small", "Medium", "Large", "Custom"],
      notes: "Log prey size, supplements, refusals, and environment changes.",
    },
    substrate: ["Coco fiber", "Sphagnum moss", "Leaf litter", "Bioactive", "Aquatic/semi-aquatic setup"],
    healthWarnings: ["Lethargy", "Bloat", "Skin changes", "Poor appetite", "Abnormal posture"],
    commonMistakes: ["Untreated water", "Wrong temperatures", "Handling too much", "Poor ventilation", "No supplement notes"],
    recommendedLogs: ["Feeding", "Humidity", "Water quality", "Supplements", "Health notes"],
    sources: ["petMd"],
  },

  amphibian_default: {
    title: "Amphibian starter guide",
    difficulty: "Intermediate",
    summary: "Amphibians are sensitive to water quality, humidity, temperature, and chemicals. Confirm exact species needs before using any generic schedule.",
    environment: [
      { label: "Moisture", value: "Species-specific; avoid extremes" },
      { label: "Water", value: "Dechlorinated and clean" },
      { label: "Handling", value: "Minimal, clean wet hands/gloves when needed" },
    ],
    feeding: {
      strategy: "Live / aquatic",
      frequency: "Species and age dependent",
      foods: ["Crickets", "Earthworms", "Bloodworms", "Pellets", "Other"],
      sizes: ["Small", "Medium", "Large", "Pieces", "Custom"],
      notes: "Log refusals and water/environment changes together.",
    },
    substrate: ["Coco fiber", "Sphagnum moss", "Aquatic setup", "Bioactive"],
    healthWarnings: ["Lethargy", "Bloat", "Skin changes", "Floating issues", "Poor appetite"],
    commonMistakes: ["Untreated water", "Wrong temperatures", "Handling too much", "Poor ventilation"],
    recommendedLogs: ["Feeding", "Water quality", "Humidity", "Health notes"],
    sources: ["petMd"],
  },

  arachnid_tarantula: {
    title: "Tarantula starter guide",
    difficulty: "Intermediate",
    summary: "Tarantulas need the correct enclosure style, molt-safe feeding practices, secure ventilation, and species-specific moisture/substrate.",
    environment: [
      { label: "Setup", value: "Terrestrial, arboreal, or burrowing by species" },
      { label: "Moisture", value: "Species-specific moisture gradient" },
      { label: "Molting", value: "Do not disturb or leave prey during molt" },
    ],
    feeding: {
      strategy: "Insects",
      frequency: "Size, species, and molt cycle dependent",
      foods: ["Crickets", "Dubia Roaches", "Mealworms", "Superworms", "Roaches", "Other"],
      sizes: ["Pinhead", "Small", "Medium", "Large", "Adult", "Custom"],
      notes: "Log premolt refusals, molts, and remove uneaten prey.",
    },
    substrate: ["Coco fiber", "Topsoil mix", "Deep burrowing substrate", "Arboreal cork/branches"],
    healthWarnings: ["Molt problems", "Dehydration", "Injury/fall", "Abnormal abdomen", "Refusal outside premolt"],
    commonMistakes: ["Too much handling", "Leaving prey during molt", "Wrong enclosure height", "Poor ventilation"],
    recommendedLogs: ["Feeding", "Molt", "Refusals", "Humidity/moisture notes"],
    sources: ["merckReptileHusbandry"],
  },

  arachnid_spider: {
    title: "Spider starter guide",
    difficulty: "Intermediate",
    summary: "True spider care varies widely. Track enclosure style, feeding response, molts, moisture, and safety for the specific species.",
    environment: [
      { label: "Setup", value: "Species-specific: arboreal, terrestrial, or web-heavy" },
      { label: "Ventilation", value: "Good airflow without unsafe gaps" },
      { label: "Moisture", value: "Species-specific; avoid stagnant wetness" },
    ],
    feeding: {
      strategy: "Small insects",
      frequency: "Species and size dependent",
      foods: ["Fruit Flies", "Crickets", "Roaches", "Mealworms", "Flies", "Other"],
      sizes: ["Tiny", "Pinhead", "Small", "Medium", "Custom"],
      notes: "Log appetite, molts, webbing, egg sacs, and remove unsafe prey.",
    },
    substrate: ["Coco fiber", "Bioactive", "Paper/twig setup", "Arboreal enclosure"],
    healthWarnings: ["Failed molt", "Dehydration", "Injury", "Poor grip", "Unusual inactivity"],
    commonMistakes: ["Oversized prey", "Unsafe ventilation gaps", "Too much disturbance", "Wrong enclosure style"],
    recommendedLogs: ["Feeding", "Molt", "Webbing", "Moisture notes"],
    sources: ["merckReptileHusbandry"],
  },

  arachnid_scorpion: {
    title: "Scorpion starter guide",
    difficulty: "Advanced",
    summary: "Scorpions require secure enclosures, careful handling avoidance, species-specific moisture, and molt-safe feeding practices.",
    environment: [
      { label: "Security", value: "Escape-proof enclosure" },
      { label: "Moisture", value: "Desert/tropical needs vary widely" },
      { label: "Safety", value: "Avoid handling; use tools and secure lids" },
    ],
    feeding: {
      strategy: "Insects",
      frequency: "Species, size, and molt cycle dependent",
      foods: ["Crickets", "Dubia Roaches", "Mealworms", "Roaches", "Other"],
      sizes: ["Small", "Medium", "Large", "Adult", "Custom"],
      notes: "Log molts, refusals, and remove uneaten prey.",
    },
    substrate: ["Arid sand/soil mix", "Coco fiber", "Deep burrowing substrate", "Hides"],
    healthWarnings: ["Failed molt", "Dehydration", "Injury", "Prolonged abnormal posture"],
    commonMistakes: ["Insecure enclosure", "Wrong humidity", "Handling", "Leaving prey during molt"],
    recommendedLogs: ["Feeding", "Molt", "Moisture", "Security checks"],
    sources: ["merckReptileHusbandry"],
  },

  arachnid_default: {
    title: "Arachnid starter guide",
    difficulty: "Intermediate",
    summary: "Arachnids need species-specific enclosure style, substrate depth, moisture gradient, and molt-safe care.",
    environment: [
      { label: "Setup", value: "Terrestrial/arboreal/burrowing by species" },
      { label: "Water", value: "Water dish or moisture strategy when appropriate" },
      { label: "Molting", value: "Do not disturb during molt/premolt" },
    ],
    feeding: {
      strategy: "Insects",
      frequency: "Species, size, and molt-cycle dependent",
      foods: ["Crickets", "Dubia Roaches", "Mealworms", "Superworms", "Other"],
      sizes: ["Small", "Medium", "Large", "Adult", "Custom"],
      notes: "Remove uneaten prey if the animal is in premolt.",
    },
    substrate: ["Coco fiber", "Topsoil mix", "Burrowing setup", "Arboreal setup"],
    healthWarnings: ["Molt problems", "Dehydration", "Injury/fall", "Refusal during premolt"],
    commonMistakes: ["Too much handling", "Leaving prey during molt", "Wrong enclosure style", "Poor ventilation"],
    recommendedLogs: ["Feeding", "Molt", "Refusals", "Humidity/moisture notes"],
    sources: ["merckReptileHusbandry"],
  },

  invertebrate_isopod: {
    title: "Isopod colony starter guide",
    difficulty: "Beginner",
    summary: "Isopods are colony animals. Track moisture gradient, ventilation, leaf litter, calcium, protein, and colony changes instead of treating them like a single pet.",
    environment: [
      { label: "Moisture", value: "Moist/dry gradient; species-specific humidity" },
      { label: "Ventilation", value: "Airflow without drying the entire bin" },
      { label: "Calcium", value: "Cuttlebone/eggshell or other safe calcium source" },
    ],
    feeding: {
      strategy: "Detritivore",
      frequency: "Small supplemental foods as needed; remove moldy leftovers",
      foods: ["Leaf Litter", "Vegetables", "Fish Flakes", "Protein", "Calcium", "Prepared Isopod Food", "Other"],
      sizes: ["Pinch", "Pieces", "Small serving", "Custom"],
      notes: "Log food type, mold, molts, babies, die-offs, and moisture changes.",
    },
    substrate: ["Bioactive mix", "Leaf litter", "Rotting wood", "Sphagnum moss", "Calcium source"],
    healthWarnings: ["Die-offs", "Mold bloom", "Dryness", "Failed molts", "No babies over time"],
    commonMistakes: ["No moisture gradient", "Too much food", "No calcium", "No leaf litter", "Stagnant wet conditions"],
    recommendedLogs: ["Feeding", "Moisture", "Colony notes", "Breeding", "Die-offs"],
    sources: ["merckReptileHusbandry"],
  },

  invertebrate_millipede: {
    title: "Millipede starter guide",
    difficulty: "Intermediate",
    summary: "Millipedes depend on deep, safe substrate, steady moisture, decaying plant matter, calcium access, and low-stress handling.",
    environment: [
      { label: "Substrate", value: "Deep organic substrate for burrowing" },
      { label: "Moisture", value: "Moist but not stagnant; species-specific" },
      { label: "Ventilation", value: "Good airflow with stable humidity" },
    ],
    feeding: {
      strategy: "Plant / detritus",
      frequency: "Supplement plant foods while maintaining leaf litter/wood base",
      foods: ["Leaf Litter", "Rotting Wood", "Vegetables", "Fruit", "Calcium", "Other"],
      sizes: ["Pieces", "Small serving", "Custom"],
      notes: "Log substrate moisture, food removal, molts, and surface activity.",
    },
    substrate: ["Deep organic soil mix", "Leaf litter", "Rotting hardwood", "Sphagnum patches"],
    healthWarnings: ["Surface stress", "Failed molts", "Dryness", "Die-offs", "Mold issues"],
    commonMistakes: ["Shallow substrate", "Dry setup", "Unsafe wood/leaves", "Too much fruit", "Rough handling"],
    recommendedLogs: ["Feeding", "Moisture", "Substrate changes", "Molt/activity notes"],
    sources: ["merckReptileHusbandry"],
  },

  invertebrate_centipede: {
    title: "Centipede starter guide",
    difficulty: "Advanced",
    summary: "Centipedes are fast, defensive predators that require escape-proof enclosures, careful tool-based care, and species-specific moisture.",
    environment: [
      { label: "Security", value: "Escape-proof enclosure with locking lid" },
      { label: "Moisture", value: "Species-specific moisture gradient" },
      { label: "Safety", value: "No handling; use tools and caution" },
    ],
    feeding: {
      strategy: "Predatory insects",
      frequency: "Species, size, and body-condition dependent",
      foods: ["Crickets", "Roaches", "Mealworms", "Superworms", "Other"],
      sizes: ["Small", "Medium", "Large", "Adult", "Custom"],
      notes: "Log feeding response, refusals, molts, and enclosure security checks.",
    },
    substrate: ["Deep soil/coco mix", "Cork hides", "Leaf litter", "Moisture gradient"],
    healthWarnings: ["Failed molt", "Injury", "Dehydration", "Escape attempts", "Refusal outside molt cycle"],
    commonMistakes: ["Handling", "Insecure lid", "Wrong moisture", "Oversized prey", "Too much disturbance"],
    recommendedLogs: ["Feeding", "Molt", "Moisture", "Security checks"],
    sources: ["merckReptileHusbandry"],
  },

  invertebrate_mantis: {
    title: "Mantis starter guide",
    difficulty: "Intermediate",
    summary: "Mantises need safe molting height, good ventilation, correct prey size, and species-specific humidity.",
    environment: [
      { label: "Height", value: "Enough vertical space for safe molts" },
      { label: "Ventilation", value: "Good airflow; avoid stagnant wetness" },
      { label: "Humidity", value: "Species-specific misting/dry-out cycle" },
    ],
    feeding: {
      strategy: "Flying / soft prey",
      frequency: "Size, species, and molt cycle dependent",
      foods: ["Fruit Flies", "Blue Bottle Flies", "House Flies", "Roaches", "Crickets", "Other"],
      sizes: ["Tiny", "Small", "Medium", "Large", "Custom"],
      notes: "Log prey type, molt timing, missed molts, and refusals.",
    },
    substrate: ["Paper towel", "Coco fiber", "Bioactive", "Perches/mesh for molting"],
    healthWarnings: ["Bad molt", "Fallen during molt", "Dehydration", "Refusal outside premolt"],
    commonMistakes: ["Too little molt height", "Oversized prey", "Poor ventilation", "Over-misting", "Handling during premolt"],
    recommendedLogs: ["Feeding", "Molt", "Misting", "Behavior"],
    sources: ["merckReptileHusbandry"],
  },

  invertebrate_beetle: {
    title: "Beetle starter guide",
    difficulty: "Beginner",
    summary: "Beetle care ranges from simple dry setups to specialized larval substrate. Track food, humidity, substrate, and life stage.",
    environment: [
      { label: "Life stage", value: "Larvae and adults may need different care" },
      { label: "Substrate", value: "Species/life-stage specific" },
      { label: "Moisture", value: "Avoid extremes; species dependent" },
    ],
    feeding: {
      strategy: "Plant / prepared",
      frequency: "Small offerings as needed; remove spoiled food",
      foods: ["Vegetables", "Fruit", "Beetle Jelly", "Leaf Litter", "Rotting Wood", "Other"],
      sizes: ["Pieces", "Small serving", "Custom"],
      notes: "Log life stage, substrate condition, food removal, and activity.",
    },
    substrate: ["Sand/soil mix", "Leaf litter", "Rotting wood", "Species-specific larval substrate"],
    healthWarnings: ["Die-offs", "Failed molts", "Mold", "Dryness", "Low activity"],
    commonMistakes: ["Wrong larval substrate", "Too much wet food", "No hides", "Wrong moisture"],
    recommendedLogs: ["Feeding", "Life stage", "Substrate", "Activity notes"],
    sources: ["merckReptileHusbandry"],
  },

  invertebrate_roach: {
    title: "Roach colony starter guide",
    difficulty: "Beginner",
    summary: "Roach colonies rely on ventilation, food, hydration strategy, temperature stability, and clean colony maintenance.",
    environment: [
      { label: "Ventilation", value: "Good airflow with secure containment" },
      { label: "Hydration", value: "Safe water crystals/produce strategy as appropriate" },
      { label: "Colony", value: "Track population and cleaning" },
    ],
    feeding: {
      strategy: "Colony feed",
      frequency: "Offer dry feed and safe fresh foods; remove spoilage",
      foods: ["Roach Chow", "Vegetables", "Fruit", "Fish Flakes", "Protein", "Other"],
      sizes: ["Pinch", "Small serving", "Medium serving", "Custom"],
      notes: "Log die-offs, breeding, cleaning, and food spoilage.",
    },
    substrate: ["Egg crate", "Bare bottom colony bin", "Dry substrate if species appropriate"],
    healthWarnings: ["Die-offs", "Mold", "Mites", "Odor", "No breeding"],
    commonMistakes: ["Poor ventilation", "Too much wet food", "Escapes", "No cleaning routine"],
    recommendedLogs: ["Feeding", "Cleaning", "Colony notes", "Breeding"],
    sources: ["merckReptileHusbandry"],
  },

  invertebrate_snail: {
    title: "Snail starter guide",
    difficulty: "Beginner",
    summary: "Snails need safe moisture, calcium, appropriate substrate, ventilation, and species-safe foods.",
    environment: [
      { label: "Moisture", value: "Consistent moisture without stagnant conditions" },
      { label: "Calcium", value: "Calcium source for shell health" },
      { label: "Ventilation", value: "Airflow with humidity retention" },
    ],
    feeding: {
      strategy: "Plant / calcium",
      frequency: "Small fresh foods; remove spoilage",
      foods: ["Vegetables", "Leafy Greens", "Fruit", "Calcium", "Prepared Snail Food", "Other"],
      sizes: ["Pieces", "Leaf", "Small serving", "Custom"],
      notes: "Log shell condition, appetite, moisture, and food spoilage.",
    },
    substrate: ["Coco fiber", "Topsoil mix", "Leaf litter", "Sphagnum moss"],
    healthWarnings: ["Shell damage", "Dryness", "Inactivity", "Mold issues", "Poor appetite"],
    commonMistakes: ["No calcium", "Unsafe foods", "Too dry", "No ventilation", "Dirty substrate"],
    recommendedLogs: ["Feeding", "Moisture", "Shell notes", "Cleaning"],
    sources: ["merckReptileHusbandry"],
  },

  invertebrate_aquatic: {
    title: "Aquatic invertebrate starter guide",
    difficulty: "Intermediate",
    summary: "Aquatic invertebrates need stable water quality, careful feeding amounts, species-safe tankmates, and copper/chemical awareness.",
    environment: [
      { label: "Water quality", value: "Stable cycled water; species-specific parameters" },
      { label: "Safety", value: "Avoid unsafe chemicals and incompatible tankmates" },
      { label: "Feeding", value: "Small amounts; avoid fouling water" },
    ],
    feeding: {
      strategy: "Aquatic portions",
      frequency: "Species, colony size, and tank biofilm dependent",
      foods: ["Algae Wafers", "Shrimp Pellets", "Vegetables", "Biofilm", "Prepared Food", "Other"],
      sizes: ["Tiny portion", "Small portion", "Pieces", "Custom"],
      notes: "Log molts, deaths, water changes, and feeding response.",
    },
    substrate: ["Aquatic substrate", "Sand", "Planted tank", "Hides/shells where appropriate"],
    healthWarnings: ["Failed molts", "Die-offs", "Lethargy", "Color loss", "Water quality problems"],
    commonMistakes: ["Overfeeding", "Unstable water", "Unsafe tankmates", "Chemical exposure"],
    recommendedLogs: ["Feeding", "Water tests", "Water changes", "Molt/death notes"],
    sources: ["aquariumFallback"],
  },

  invertebrate_default: {
    title: "Invertebrate starter guide",
    difficulty: "Intermediate",
    summary: "Invertebrate care depends on the animal’s life stage, diet, moisture, ventilation, substrate, colony behavior, and molt/breeding cycle.",
    environment: [
      { label: "Moisture", value: "Species-specific gradient" },
      { label: "Ventilation", value: "Avoid stagnant conditions" },
      { label: "Substrate", value: "Often essential for burrowing/breeding" },
    ],
    feeding: {
      strategy: "Species diet",
      frequency: "Species and life-stage dependent",
      foods: ["Vegetables", "Fruit", "Protein", "Leaf Litter", "Prepared Diet", "Other"],
      sizes: ["Pinch", "Pieces", "Small serving", "Custom"],
      notes: "Remove moldy food and log colony/life-stage changes.",
    },
    substrate: ["Bioactive mix", "Leaf litter", "Species-specific setup"],
    healthWarnings: ["Die-offs", "Mold", "Dryness", "Failed molts", "Low activity"],
    commonMistakes: ["Wrong moisture", "No ventilation", "No calcium/protein when needed", "Moldy food", "Wrong life-stage setup"],
    recommendedLogs: ["Feeding", "Moisture", "Colony notes", "Molt/breeding"],
    sources: ["merckReptileHusbandry"],
  },

  fish_default: {
    title: "Fish / aquatic starter guide",
    difficulty: "Intermediate",
    summary: "Aquatic animals rely on stable water quality, temperature, stocking, and appropriate feeding amounts.",
    environment: [
      { label: "Water quality", value: "Track ammonia/nitrite/nitrate when applicable" },
      { label: "Temperature", value: "Species-specific" },
      { label: "Tank", value: "Cycled and appropriately sized" },
    ],
    feeding: {
      strategy: "Aquatic foods",
      frequency: "Species and tank dependent",
      foods: ["Flakes", "Pellets", "Frozen Food", "Live Food", "Other"],
      sizes: ["Pinch", "Small portion", "Medium portion", "Custom"],
      notes: "Avoid overfeeding; track water quality issues.",
    },
    substrate: ["Gravel", "Sand", "Bare bottom", "Aquasoil"],
    healthWarnings: ["Gasping", "Clamped fins", "Floating/sinking issues", "Poor appetite"],
    commonMistakes: ["Overfeeding", "Uncycled tank", "Wrong stocking", "No water testing"],
    recommendedLogs: ["Feeding", "Water tests", "Water changes", "Temperature"],
    sources: ["aquariumFallback"],
  },

  bird_default: {
    title: "Bird starter guide",
    difficulty: "Intermediate",
    summary: "Bird care varies widely, but diet variety, enrichment, safe housing, and behavior notes are key.",
    environment: [
      { label: "Housing", value: "Species-appropriate cage/aviary and enrichment" },
      { label: "Diet", value: "Balanced diet, not seed-only for most parrots" },
      { label: "Safety", value: "Avoid fumes, toxins, and unsafe household hazards" },
    ],
    feeding: {
      strategy: "Daily diet",
      frequency: "Usually daily; exact diet varies by species",
      foods: ["Pellets", "Seeds", "Vegetables", "Fruit", "Sprouts", "Other"],
      sizes: ["Serving", "Pieces", "Grams", "Custom"],
      notes: "Track appetite, droppings changes, weight, and new foods.",
    },
    substrate: ["Paper liner", "Species-specific housing setup"],
    healthWarnings: ["Fluffed posture", "Tail bobbing", "Poor appetite", "Dropping changes", "Lethargy"],
    commonMistakes: ["Seed-only diet", "Unsafe household fumes", "No enrichment", "Ignoring subtle illness signs"],
    recommendedLogs: ["Feeding", "Weight", "Behavior", "Vet visits"],
    sources: ["avianFallback"],
  },

  mammal_default: {
    title: "Mammal starter guide",
    difficulty: "Beginner",
    summary: "Mammal care should track diet, weight, behavior, vet visits, medications, and enrichment.",
    environment: [
      { label: "Housing", value: "Species-appropriate space and enrichment" },
      { label: "Diet", value: "Species-appropriate commercial/fresh diet" },
      { label: "Vet care", value: "Routine and urgent care records" },
    ],
    feeding: {
      strategy: "Prepared / fresh",
      frequency: "Species-specific",
      foods: ["Dry Food", "Wet Food", "Hay", "Pellets", "Vegetables", "Other"],
      sizes: ["Serving", "Cup", "Grams", "Custom"],
      notes: "Track diet changes, weight, and appetite.",
    },
    substrate: ["Species-specific bedding/housing"],
    healthWarnings: ["Weight loss", "Lethargy", "Poor appetite", "Behavior change"],
    commonMistakes: ["No weight tracking", "Abrupt diet changes", "Ignoring dental/medical needs"],
    recommendedLogs: ["Feeding", "Weight", "Medication", "Vet visits"],
    sources: ["petMd"],
  },

  other_default: {
    title: "Custom animal starter guide",
    difficulty: "Advanced",
    summary: "Custom/unknown animals need manual review. Use this as a holding guide until exact species, enclosure, diet, and veterinary resources are confirmed.",
    environment: [
      { label: "Species ID", value: "Confirm exact species before setting care" },
      { label: "Environment", value: "Manual review required" },
      { label: "Safety", value: "Use conservative handling and quarantine notes" },
    ],
    feeding: {
      strategy: "Manual",
      frequency: "Set after species confirmation",
      foods: ["Custom Food", "Other"],
      sizes: ["Custom"],
      notes: "Use custom foods and notes until a species-specific guide exists.",
    },
    substrate: ["Manual setup", "Quarantine setup", "Species-specific once identified"],
    healthWarnings: ["Poor appetite", "Behavior change", "Lethargy", "Weight loss", "Unknown symptoms"],
    commonMistakes: ["Guessing species needs", "No quarantine notes", "No vet/source research", "Using unsafe foods"],
    recommendedLogs: ["Feeding", "Weight", "Health notes", "Species ID notes"],
    sources: [],
  },
};

function getFallbackKey({ category, group, species }) {
  const cat = String(category || "").toLowerCase();
  const grp = String(group || "").toLowerCase();
  const sp = String(species || "").toLowerCase();

  if (grp.includes("snake") || sp.includes("snake") || sp.includes("python") || sp.includes("boa")) return "reptile_snake";
  if (grp.includes("lizard") || sp.includes("gecko") || sp.includes("skink") || sp.includes("dragon") || sp.includes("monitor") || sp.includes("iguana") || sp.includes("chameleon")) return "reptile_lizard";
  if (grp.includes("turtle")) return "reptile_turtle";
  if (grp.includes("tortoise")) return "reptile_tortoise";

  if (grp.includes("frog") || grp.includes("toad")) return "amphibian_frog";
  if (cat.includes("amphibian")) return "amphibian_default";

  if (grp.includes("tarantula")) return "arachnid_tarantula";
  if (grp.includes("spider")) return "arachnid_spider";
  if (grp.includes("scorpion") || sp.includes("scorpion")) return "arachnid_scorpion";
  if (cat.includes("arachnid")) return "arachnid_default";

  if (grp.includes("isopod") || sp.includes("isopod")) return "invertebrate_isopod";
  if (grp.includes("millipede") || sp.includes("millipede")) return "invertebrate_millipede";
  if (grp.includes("centipede") || sp.includes("centipede")) return "invertebrate_centipede";
  if (grp.includes("mantis") || sp.includes("mantis")) return "invertebrate_mantis";
  if (grp.includes("beetle") || sp.includes("beetle")) return "invertebrate_beetle";
  if (grp.includes("roach") || sp.includes("roach")) return "invertebrate_roach";
  if (grp.includes("snail") || sp.includes("snail")) return "invertebrate_snail";
  if (grp.includes("aquatic") || sp.includes("shrimp") || sp.includes("crab") || sp.includes("crayfish")) return "invertebrate_aquatic";
  if (cat.includes("invertebrate")) return "invertebrate_default";

  if (cat.includes("fish")) return "fish_default";
  if (cat.includes("bird")) return "bird_default";
  if (cat.includes("mammal")) return "mammal_default";

  return "other_default";
}

function buildGuide({ category, group, species }) {
  const key = getCareKey(species);
  const detailed = DETAILED_GUIDES[key];

  if (detailed) {
    return {
      ...detailed,
      key,
      isDetailed: true,
      fallbackTitle: null,
    };
  }

  const fallbackKey = getFallbackKey({ category, group, species });
  const fallback = FALLBACK_GUIDES[fallbackKey] || FALLBACK_GUIDES.other_default;

  return {
    ...fallback,
    key,
    species,
    category,
    group,
    status: "fallback-starter",
    isDetailed: false,
    fallbackTitle: fallback.title,
    lastReviewed: LAST_REVIEWED,
  };
}

export function getAllCareGuides() {
  return Object.entries(ANIMAL_TAXONOMY).flatMap(([category, groups]) =>
    Object.entries(groups).flatMap(([group, speciesList]) =>
      speciesList.map((species) => buildGuide({ category, group, species }))
    )
  );
}

export function getCareGuideForPet(pet = {}) {
  return buildGuide({
    category: pet.category,
    group: pet.animalGroup,
    species: pet.species,
  });
}

export function getSourceLabels(sourceKeys = []) {
  return sourceKeys.map((key) => CARE_GUIDE_SOURCES[key]?.label || key).filter(Boolean);
}
