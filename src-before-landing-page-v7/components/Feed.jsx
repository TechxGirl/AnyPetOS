import PetCard from "./PetCard";
import { Icon } from "./ui";

export default function Feed({ pets, feedPet, addLog, startEdit, openProfile, openQuickMeds, openShedModal, toggleFavorite }) {
  if (pets.length === 0) return null;

  return (
    <section className="feed">
      <div className="pageHeader">
        <div>
          <h2>Collection overview</h2>
          <p>Quick access to your pet profiles and daily care actions.</p>
        </div>
        <span className="statusBadge status-healthy"><Icon name="activity" size={14} /> Live records</span>
      </div>
      <div className="petGrid">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            feedPet={feedPet}
            addLog={addLog}
            startEdit={startEdit}
            openProfile={openProfile}
            openQuickMeds={openQuickMeds}
            openShedModal={openShedModal}
            toggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
