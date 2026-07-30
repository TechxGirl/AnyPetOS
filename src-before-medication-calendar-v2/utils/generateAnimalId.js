const PREFIXES = {
  "Ball Python": "BP",
  "Boa Constrictor": "BOA",
  "Red-Tailed Boa": "BOA",
  "Dumeril's Boa": "BOA",
  "Kenyan Sand Boa": "BOA",
  "Corn Snake": "CS",
  "Milk Snake": "MS",
  "Kingsnake": "KS",
  "Hognose Snake": "HOG",

  "Bearded Dragon": "BD",
  "Leopard Gecko": "LG",
  "Crested Gecko": "CG",
  "Blue Tongue Skink": "BTS",
  "Red-Eyed Crocodile Skink": "RCS",

  "Sulcata Tortoise": "SUL",
  "Russian Tortoise": "RT",

  "Painted Turtle": "PT",

  "Regal Jumping Spider": "JS",
  "Bold Jumping Spider": "JS",
  "Mexican Fire Leg": "TAR",
  "Mexican Red Knee": "TAR",

  "Dairy Cow Isopod": "ISO",
  "Rubber Ducky Isopod": "ISO",

  Dog: "DOG",
  Cat: "CAT",
  Rabbit: "RAB",
  Ferret: "FER",
};

export function generateAnimalId(species) {
  const prefix = PREFIXES[species] || "PET";

  const random = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `${prefix}-${random}`;
}