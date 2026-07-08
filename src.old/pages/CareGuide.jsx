import { useState } from "react";
import { Card, EmptyState, Icon, PageHeader } from "../components/ui";

export default function CareGuide({ reptiles = [] }) {
  const [search, setSearch] = useState("");
  const filteredGuides = reptiles.filter((animal) => animal.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="feed">
      <PageHeader
        eyebrow="Reference library"
        title="Care guides"
        description="Browse husbandry information and use it as a starting point for individualized care."
        icon={<Icon name="book" size={22} />}
      />

      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: 14, color: "var(--pp-color-text-subtle)", pointerEvents: "none" }}>
          <Icon name="search" size={17} />
        </span>
        <input
          className="searchInput"
          style={{ paddingLeft: 42 }}
          placeholder="Search species"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {filteredGuides.length === 0 ? (
        <Card padding="none">
          <EmptyState icon={<Icon name="book" size={24} />} title="No care guides found" description="Try another species name or add more guides to your database." />
        </Card>
      ) : (
        <div className="petGrid">
          {filteredGuides.map((animal) => (
            <Card key={animal.name} interactive>
              <h3>{animal.name}</h3>
              <p><strong>Diet:</strong> {animal.diet}</p>
              <p><strong>Feeding:</strong> Every {animal.frequency} days</p>
              <p><strong>Substrate:</strong> {animal.substrate}</p>
              {animal.temperature && <p><strong>Temperature:</strong> {animal.temperature}</p>}
              {animal.humidity && <p><strong>Humidity:</strong> {animal.humidity}</p>}
              {animal.temperament && <p><strong>Temperament:</strong> {animal.temperament}</p>}
              {animal.level && <p><strong>Difficulty:</strong> {animal.level}</p>}
              {animal.notes && <p>{animal.notes}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
