import { useState } from "react";
import PetCard from "../components/PetCard";
import { Card, EmptyState, Icon, PageHeader } from "../components/ui";

export default function Pets({ pets, feedPet, startEdit, openProfile, openQuickMeds, openShedModal, toggleFavorite }) {
  const [searchTerm, setSearchTerm] = useState("");
  const search = searchTerm.toLowerCase().trim();
  const filteredPets = pets.filter((pet) => !search || [pet.name, pet.passportId, pet.species, pet.morph, pet.sex, pet.status].some((value) => value?.toLowerCase().includes(search)));

  return (
    <div className="petsPage">
      <PageHeader
        eyebrow="Collection"
        title="Your pets"
        description={`${filteredPets.length} of ${pets.length} shown`}
        icon={<Icon name="paw" size={22} />}
      />

      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: 14, color: "var(--pp-color-text-subtle)", pointerEvents: "none" }}>
          <Icon name="search" size={17} />
        </span>
        <input
          className="searchInput"
          style={{ paddingLeft: 42 }}
          placeholder="Search by name, passport ID, species, morph, sex, or status"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {pets.length === 0 ? (
        <Card padding="none"><EmptyState icon={<Icon name="paw" size={24} />} title="No pets yet" description="Add your first animal to create a AnyPetOS." /></Card>
      ) : filteredPets.length === 0 ? (
        <Card padding="none"><EmptyState icon={<Icon name="search" size={24} />} title="No matching pets" description="Try a different name, species, ID, morph, sex, or status." /></Card>
      ) : (
        <div className="petGrid">
          {filteredPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} feedPet={feedPet} startEdit={startEdit} openProfile={openProfile} openQuickMeds={openQuickMeds} openShedModal={openShedModal} toggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
