import { useState } from "react";

// =====================================================
// 🟢 CareGuide.jsx
//
// Species care guide library.
//
// Current Responsibilities:
// • Display care guides
// • Species husbandry information
//
// Future Responsibilities:
// • Search
// • Favorites
// • Filters
// • Offline guides
// • Community guides
// • AI generated care help
//
// =====================================================

export default function CareGuide({ reptiles = [] }) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [search, setSearch] = useState("");

  // =====================================================
  // 🟢 Filtered Guides
  // =====================================================

  const filteredGuides = reptiles.filter((animal) =>
    animal.name.toLowerCase().includes(search.toLowerCase())
  );

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="feed">
      {/* 🟢 Page Header */}
      <div className="pageHeader">
        <h2>📚 Care Guides</h2>

        <p>
          Browse trusted husbandry information for hundreds of species.
        </p>
      </div>

      {/* 🟢 Search */}
      <div className="card">
        <input
          placeholder="Search species..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🟢 Empty State */}
      {filteredGuides.length === 0 ? (
        <div className="card">
          <h3>No care guides found.</h3>

          <p>
            Try searching another species or add more guides
            to your database.
          </p>
        </div>
      ) : (
        filteredGuides.map((animal) => (
          <div key={animal.name} className="card">
            {/* 🟢 Species Header */}
            <h3>{animal.name}</h3>

            {/* 🟢 Husbandry */}
            <p>
              <strong>Diet:</strong> {animal.diet}
            </p>

            <p>
              <strong>Feeding:</strong>{" "}
              Every {animal.frequency} days
            </p>

            <p>
              <strong>Substrate:</strong>{" "}
              {animal.substrate}
            </p>

            {/* 🟢 Future Fields */}
            {animal.temperature && (
              <p>
                <strong>Temperature:</strong>{" "}
                {animal.temperature}
              </p>
            )}

            {animal.humidity && (
              <p>
                <strong>Humidity:</strong>{" "}
                {animal.humidity}
              </p>
            )}

            {animal.temperament && (
              <p>
                <strong>Temperament:</strong>{" "}
                {animal.temperament}
              </p>
            )}

            {animal.level && (
              <p>
                <strong>Difficulty:</strong>{" "}
                {animal.level}
              </p>
            )}

            {/* 🟢 Notes */}
            <p>{animal.notes}</p>
          </div>
        ))
      )}
    </div>
  );
}