// =====================================================
// 🟢 morphLibrary.js
//
// Starter morph / breed / variety options.
// Community-submitted morphs come from Supabase and merge
// with these starter lists.
// =====================================================

export function makeMorphKey(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeSpeciesKey(value = "") {
  return makeMorphKey(value || "unknown-species");
}

export const STARTER_MORPH_LIBRARY = {
  "ball-python": [
    "Normal",
    "Pastel",
    "Mojave",
    "Lesser",
    "Butter",
    "Banana",
    "Coral Glow",
    "Spider",
    "Pinstripe",
    "Enchi",
    "Fire",
    "Yellow Belly",
    "Asphalt",
    "Gravel",
    "Cinnamon",
    "Black Pastel",
    "GHI",
    "Leopard",
    "Clown",
    "Pied",
    "Albino",
    "Axanthic",
    "Ghost / Hypo",
    "Desert Ghost",
    "Genetic Stripe",
    "Champagne",
    "Woma",
    "Scaleless Head",
    "Spotnose",
    "Bamboo",
    "Mystic",
    "Special",
    "Orange Dream",
    "Cypress",
    "Freeway",
    "Highway",
    "Banana Spider",
  ],
  "corn-snake": [
    "Normal",
    "Amelanistic",
    "Anerythristic",
    "Snow",
    "Hypo",
    "Bloodred",
    "Motley",
    "Stripe",
    "Tessera",
    "Lavender",
    "Palmetto",
    "Scaleless",
    "Butter",
    "Caramel",
    "Miami Phase",
    "Okeetee",
  ],
  "western-hognose": [
    "Normal",
    "Albino",
    "Anaconda",
    "Superconda",
    "Toffee Belly",
    "Axanthic",
    "Sable",
    "Lavender",
    "Snow",
    "Arctic",
    "Super Arctic",
  ],
  "hognose-snake": [
    "Normal",
    "Albino",
    "Anaconda",
    "Superconda",
    "Toffee Belly",
    "Axanthic",
    "Sable",
    "Lavender",
    "Snow",
    "Arctic",
    "Super Arctic",
  ],
  "boa-constrictor": [
    "Normal",
    "Hypo",
    "Albino",
    "Anery",
    "Snow",
    "Motley",
    "Jungle",
    "Arabesque",
    "Blood",
    "IMG",
    "Kahl Albino",
    "Sharp Albino",
  ],
  "leopard-gecko": [
    "Normal / Wild Type",
    "Mack Snow",
    "Super Snow",
    "Tremper Albino",
    "Bell Albino",
    "Rainwater Albino",
    "Eclipse",
    "Blizzard",
    "Murphy Patternless",
    "Tangerine",
    "Super Hypo",
    "Carrot Tail",
    "RAPTOR",
    "Diablo Blanco",
    "Enigma",
    "White & Yellow",
    "Bold Stripe",
    "Giant",
    "Super Giant",
    "Lemon Frost",
  ],
  "crested-gecko": [
    "Patternless",
    "Bicolor",
    "Flame",
    "Harlequin",
    "Extreme Harlequin",
    "Pinstripe",
    "Partial Pinstripe",
    "Dalmatian",
    "Super Dalmatian",
    "Lilly White",
    "Tricolor",
    "Brindle",
    "Tiger",
    "Phantom",
    "Quad Stripe",
  ],
  "gargoyle-gecko": [
    "Reticulated",
    "Stripe",
    "Banded",
    "Mosaic",
    "Red Stripe",
    "Orange Stripe",
    "Blotch",
  ],
  "bearded-dragon": [
    "Normal",
    "Citrus",
    "Hypo",
    "Translucent",
    "Leatherback",
    "Silkback",
    "Dunner",
    "Zero",
    "Witblits",
    "German Giant",
    "Red",
    "Orange",
    "Paradox",
  ],
  "blue-tongue-skink": [
    "Classic",
    "Northern",
    "Merauke",
    "Indonesian",
    "Halmahera",
    "Axanthic",
    "Hypo",
    "Caramel",
  ],
  "kingsnake": [
    "Normal",
    "Albino",
    "Lavender",
    "Banana",
    "High White",
    "Striped",
    "Aberrant",
    "Chocolate",
  ],
  "california-kingsnake": [
    "Normal",
    "Albino",
    "Lavender",
    "Banana",
    "High White",
    "Striped",
    "Aberrant",
    "Chocolate",
  ],
  "milk-snake": [
    "Normal",
    "Albino",
    "Tangerine",
    "Hypo",
    "Anery",
    "Aberrant",
    "Splotched",
  ],
  "ackie-monitor": [
    "Red Ackie",
    "Yellow Ackie",
    "High Red",
    "High Yellow",
    "Captive-Bred Line"
  ],
  "african-bullfrog": [
    "Standard",
    "High Green",
    "Captive-Bred Line",
    "Locale / Line"
  ],
  "african-fat-tailed-gecko": [
    "Normal",
    "Albino",
    "Oreo",
    "Whiteout",
    "Patternless",
    "Stripe",
    "Ghost",
    "Zorro",
    "Caramel",
    "Amel"
  ],
  "african-grey": [
    "Congo African Grey",
    "Timneh African Grey"
  ],
  "aldabra-tortoise": [
    "Standard",
    "Captive-Bred Line",
    "Lineage"
  ],
  "alpaca": [
    "Huacaya",
    "Suri",
    "White",
    "Fawn",
    "Brown",
    "Black",
    "Appaloosa",
    "Pinto",
    "Rose Gray",
    "Silver Gray"
  ],
  "amano-shrimp": [
    "Standard",
    "Large Line",
    "Wild Type"
  ],
  "amazon-parrot": [
    "Yellow-Naped",
    "Blue-Fronted",
    "Double Yellow-Headed",
    "Orange-Winged",
    "Mealy",
    "Lilac-Crowned",
    "Red-Lored"
  ],
  "angelfish": [
    "Silver",
    "Zebra",
    "Marble",
    "Koi",
    "Black Lace",
    "Gold",
    "Platinum",
    "Albino",
    "Blushing",
    "Veil Tail",
    "Altum"
  ],
  "armadillidium-isopod": [
    "Vulgare",
    "Maculatum Zebra",
    "Magic Potion",
    "Klugii Montenegro",
    "Granulatum",
    "Starter Colony"
  ],
  "arowana": [
    "Silver",
    "Black",
    "Asian Red",
    "Golden Crossback",
    "Green",
    "Jardini",
    "Leichardti"
  ],
  "axolotl": [
    "Wild Type",
    "Leucistic",
    "Golden Albino",
    "White Albino",
    "Melanoid",
    "Axanthic",
    "Copper",
    "GFP",
    "Mosaic",
    "Piebald",
    "Chimera"
  ],
  "basilisk": [
    "Green Basilisk",
    "Brown Basilisk",
    "Plumed",
    "Captive-Bred Line"
  ],
  "betta": [
    "Veiltail",
    "Crowntail",
    "Halfmoon",
    "Plakat",
    "Dumbo Ear",
    "Double Tail",
    "Rosetail",
    "Koi",
    "Galaxy Koi",
    "Marble",
    "Dragon Scale",
    "Mustard Gas",
    "Copper",
    "Candy",
    "Alien",
    "Samurai"
  ],
  "black-headed-python": [
    "Normal",
    "High Contrast",
    "Reduced Pattern",
    "Locale / Line"
  ],
  "blenny": [
    "Lawnmower",
    "Tailspot",
    "Midas",
    "Bicolor",
    "Starry",
    "Scooter",
    "Canary"
  ],
  "blood-python": [
    "Normal",
    "T+ Albino",
    "T- Albino",
    "Ivory",
    "Matrix",
    "Goldeneye",
    "Pied",
    "Batak",
    "Borneo / Short-Tail Line"
  ],
  "budgie": [
    "Normal Green",
    "Blue Series",
    "Lutino",
    "Albino",
    "Pied",
    "Recessive Pied",
    "Dominant Pied",
    "Spangle",
    "Opaline",
    "Cinnamon",
    "Greywing",
    "Clearwing",
    "English Budgie"
  ],
  "bullsnake": [
    "Normal",
    "Albino",
    "Hypo",
    "White-Sided",
    "Stillwater Hypo",
    "Patternless",
    "Locale / Line"
  ],
  "bumblebee-millipede": [
    "Standard",
    "Florida Line",
    "Captive-Bred Line"
  ],
  "burmese-python": [
    "Normal",
    "Albino",
    "Granite",
    "Green",
    "Labyrinth",
    "Hypo",
    "Caramel",
    "Patternless",
    "Pied",
    "Dwarf / Locality"
  ],
  "canary": [
    "American Singer",
    "Gloster",
    "Red Factor",
    "Border",
    "Yorkshire",
    "Fife",
    "Lizard Canary",
    "Crested"
  ],
  "caribbean-hermit-crab": [
    "Standard",
    "Large Claw",
    "Color Line",
    "Wild Type"
  ],
  "carpet-python": [
    "Jungle",
    "Coastal",
    "Irian Jaya",
    "Darwin",
    "Jaguar",
    "Zebra",
    "Caramel",
    "Axanthic",
    "Albino",
    "Granite",
    "Diamond Cross",
    "Locale / Line"
  ],
  "cat": [
    "Domestic Shorthair",
    "Domestic Medium Hair",
    "Domestic Longhair",
    "Maine Coon",
    "Siamese",
    "Ragdoll",
    "Bengal",
    "Persian",
    "Sphynx",
    "British Shorthair",
    "Scottish Fold",
    "Russian Blue",
    "Abyssinian",
    "Oriental Shorthair",
    "Norwegian Forest Cat",
    "Savannah",
    "Exotic Shorthair",
    "American Shorthair",
    "Manx",
    "Turkish Angora",
    "Himalayan",
    "Tuxedo",
    "Calico",
    "Tortoiseshell",
    "Tabby"
  ],
  "chahoua-gecko": [
    "Mainland",
    "Pine Island",
    "High White",
    "Green",
    "Red",
    "Locale / Line"
  ],
  "cherry-shrimp": [
    "Red Cherry",
    "Fire Red",
    "Painted Fire Red",
    "Bloody Mary",
    "Sakura",
    "Rili",
    "Blue Dream",
    "Carbon Rili",
    "Yellow Goldenback",
    "Orange Sunkist",
    "Green Jade",
    "Snowball"
  ],
  "chicken": [
    "Silkie",
    "Polish",
    "Orpington",
    "Wyandotte",
    "Rhode Island Red",
    "Leghorn",
    "Brahma",
    "Cochin",
    "Australorp",
    "Easter Egger",
    "Ameraucana",
    "Marans",
    "Serama"
  ],
  "childrens-python": [
    "Normal",
    "Patternless",
    "Marbled",
    "T+ Albino",
    "Granite",
    "Locale / Line"
  ],
  "chinchilla": [
    "Standard Gray",
    "Black Velvet",
    "Ebony",
    "Hetero Beige",
    "Homo Beige",
    "White Mosaic",
    "Wilson White",
    "Violet",
    "Sapphire",
    "Tan",
    "Pink White",
    "Brown Velvet"
  ],
  "chinese-water-dragon": [
    "Standard",
    "High Green",
    "Captive-Bred Line"
  ],
  "chuckwalla": [
    "Common",
    "Angel Island",
    "Pie-Bald",
    "Locale / Line"
  ],
  "cichlid": [
    "Mbuna",
    "Peacock",
    "Haplochromis",
    "Convict",
    "Flowerhorn",
    "Blood Parrot",
    "Ram",
    "Apistogramma",
    "Electric Yellow",
    "Demasoni",
    "Frontosa",
    "Oscar Type"
  ],
  "clownfish": [
    "Ocellaris",
    "Percula",
    "Snowflake",
    "Picasso",
    "Gladiator",
    "Mocha",
    "Black Ice",
    "Wyoming White",
    "Domino",
    "Naked",
    "Misbar"
  ],
  "coachwhip": [
    "Normal",
    "Red Phase",
    "Black Phase",
    "Locale / Line"
  ],
  "coastal-carpet-python": [
    "Normal",
    "Jaguar",
    "Zebra",
    "Caramel",
    "Axanthic",
    "Granite",
    "Locale / Line"
  ],
  "cockatiel": [
    "Normal Grey",
    "Lutino",
    "Pied",
    "Pearl",
    "Cinnamon",
    "Whiteface",
    "Albino / Whiteface Lutino",
    "Fallow",
    "Silver",
    "Pastelface",
    "Emerald",
    "Yellowcheek"
  ],
  "cockatoo": [
    "Umbrella",
    "Moluccan",
    "Goffin’s",
    "Sulphur-Crested",
    "Bare-Eyed",
    "Rose-Breasted / Galah",
    "Citron-Crested"
  ],
  "common-musk-turtle": [
    "Normal",
    "Loggerhead",
    "Stripe-Neck",
    "Captive-Bred Line"
  ],
  "composting-worm": [
    "Red Wiggler",
    "European Nightcrawler",
    "Mixed Composting Culture"
  ],
  "conure": [
    "Green-Cheek",
    "Pineapple",
    "Turquoise",
    "Cinnamon",
    "Yellow-Sided",
    "Dilute",
    "Sun Conure",
    "Jenday",
    "Nanday",
    "Blue-Crowned"
  ],
  "corydoras": [
    "Bronze",
    "Albino",
    "Panda",
    "Peppered",
    "Sterbai",
    "Julii",
    "Emerald",
    "Pygmy",
    "Habrosus",
    "Venezuelan Orange"
  ],
  "cow": [
    "Holstein",
    "Jersey",
    "Guernsey",
    "Angus",
    "Hereford",
    "Highland",
    "Dexter",
    "Brahman",
    "Brown Swiss",
    "Ayrshire",
    "Longhorn",
    "Miniature Zebu"
  ],
  "crayfish": [
    "Electric Blue",
    "White Specter",
    "Orange CPO",
    "Marmorkreb",
    "Wild Type",
    "Dwarf Mexican"
  ],
  "cuban-rock-iguana": [
    "Standard",
    "Blue Line",
    "High Contrast",
    "Captive-Bred Line"
  ],
  "cubaris-isopod": [
    "Rubber Ducky",
    "Panda King",
    "Pak Chong",
    "Red Edge",
    "White Shark",
    "Jupiter",
    "Starter Colony"
  ],
  "cumberland-slider": [
    "Normal",
    "Albino",
    "Hypo",
    "Locale / Line"
  ],
  "dairy-cow-isopod": [
    "Standard",
    "High White",
    "Low White",
    "Large Line",
    "Selective Line",
    "Starter Colony"
  ],
  "damselfish": [
    "Blue Devil",
    "Yellowtail",
    "Azure",
    "Domino",
    "Three Stripe",
    "Talbot",
    "Springer"
  ],
  "darkling-beetle": [
    "Mealworm Beetle",
    "Superworm Beetle",
    "Cleaner Crew Line"
  ],
  "dart-frog": [
    "Azureus",
    "Leucomelas",
    "Tinctorius",
    "Auratus",
    "Ranitomeya",
    "Locale / Line",
    "Proven Pair Line"
  ],
  "day-gecko": [
    "Grandis",
    "Klemmeri",
    "Standing’s",
    "Gold Dust",
    "High Red",
    "Blue Blood",
    "Locale / Line"
  ],
  "death-feigning-beetle": [
    "Blue Death-Feigning",
    "Smooth Death-Feigning",
    "Mixed Desert Beetle Colony"
  ],
  "deaths-head-roach": [
    "Standard",
    "Feeder/Pet Colony",
    "Captive-Bred Line"
  ],
  "degu": [
    "Standard Agouti",
    "Blue / Gray",
    "Sand",
    "Pied",
    "White Marked",
    "Cream",
    "Black"
  ],
  "diamond-dove": [
    "Wild Type",
    "Silver",
    "White-Rump",
    "Pied",
    "Cinnamon",
    "Fawn"
  ],
  "diamond-python": [
    "Normal",
    "Reduced Pattern",
    "High Yellow",
    "Diamond Cross",
    "Locale / Line"
  ],
  "diamondback-terrapin": [
    "Concentric",
    "Ornate",
    "Carolina",
    "Northern",
    "Texas",
    "Locale / Line"
  ],
  "discoid-roach": [
    "Standard Colony",
    "High Production Line",
    "Feeder Colony"
  ],
  "discus": [
    "Blue Diamond",
    "Pigeon Blood",
    "Red Turquoise",
    "Checkerboard",
    "Cobalt Blue",
    "Leopard",
    "Marlboro Red",
    "Snow White",
    "Heckel",
    "Golden"
  ],
  "dog": [
    "Mixed Breed",
    "Labrador Retriever",
    "Golden Retriever",
    "German Shepherd",
    "Australian Shepherd",
    "Border Collie",
    "Poodle",
    "Goldendoodle",
    "Labradoodle",
    "French Bulldog",
    "English Bulldog",
    "American Bully",
    "Pit Bull Type",
    "Boxer",
    "Rottweiler",
    "Doberman Pinscher",
    "Great Dane",
    "Mastiff",
    "Siberian Husky",
    "Alaskan Malamute",
    "Corgi",
    "Dachshund",
    "Beagle",
    "Chihuahua",
    "Yorkshire Terrier",
    "Shih Tzu",
    "Pomeranian",
    "Cocker Spaniel",
    "Cavalier King Charles Spaniel",
    "Bernese Mountain Dog",
    "Great Pyrenees"
  ],
  "donkey": [
    "Standard Donkey",
    "Miniature Donkey",
    "Mammoth Jackstock",
    "Spotted Donkey",
    "Poitou",
    "Burro"
  ],
  "dubia-roach": [
    "Standard Colony",
    "High Production Line",
    "Feeder Colony"
  ],
  "duck": [
    "Pekin",
    "Muscovy",
    "Runner",
    "Khaki Campbell",
    "Rouen",
    "Call Duck",
    "Cayuga",
    "Swedish Blue",
    "Welsh Harlequin"
  ],
  "dumerils-boa": [
    "Normal",
    "Pattern Reduced",
    "High Contrast",
    "Locale / Line",
    "Captive-Bred Line"
  ],
  "earthworm": [
    "Red Wiggler",
    "European Nightcrawler",
    "African Nightcrawler",
    "Composting Line"
  ],
  "eastern-hognose": [
    "Normal",
    "Albino",
    "Anaconda",
    "Axanthic",
    "Locale / Line"
  ],
  "ecuadorian-hermit-crab": [
    "Standard",
    "Color Line",
    "Wild Type"
  ],
  "emerald-tree-boa": [
    "Amazon Basin",
    "Northern",
    "Garden Phase",
    "High White",
    "Locale / Line"
  ],
  "ferret": [
    "Sable",
    "Black Sable",
    "Albino",
    "Dark-Eyed White",
    "Champagne",
    "Cinnamon",
    "Chocolate",
    "Silver",
    "Panda",
    "Blaze",
    "Mitt",
    "Roan",
    "Point / Siamese",
    "Standard Pattern"
  ],
  "fire-bellied-toad": [
    "European",
    "Oriental",
    "High Red",
    "Green",
    "Captive-Bred Line"
  ],
  "fire-salamander": [
    "Banded",
    "Spotted",
    "High Yellow",
    "Locale / Line"
  ],
  "fire-skink": [
    "Standard",
    "High Red",
    "Captive-Bred Line",
    "Locale / Line"
  ],
  "freshwater-crab": [
    "Thai Micro Crab",
    "Vampire Crab",
    "Red Claw Crab",
    "Panther Crab",
    "Fiddler Crab"
  ],
  "freshwater-shrimp": [
    "Neocaridina",
    "Caridina",
    "Ghost Shrimp",
    "Amano",
    "Sulawesi",
    "Wild Type"
  ],
  "frilled-dragon": [
    "Australian",
    "New Guinea",
    "High Orange",
    "High Red",
    "Captive-Bred Line"
  ],
  "galapagos-tortoise": [
    "Species/Island Locality",
    "Lineage"
  ],
  "garden-snail": [
    "Standard",
    "Albino",
    "Captive-Bred Line"
  ],
  "garter-snake": [
    "Normal",
    "Albino",
    "Anery",
    "Melanistic",
    "Flame",
    "Blue Stripe",
    "Checkered",
    "Locale / Line"
  ],
  "gerbil": [
    "Mongolian Gerbil",
    "Fat-Tailed Gerbil",
    "Agouti",
    "Black",
    "Argente",
    "Lilac",
    "Dove",
    "Nutmeg",
    "Spotted",
    "Pied"
  ],
  "gestroi-isopod": [
    "Standard",
    "High Yellow",
    "Starter Colony"
  ],
  "ghost-mantis": [
    "Brown",
    "Green",
    "High Contrast",
    "Captive-Bred Line"
  ],
  "ghost-shrimp": [
    "Standard",
    "Feeder Line",
    "Pet Line"
  ],
  "giant-african-millipede": [
    "Standard",
    "Tanzanian Line",
    "Ghana Line",
    "Captive-Bred Line"
  ],
  "giant-asian-mantis": [
    "Green",
    "Brown",
    "Locale / Line",
    "Captive-Bred Line"
  ],
  "giant-desert-centipede": [
    "Standard",
    "Arizona Line",
    "Texas Line",
    "Locale / Line"
  ],
  "giant-walking-stick": [
    "Standard",
    "Locale / Line",
    "Captive-Bred Line"
  ],
  "goat": [
    "Nigerian Dwarf",
    "Pygmy",
    "Boer",
    "Nubian",
    "LaMancha",
    "Alpine",
    "Saanen",
    "Toggenburg",
    "Oberhasli",
    "Kinder",
    "Kiko",
    "Myotonic / Fainting"
  ],
  "gobies": [
    "Watchman Goby",
    "Clown Goby",
    "Firefish Goby",
    "Neon Goby",
    "Yasha Goby",
    "Diamond Goby",
    "Rainford Goby"
  ],
  "goldfish": [
    "Common",
    "Comet",
    "Shubunkin",
    "Fantail",
    "Ryukin",
    "Oranda",
    "Ranchu",
    "Lionhead",
    "Telescope",
    "Black Moor",
    "Bubble Eye",
    "Celestial Eye",
    "Pearlscale",
    "Wakin",
    "Jikin",
    "Butterfly Tail"
  ],
  "goose": [
    "Embden",
    "Toulouse",
    "African",
    "Chinese",
    "Sebastopol",
    "Pilgrim",
    "Roman"
  ],
  "gouldian-finch": [
    "Black Head",
    "Red Head",
    "Yellow Head",
    "Green Back",
    "Blue Back",
    "Yellow Back",
    "Silver",
    "Pastel"
  ],
  "greek-tortoise": [
    "Ibera",
    "Golden Greek",
    "Northern",
    "Locale / Line"
  ],
  "green-iguana": [
    "Normal",
    "Red",
    "Blue",
    "Albino",
    "Axanthic",
    "High Green",
    "Rhino / Locality Line"
  ],
  "green-tree-python": [
    "Biak",
    "Aru",
    "Sorong",
    "Jayapura",
    "Manokwari",
    "High Yellow",
    "Blue Line",
    "Red Neonate Line",
    "Locale / Line"
  ],
  "guinea-fowl": [
    "Pearl Grey",
    "Lavender",
    "White",
    "Pied",
    "Royal Purple",
    "Coral Blue"
  ],
  "guinea-pig": [
    "American",
    "Abyssinian",
    "Peruvian",
    "Silkie / Sheltie",
    "Teddy",
    "Rex",
    "Skinny Pig",
    "Baldwin",
    "Crested",
    "Texel",
    "Coronet",
    "Alpaca",
    "Merino",
    "Lunkarya"
  ],
  "guppy": [
    "Fancy Guppy",
    "Endler",
    "Cobra",
    "Mosaic",
    "Tuxedo",
    "Snakeskin",
    "Dumbo Ear",
    "Delta Tail",
    "Half Black",
    "Metallic",
    "Albino",
    "Blue Grass",
    "Red Grass",
    "Japan Blue"
  ],
  "hamster": [
    "Syrian",
    "Long-Haired Syrian",
    "Short-Haired Syrian",
    "Satin Syrian",
    "Campbell Dwarf",
    "Winter White Dwarf",
    "Roborovski",
    "Chinese Hamster",
    "Hybrid Dwarf",
    "Pied",
    "Banded",
    "Dominant Spot"
  ],
  "hedgehog": [
    "Salt & Pepper",
    "Cinnamon",
    "Pinto",
    "Snowflake",
    "Apricot",
    "Algerian",
    "Dark Gray",
    "Chocolate",
    "Albino",
    "Reverse Pinto"
  ],
  "hermanns-tortoise": [
    "Eastern",
    "Western",
    "Dalmatian",
    "High Yellow",
    "Locale / Line"
  ],
  "hissing-cockroach": [
    "Standard",
    "Halloween Hisser",
    "Wide-Horned",
    "Tiger Hisser",
    "Feeder/Pet Colony"
  ],
  "hornworm": [
    "Standard Feeder",
    "Small",
    "Medium",
    "Large",
    "Breeding Cup Line"
  ],
  "horse": [
    "Thoroughbred",
    "Quarter Horse",
    "Arabian",
    "Appaloosa",
    "Paint Horse",
    "Morgan",
    "Tennessee Walking Horse",
    "Friesian",
    "Clydesdale",
    "Percheron",
    "Mustang",
    "Warmblood",
    "Andalusian",
    "Haflinger"
  ],
  "indian-star-tortoise": [
    "Normal",
    "Sri Lankan",
    "High Yellow",
    "Captive-Bred Line"
  ],
  "indigo-snake": [
    "Eastern",
    "Texas",
    "Black-Tailed",
    "Locale / Line"
  ],
  "ivory-millipede": [
    "Standard",
    "High Ivory",
    "Captive-Bred Line"
  ],
  "jacksons-chameleon": [
    "Xantholophus",
    "Merumontanus",
    "Jacksonii",
    "Locale / Line"
  ],
  "jungle-carpet-python": [
    "Normal",
    "Jaguar",
    "Zebra",
    "Caramel",
    "Axanthic",
    "High Yellow",
    "Striped",
    "Locale / Line"
  ],
  "kenyan-sand-boa": [
    "Normal",
    "Anery",
    "Albino",
    "Snow",
    "Nuclear",
    "Paradox",
    "Stripe",
    "Calico",
    "Paint",
    "Dodoma"
  ],
  "koi": [
    "Kohaku",
    "Taisho Sanke",
    "Showa",
    "Utsuri",
    "Bekko",
    "Asagi",
    "Shusui",
    "Kohaku Doitsu",
    "Ogon",
    "Chagoi",
    "Soragoi",
    "Tancho",
    "Gin Rin",
    "Butterfly Koi"
  ],
  "kuhli-loach": [
    "Black Kuhli",
    "Striped Kuhli",
    "Silver Kuhli",
    "Pangio Locality"
  ],
  "leaf-insect": [
    "Phyllium Line",
    "Green",
    "Yellow",
    "Captive-Bred Line"
  ],
  "leopard-tortoise": [
    "Babcocki",
    "Pardalis",
    "South African Giant",
    "High White",
    "Locale / Line"
  ],
  "lionfish": [
    "Volitan",
    "Dwarf Fuzzy",
    "Fu Manchu",
    "Radiata",
    "Zebra Lionfish"
  ],
  "llama": [
    "Classic",
    "Wooly",
    "Suri",
    "Silky",
    "Light Wool",
    "Medium Wool",
    "Heavy Wool",
    "Appaloosa",
    "Pinto"
  ],
  "lovebird": [
    "Peach-Faced",
    "Fischer’s",
    "Masked",
    "Lutino",
    "Blue",
    "Pied",
    "Opaline",
    "Violet"
  ],
  "macaw": [
    "Blue and Gold",
    "Green-Wing",
    "Scarlet",
    "Hyacinth",
    "Military",
    "Severe",
    "Hahn’s",
    "Catalina Hybrid",
    "Harlequin Hybrid"
  ],
  "magic-potion-isopod": [
    "American Line",
    "Japanese Line",
    "High White",
    "Starter Colony"
  ],
  "mandarin-dragonet": [
    "Green Mandarin",
    "Spotted Mandarin",
    "Red Mandarin",
    "ORA Captive-Bred"
  ],
  "map-turtle": [
    "Mississippi",
    "False",
    "Northern",
    "Ouachita",
    "Black-Knobbed",
    "Locale / Line"
  ],
  "marine-crab": [
    "Emerald Crab",
    "Hermit Crab",
    "Porcelain Crab",
    "Pom Pom Crab",
    "Sally Lightfoot"
  ],
  "mealworm": [
    "Standard Mealworm",
    "Giant Mealworm",
    "Feeder Colony"
  ],
  "miniature-horse": [
    "American Miniature Horse",
    "Falabella",
    "Mini Appaloosa",
    "Mini Pinto",
    "Miniature Shetland"
  ],
  "molly": [
    "Black Molly",
    "Dalmatian Molly",
    "Sailfin Molly",
    "Balloon Molly",
    "Lyretail Molly",
    "Gold Dust Molly",
    "Marble Molly",
    "White Molly",
    "Liberty Molly"
  ],
  "mosquitofish": [
    "Eastern",
    "Western",
    "Wild Type",
    "Locality / Line"
  ],
  "mossy-gecko": [
    "High Color",
    "Patterned",
    "Locale / Line",
    "Captive-Bred Line"
  ],
  "mourning-gecko": [
    "Standard",
    "Hawaiian Line",
    "Yellow Belly",
    "Locale / Line",
    "Colony Line"
  ],
  "mouse": [
    "Fancy Mouse",
    "Satin",
    "Long Hair",
    "Texel",
    "Rex",
    "Hairless",
    "Brindle",
    "Piebald",
    "Self",
    "Dutch",
    "Broken Marked"
  ],
  "mud-turtle": [
    "Eastern",
    "Three-Striped",
    "Mississippi",
    "Yellow Mud",
    "Locale / Line"
  ],
  "mystery-snail": [
    "Gold",
    "Blue",
    "Ivory",
    "Magenta",
    "Purple",
    "Black",
    "Wild Type",
    "Chestnut"
  ],
  "neon-tetra": [
    "Standard Neon",
    "Green Neon",
    "Longfin",
    "Albino",
    "Diamond Line"
  ],
  "nerite-snail": [
    "Zebra",
    "Tiger",
    "Horned",
    "Red Racer",
    "Black Racer",
    "Olive"
  ],
  "newt": [
    "Eastern Newt",
    "Ribbed Newt",
    "Fire-Bellied Newt",
    "Paddletail",
    "Locale / Line"
  ],
  "nile-monitor": [
    "Standard",
    "Ornate",
    "Captive-Bred Line",
    "Locale / Line"
  ],
  "orchid-mantis": [
    "White/Pink",
    "High Pink",
    "Captive-Bred Line"
  ],
  "oscar": [
    "Tiger",
    "Red",
    "Albino",
    "Lemon",
    "Longfin",
    "Wild Type"
  ],
  "pacman-frog": [
    "Normal",
    "Albino",
    "Strawberry Albino",
    "Lime Green",
    "Apricot",
    "Fantasy",
    "High Red",
    "Samurai Blue",
    "Chocolate"
  ],
  "painted-turtle": [
    "Eastern",
    "Midland",
    "Western",
    "Southern",
    "Locale / Line"
  ],
  "pancake-tortoise": [
    "Standard",
    "Captive-Bred Line",
    "Locale / Line"
  ],
  "panda-king-isopod": [
    "Standard",
    "High White",
    "Selective Line",
    "Starter Colony"
  ],
  "panther-chameleon": [
    "Ambilobe",
    "Nosy Be",
    "Sambava",
    "Ambanja",
    "Tamatave",
    "Nosy Faly",
    "Diego Suarez",
    "Locale / Line"
  ],
  "parrotlet": [
    "Pacific Green",
    "Blue",
    "American Yellow",
    "Lutino",
    "Fallow",
    "Pied",
    "Turquoise"
  ],
  "pig": [
    "Potbellied",
    "Juliana",
    "Kunekune",
    "American Guinea Hog",
    "Mini Pig",
    "Yorkshire",
    "Berkshire",
    "Duroc",
    "Hampshire",
    "Hereford"
  ],
  "pigeon": [
    "Homing Pigeon",
    "Fantail",
    "Tumbler",
    "Roller",
    "King Pigeon",
    "Modena",
    "Frillback",
    "Jacobin"
  ],
  "pine-snake": [
    "Normal",
    "Albino",
    "Axanthic",
    "Patternless",
    "Locale / Line"
  ],
  "pixie-frog": [
    "Standard",
    "High Green",
    "Captive-Bred Line",
    "Locale / Line"
  ],
  "platy": [
    "Mickey Mouse",
    "Wagtail",
    "Tuxedo",
    "Sunset",
    "Variatus",
    "Red Coral",
    "Blue Mirror",
    "Panda",
    "Hi-Fin",
    "Comet"
  ],
  "pleco": [
    "Bristlenose",
    "Common Pleco",
    "Clown Pleco",
    "Rubber Lip",
    "Royal Pleco",
    "Zebra Pleco",
    "Gold Nugget",
    "Sailfin",
    "Blue Phantom",
    "Green Phantom",
    "Snowball"
  ],
  "pond-snail": [
    "Bladder Snail",
    "Ramshorn",
    "Mystery Snail",
    "Nerite",
    "Malaysian Trumpet Snail"
  ],
  "pony": [
    "Shetland Pony",
    "Welsh Pony",
    "Connemara",
    "Hackney Pony",
    "Dartmoor",
    "Exmoor",
    "Fell Pony",
    "Pony of the Americas",
    "Miniature Pony"
  ],
  "porcellio-isopod": [
    "Dairy Cow",
    "Powder Orange",
    "Powder Blue",
    "Sevilla",
    "Hoffmannseggi",
    "Laevis",
    "Starter Colony"
  ],
  "powder-blue-isopod": [
    "Standard Blue",
    "High Blue",
    "Starter Colony",
    "Cleaner Crew Line"
  ],
  "powder-orange-isopod": [
    "Standard Orange",
    "Giant Orange",
    "High Orange",
    "Starter Colony",
    "Cleaner Crew Line"
  ],
  "praying-mantis": [
    "Green",
    "Brown",
    "Locale / Line",
    "Captive-Bred Line"
  ],
  "quail": [
    "Coturnix",
    "Button Quail",
    "Bobwhite",
    "Tibetan",
    "Italian",
    "Jumbo Brown",
    "Celadon Egg Line"
  ],
  "quaker-parrot": [
    "Green",
    "Blue",
    "Lutino",
    "Albino",
    "Pallid",
    "Cinnamon"
  ],
  "rabbit": [
    "Mixed Breed",
    "Holland Lop",
    "Mini Lop",
    "Netherland Dwarf",
    "Mini Rex",
    "Rex",
    "Lionhead",
    "Flemish Giant",
    "Dutch",
    "English Lop",
    "French Lop",
    "Angora",
    "Jersey Wooly",
    "Polish",
    "Californian",
    "New Zealand",
    "Harlequin",
    "Himalayan",
    "Dwarf Hotot",
    "Silver Fox"
  ],
  "ramshorn-snail": [
    "Red",
    "Blue",
    "Pink",
    "Brown",
    "Leopard",
    "Gold"
  ],
  "rat": [
    "Standard Fancy",
    "Dumbo",
    "Rex",
    "Double Rex",
    "Hairless",
    "Satin",
    "Harley",
    "Velveteen",
    "Top Ear",
    "Patchwork",
    "Hooded",
    "Berkshire",
    "Self",
    "Variegated",
    "Blazed"
  ],
  "rat-snake": [
    "Normal",
    "Albino",
    "Leucistic",
    "Scaleless",
    "Hypo",
    "Patternless",
    "Texas",
    "Black Rat",
    "Locale / Line"
  ],
  "razorback-musk-turtle": [
    "Normal",
    "High Contrast",
    "Captive-Bred Line"
  ],
  "red-eared-slider": [
    "Normal",
    "Albino",
    "Hypo",
    "Pastel",
    "Pied",
    "Caramel",
    "Locale / Line"
  ],
  "red-eyed-crocodile-skink": [
    "Standard",
    "Captive-Bred Line",
    "Locale / Line"
  ],
  "red-foot-tortoise": [
    "Cherry Head",
    "Northern",
    "Yellow-Foot Cross",
    "High Red",
    "Locale / Line"
  ],
  "red-tailed-boa": [
    "Normal",
    "Hypo",
    "Albino",
    "Anery",
    "Motley",
    "Jungle",
    "Kahl Line",
    "Sharp Line",
    "IMG",
    "Locality / Line"
  ],
  "reeves-turtle": [
    "Normal",
    "Albino",
    "Hypo",
    "Captive-Bred Line"
  ],
  "reticulated-python": [
    "Normal",
    "Albino",
    "Tiger",
    "Super Tiger",
    "Lavender",
    "Purple",
    "Sunfire",
    "Platinum",
    "Golden Child",
    "Phantom",
    "Motley",
    "Dwarf / Super Dwarf Locality"
  ],
  "rhinoceros-beetle": [
    "Japanese Rhinoceros",
    "Hercules",
    "Atlas",
    "Larval Line"
  ],
  "ringneck-dove": [
    "Wild Type",
    "White",
    "Tangerine",
    "Pied",
    "Cream",
    "Rosy",
    "Blond"
  ],
  "rosy-boa": [
    "Coastal",
    "Desert",
    "Mexican",
    "Albino",
    "Anery",
    "Snow",
    "Stripe",
    "Locale / Line"
  ],
  "rubber-boa": [
    "Northern",
    "Southern",
    "Locale / Line",
    "Captive-Bred Line"
  ],
  "rubber-ducky-isopod": [
    "Standard",
    "Blonde",
    "White Ducky",
    "Pink Ducky",
    "Captive-Bred Line",
    "Starter Colony"
  ],
  "russian-tortoise": [
    "Normal",
    "High Yellow",
    "Locale / Line",
    "Captive-Bred Line"
  ],
  "savannah-monitor": [
    "Standard",
    "High Yellow",
    "Captive-Bred Line",
    "Locale / Line"
  ],
  "schneiders-skink": [
    "Standard",
    "Captive-Bred Line",
    "Locale / Line"
  ],
  "seahorse": [
    "Lined Seahorse",
    "Dwarf Seahorse",
    "Kuda",
    "Erectus",
    "Reidi",
    "Barbouri"
  ],
  "sheep": [
    "Suffolk",
    "Dorper",
    "Katahdin",
    "Hampshire",
    "Merino",
    "Dorset",
    "Jacob",
    "Romney",
    "Shetland",
    "Babydoll Southdown",
    "Icelandic"
  ],
  "short-tailed-opossum": [
    "Gray",
    "Cinnamon",
    "Leucistic",
    "Albino",
    "Piebald",
    "Lineage / Locality"
  ],
  "short-tailed-python": [
    "Borneo",
    "Sumatran",
    "Black Blood",
    "Chrome Head",
    "Matrix",
    "Goldeneye",
    "Locale / Line"
  ],
  "silkworm": [
    "Standard Feeder",
    "Zebra Line",
    "Cocoon Line"
  ],
  "skunk": [
    "Black and White",
    "Chocolate",
    "Lavender",
    "Apricot",
    "Albino",
    "Chip / Striped Pattern"
  ],
  "snapping-turtle": [
    "Common",
    "Florida",
    "Alligator Snapping",
    "Albino",
    "Hypo",
    "Locale / Line"
  ],
  "society-finch": [
    "Chocolate",
    "Fawn",
    "White",
    "Pied",
    "Crested",
    "Dilute"
  ],
  "softshell-turtle": [
    "Spiny",
    "Smooth",
    "Florida",
    "Albino",
    "Locale / Line"
  ],
  "spiny-flower-mantis": [
    "Standard",
    "High Contrast",
    "Captive-Bred Line"
  ],
  "spotted-python": [
    "Normal",
    "Granite",
    "Patternless",
    "T+ Albino",
    "Locale / Line"
  ],
  "stag-beetle": [
    "Dorcus Line",
    "Prosopocoilus Line",
    "Lucanus Line",
    "Larval Line"
  ],
  "stick-insect": [
    "Indian Stick Insect",
    "Vietnamese Stick Insect",
    "Giant Prickly",
    "Locale / Line"
  ],
  "stimsons-python": [
    "Normal",
    "Patternless",
    "Marble",
    "Granite",
    "Locale / Line"
  ],
  "strawberry-hermit-crab": [
    "Standard",
    "Color Line",
    "Wild Type"
  ],
  "sugar-glider": [
    "Classic Gray",
    "Leucistic",
    "Mosaic",
    "White Face",
    "Platinum",
    "Creamino",
    "Albino",
    "Ringtail",
    "Piebald"
  ],
  "sulcata-tortoise": [
    "Normal",
    "Ivory",
    "Sudanese Line",
    "Captive-Bred Line"
  ],
  "sun-beetle": [
    "Standard",
    "Larval Line",
    "Captive-Bred Line"
  ],
  "superworm": [
    "Standard Superworm",
    "Feeder Colony"
  ],
  "swordtail": [
    "Red Swordtail",
    "Pineapple",
    "Wagtail",
    "Tuxedo",
    "Koi",
    "Lyretail",
    "Hi-Fin",
    "Green Swordtail",
    "Neon Swordtail"
  ],
  "tang": [
    "Yellow Tang",
    "Blue Hippo Tang",
    "Powder Blue Tang",
    "Powder Brown Tang",
    "Sailfin Tang",
    "Kole Tang",
    "Naso Tang",
    "Purple Tang"
  ],
  "tenrec": [
    "Lesser Hedgehog Tenrec",
    "Common Tenrec",
    "Tailless Tenrec",
    "Lineage / Locality"
  ],
  "tetra": [
    "Neon",
    "Cardinal",
    "Black Skirt",
    "White Skirt",
    "Ember",
    "Rummynose",
    "Glowlight",
    "Serpae",
    "Congo",
    "Pristella",
    "Lemon",
    "Bleeding Heart"
  ],
  "tiger-centipede": [
    "Standard",
    "High Contrast",
    "Locale / Line"
  ],
  "tiger-salamander": [
    "Eastern",
    "Barred",
    "Blotched",
    "Melanistic",
    "Locale / Line"
  ],
  "tokay-gecko": [
    "Normal",
    "Powder Blue",
    "Patternless",
    "Leucistic",
    "Melanistic",
    "Calico",
    "Granite",
    "Blue Head",
    "Locale / Line"
  ],
  "tomato-frog": [
    "Standard",
    "Bright Red",
    "Juvenile Orange",
    "Locale / Line"
  ],
  "turkey": [
    "Broad Breasted White",
    "Broad Breasted Bronze",
    "Royal Palm",
    "Narragansett",
    "Bourbon Red",
    "Blue Slate",
    "Heritage Mix"
  ],
  "uromastyx": [
    "Ornate",
    "Mali",
    "Egyptian",
    "Saharan",
    "Yellow",
    "Red",
    "Locale / Line"
  ],
  "veiled-chameleon": [
    "Normal",
    "High Yellow",
    "Turquoise",
    "Translucent",
    "Piebald",
    "Locale / Line"
  ],
  "vietnamese-centipede": [
    "Standard",
    "High Red",
    "Giant Line",
    "Locale / Line"
  ],
  "whites-tree-frog": [
    "Blue Phase",
    "Snowflake",
    "Honey Blue",
    "Green",
    "Australian Line",
    "Indonesian Line"
  ],
  "woma-python": [
    "Normal",
    "Reduced Pattern",
    "High Contrast",
    "Locale / Line"
  ],
  "wrasse": [
    "Six Line",
    "Melanurus",
    "Fairy Wrasse",
    "Flasher Wrasse",
    "Cleaner Wrasse",
    "Leopard Wrasse",
    "Yellow Coris"
  ],
  "yellow-bellied-slider": [
    "Normal",
    "Albino",
    "Hypo",
    "Pastel",
    "Locale / Line"
  ],
  "yellow-foot-tortoise": [
    "Standard",
    "Locale / Line",
    "Captive-Bred Line"
  ],
  "zebra-finch": [
    "Normal Grey",
    "Fawn",
    "White",
    "Pied",
    "Black Cheek",
    "Orange Breast",
    "Penguin",
    "Crested"
  ],
  "zebra-isopod": [
    "Standard Zebra",
    "High White",
    "Yellow Zebra",
    "Starter Colony"
  ],
};

export function getStarterMorphOptions(species = "") {
  const key = makeSpeciesKey(species);
  return STARTER_MORPH_LIBRARY[key] || [];
}

export function mergeMorphOptions(...optionLists) {
  const seen = new Set();

  return optionLists
    .flat()
    .filter(Boolean)
    .map((option) => String(option).trim())
    .filter((option) => {
      const key = makeMorphKey(option);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));
}
