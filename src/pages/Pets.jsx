import { useState } from "react";
import PetCard from "../components/PetCard";

// =====================================================
// 🟢 Pets.jsx
//
// Main pet collection page.
//
// Current Responsibilities:
// • Display all pets
// • Search pets
// • Open pet profiles
// • Quick actions through PetCard
//
// Future Responsibilities:
// • Filters
// • Collections
// • Role-based views
// • Bulk actions
// • Expo mode
//
// =====================================================

export default function Pets({
  pets,
  feedPet,
  startEdit,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
}) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // 🟢 Search
  // =====================================================

  const filteredPets = pets.filter((pet) => {
    const search = searchTerm.toLowerCase();

    return (
      pet.name?.toLowerCase().includes(search) ||
      pet.passportId?.toLowerCase().includes(search) ||
      pet.species?.toLowerCase().includes(search) ||
      pet.morph?.toLowerCase().includes(search) ||
      pet.sex?.toLowerCase().includes(search) ||
      pet.status?.toLowerCase().includes(search)
    );
  });

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="petsPage">
      {/* 🟢 Header */}
      <div className="pageHeader">
        <h2>🐾 Your Pets</h2>

        <p>
          {filteredPets.length} of {pets.length} shown
        </p>
      </div>

      {/* 🟢 Search Bar */}
      <input
        className="searchInput"
        placeholder="🔍 Search by name, Passport ID, species, morph, sex, or status..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 🟢 Empty States / Pet Grid */}
      {pets.length === 0 ? (
        <div className="card">
          <h3>No pets yet.</h3>
          <p>Add your first animal to create a PetPassport.</p>
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="card">
          <h3>No pets match your search.</h3>
          <p>Try searching by name, Passport ID, species, morph, sex, or status.</p>
        </div>
      ) : (
        <div className="petGrid">
          {filteredPets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              feedPet={feedPet}
              startEdit={startEdit}
              openProfile={openProfile}
              openQuickMeds={openQuickMeds}
              openShedModal={openShedModal}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}