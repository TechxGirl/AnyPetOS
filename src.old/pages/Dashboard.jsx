import Feed from "../components/Feed";
import StatCard from "../components/StatCard";
import { Button, Card, CardHeader, EmptyState, Icon } from "../components/ui";

export default function Dashboard({
  profile,
  pets,
  feedPet,
  addLog,
  startEdit,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
  setPage,
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const workspaceNames = {
    owner: "Owner workspace",
    breeder: "Breeder workspace",
    rescue: "Rescue workspace",
    veterinarian: "Veterinary workspace",
    education: "Education workspace",
    petsitter: "Pet sitter workspace",
  };

  const workspace = workspaceNames[profile?.role] || "PetPassport workspace";
  const now = Date.now();
  const overdueFeedings = pets.filter((pet) => pet.nextFeed && now > pet.nextFeed);
  const favoritePets = pets.filter((pet) => pet.favorite);
  const attentionPets = pets.filter((pet) => ["Sick", "Monitoring", "Quarantine"].includes(pet.status));

  const medReminders = pets.flatMap((pet) =>
    (pet.meds || []).map((med) => {
      const nextDose = med.lastGiven
        ? med.lastGiven + Number(med.frequencyHours) * 60 * 60 * 1000
        : null;

      return {
        petName: pet.name,
        medName: med.name,
        dose: med.dose,
        route: med.route,
        nextDose,
        isDue: !nextDose || now >= nextDose,
      };
    })
  );

  const dueMeds = medReminders.filter((med) => med.isDue);
  const upcomingMeds = medReminders
    .filter((med) => !med.isDue)
    .sort((a, b) => a.nextDose - b.nextDose)
    .slice(0, 3);

  const todayFocus = [
    ...dueMeds.map((med) => ({
      id: `med-${med.petName}-${med.medName}`,
      icon: "pill",
      title: med.petName,
      subtitle: `${med.medName}${med.dose ? ` • ${med.dose}` : ""}`,
      status: "Due now",
    })),
    ...overdueFeedings.slice(0, 3).map((pet) => ({
      id: `feed-${pet.id}`,
      icon: "utensils",
      title: pet.name,
      subtitle: "Feeding is overdue",
      status: "Needs care",
    })),
    ...attentionPets.slice(0, 3).map((pet) => ({
      id: `attention-${pet.id}`,
      icon: "alert",
      title: pet.name,
      subtitle: `${pet.status} status`,
      status: "Monitor",
    })),
  ].slice(0, 5);

  if (pets.length === 0) {
    return (
      <div className="feed">
        <Card padding="none">
          <EmptyState
            icon={<Icon name="paw" size={24} />}
            title="Create your first passport"
            description="Track care, feeding, medications, weights, sheds, and health history in one organized profile."
            action={
              <Button leftIcon={<Icon name="plus" size={18} />} onClick={() => setPage("Add Pet")}>
                Create first passport
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="feed">
      <section className="dashboardHero">
        <div>
          <h1>{greeting}, {profile?.display_name || "Pet Keeper"}</h1>
          <p>Welcome back to your {workspace}.</p>
        </div>
        <div className="heroStats" aria-label="Workspace summary">
          <span>{pets.length} passports</span>
          <span>{dueMeds.length} medications due</span>
          <span>{attentionPets.length} need attention</span>
        </div>
      </section>

      <Card className="focusCard">
        <CardHeader
          icon={<Icon name="clipboard" size={19} />}
          title="Today's focus"
          description="The most important care items across your collection."
        />
        {todayFocus.length === 0 ? (
          <p>Everything looks calm today. No urgent care tasks right now.</p>
        ) : (
          <div className="focusList">
            {todayFocus.map((item) => (
              <div key={item.id} className="focusItem">
                <span className="focusIcon"><Icon name={item.icon} size={19} /></span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.subtitle}</p>
                </div>
                <small>{item.status}</small>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="statGrid">
        <StatCard icon={<Icon name="paw" size={20} />} value={pets.length} label="Passports" color="#34d399" />
        <StatCard icon={<Icon name="star" size={20} />} value={favoritePets.length} label="Favorites" color="#fbbf24" />
        <StatCard icon={<Icon name="utensils" size={20} />} value={overdueFeedings.length} label="Feedings due" color="#fb923c" />
        <StatCard icon={<Icon name="pill" size={20} />} value={dueMeds.length} label="Medications due" color="#60a5fa" />
        <StatCard icon={<Icon name="alert" size={20} />} value={attentionPets.length} label="Need attention" color="#fb7185" />
      </div>

      <Card>
        <CardHeader
          icon={<Icon name="pill" size={19} />}
          title="Medication reminders"
          description="Active medication schedules across all pets."
        />
        {medReminders.length === 0 ? (
          <p>No active medications yet.</p>
        ) : (
          <>
            {dueMeds.length > 0 && (
              <>
                <h4>Due now or overdue</h4>
                {dueMeds.map((med, index) => (
                  <div key={`due-${index}`} className="reminderLine overdueLine">
                    <strong>{med.petName}</strong>
                    <span>{med.medName}{med.dose ? ` • ${med.dose}` : ""}</span>
                    <small>Due now</small>
                  </div>
                ))}
              </>
            )}
            {upcomingMeds.length > 0 && (
              <>
                <h4>Upcoming</h4>
                {upcomingMeds.map((med, index) => (
                  <div key={`upcoming-${index}`} className="reminderLine">
                    <strong>{med.petName}</strong>
                    <span>{med.medName}{med.dose ? ` • ${med.dose}` : ""}</span>
                    <small>{new Date(med.nextDose).toLocaleString()}</small>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </Card>

      <Feed
        pets={pets}
        feedPet={feedPet}
        addLog={addLog}
        startEdit={startEdit}
        openProfile={openProfile}
        openQuickMeds={openQuickMeds}
        openShedModal={openShedModal}
        toggleFavorite={toggleFavorite}
      />
    </div>
  );
}
