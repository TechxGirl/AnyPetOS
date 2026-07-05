import PetCard from "./PetCard";

export default function Feed({
  pets,
  feedPet,
  addLog,
  startEdit,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
}) {
  // 🟢 Empty Feed State
  if (pets.length === 0) {
    return (
      <div className="feed">
        <h2>📡 Live Feed</h2>
        <p>No pets yet. Add one to start your care timeline.</p>
      </div>
    );
  }

  return (
    <div className="feed">
      {/* 🟢 Feed Header */}
      <h2>📡 Live Feed</h2>

      {/* 🟢 Pet Cards */}
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
  );
}