// ==========================================
// PetPassport
// Filter Pets Utility
// ==========================================

export function filterPets(pets, searchTerm = "") {
  const search = searchTerm.toLowerCase().trim();

  if (!search) return pets;

  return pets.filter((pet) => {
    return (
      pet.name?.toLowerCase().includes(search) ||
      pet.passportId?.toLowerCase().includes(search) ||
      pet.species?.toLowerCase().includes(search) ||
      pet.morph?.toLowerCase().includes(search) ||
      pet.sex?.toLowerCase().includes(search) ||
      pet.status?.toLowerCase().includes(search)
    );
  });
}