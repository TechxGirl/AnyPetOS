import PetCard from "../components/PetCard";

// =====================================================
// 🟢 Favorites.jsx
//
// Displays all favorite animals.
//
// Current Responsibilities:
// • View favorite pets
// • Quick access
//
// Future Responsibilities:
// • Expo animals
// • Sale animals
// • Breeding holdbacks
// • Wishlist
//
// =====================================================

export default function Favorites({
  pets,
  feedPet,
  startEdit,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
}) {
  // =====================================================
  // 🟢 Favorite Pets
  // =====================================================

  const favorites = pets.filter((pet) => pet.favorite);

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="petsPage">
      {/* 🟢 Header */}
      <div className="pageHeader">
        <h2>⭐ Favorite Pets</h2>

        <p>
          Quick access to your most important animals.
        </p>
      </div>

      {/* 🟢 Favorite Count */}
      <div className="card">
        <strong>
          {favorites.length} Favorite
          {favorites.length === 1 ? "" : "s"}
        </strong>
      </div>

      {/* 🟢 Empty State */}
      {favorites.length === 0 ? (
        <div className="card">
          <h3>No favorites yet.</h3>

          <p>
            Click the ⭐ button on any pet to pin it here.
          </p>
        </div>
      ) : (
        // 🟢 Favorite Pet Cards
        <div className="petGrid">
          {favorites.map((pet) => (
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