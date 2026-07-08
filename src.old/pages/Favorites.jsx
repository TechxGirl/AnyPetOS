import PetCard from "../components/PetCard";
import { Card, EmptyState, Icon, PageHeader } from "../components/ui";

export default function Favorites({ pets, feedPet, startEdit, openProfile, openQuickMeds, openShedModal, toggleFavorite }) {
  const favorites = pets.filter((pet) => pet.favorite);

  return (
    <div className="petsPage">
      <PageHeader eyebrow="Collection" title="Favorite pets" description="Quick access to the animals you check most often." icon={<Icon name="star" size={22} />} />

      {favorites.length === 0 ? (
        <Card padding="none">
          <EmptyState icon={<Icon name="star" size={24} />} title="No favorites yet" description="Use the Favorite button on a pet card to pin an animal here." />
        </Card>
      ) : (
        <div className="petGrid">
          {favorites.map((pet) => (
            <PetCard key={pet.id} pet={pet} feedPet={feedPet} startEdit={startEdit} openProfile={openProfile} openQuickMeds={openQuickMeds} openShedModal={openShedModal} toggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
