import Feed from "../components/Feed";
import { useWorkspace } from "../context/WorkspaceContext";
import { Button, Card, CardHeader, EmptyState, Icon } from "../components/ui";
import { getPetInitials, getPetPhotoUrl } from "../utils/images";
import { getNextMedicationDose, isMedicationDue } from "../utils/medicationSchedule";

function getMetricValue(metric, { pets, dueMeds, overdueFeedings, attentionPets, favoritePets, transferPets }) {
  const values = {
    adoption: pets.filter((pet) => ["Adoption Ready", "Available"].includes(pet.status)).length,
    attention: attentionPets.length,
    intake: pets.filter((pet) => ["Intake", "New"].includes(pet.status)).length,
    logs: pets.reduce((total, pet) => total + (pet.logs?.length || 0), 0),
    meds: dueMeds.length,
    modules: "Ready",
    pipeline: pets.length,
    ready: pets.filter((pet) => ["Healthy", "Ambassador", "Available", "Sale Ready"].includes(pet.status)).length,
    tasks: dueMeds.length + overdueFeedings.length,
    transfers: transferPets.length,
    favorites: favoritePets.length,
  };

  return values[metric] ?? pets.length;
}

function countPipelinePets(pets, pipeline) {
  return pets.filter((pet) =>
    pipeline.statuses.some((status) => String(pet.status || "").toLowerCase() === status.toLowerCase())
  ).length;
}

function formatShortDate(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not scheduled";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function DashboardAnimalTile({ pet, openProfile }) {
  const photoUrl = getPetPhotoUrl(pet);

  return (
    <button type="button" className="premiumAnimalTile" onClick={() => openProfile(pet.id)}>
      <span className="premiumAnimalPhoto" aria-hidden="true">
        {photoUrl ? (
          <img src={photoUrl} alt="" />
        ) : (
          <span className="premiumAnimalFallback">
            <strong>{getPetInitials(pet)}</strong>
            <small>{pet.species || "Pet"}</small>
          </span>
        )}
      </span>
      <span className="premiumAnimalCopy">
        <strong>{pet.name || "Unnamed animal"}</strong>
        <small>{pet.species || "Unknown species"}</small>
      </span>
      <span className={`premiumMiniBadge status-${String(pet.status || "healthy").toLowerCase().replace(/\s+/g, "-")}`}>
        {pet.status || "Healthy"}
      </span>
    </button>
  );
}

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
  const { workspace } = useWorkspace();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const displayName = profile?.display_name || "Morgan";

  const now = Date.now();
  const overdueFeedings = pets.filter((pet) => pet.nextFeed && now > pet.nextFeed);
  const favoritePets = pets.filter((pet) => pet.favorite);
  const attentionPets = pets.filter((pet) => ["Sick", "Monitoring", "Quarantine", "Watch", "Vet Needed", "Recovering"].includes(pet.status));
  const transferPets = pets.filter((pet) => pet.transfer?.status === "pending" || pet.share?.enabled);

  const medReminders = pets.flatMap((pet) =>
    (pet.meds || []).map((med) => {
      const nextDose = getNextMedicationDose(med);

      return {
        petName: pet.name,
        medName: med.name,
        dose: med.dose,
        route: med.route,
        nextDose,
        isDue: isMedicationDue(med, now),
      };
    })
  );

  const dueMeds = medReminders.filter((med) => med.isDue);
  const upcomingMeds = medReminders.filter((med) => !med.isDue).sort((a, b) => a.nextDose - b.nextDose).slice(0, 3);

  const metricContext = { pets, dueMeds, overdueFeedings, attentionPets, favoritePets, transferPets };
  const statCards = [
    { label: workspace.terminology.collection, value: pets.length, icon: workspace.icon, hint: `${favoritePets.length} favorites` },
    ...workspace.dashboardCards.slice(0, 4).map((card) => ({
      label: card.title,
      value: getMetricValue(card.metric, metricContext),
      icon: card.icon,
      hint: card.description,
    })),
  ].slice(0, 5);

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
    ...upcomingMeds.map((med, index) => ({
      id: `upcoming-${index}`,
      icon: "clock",
      title: med.petName,
      subtitle: med.medName,
      status: formatShortDate(med.nextDose),
    })),
  ].slice(0, 5);

  if (pets.length === 0) {
    return (
      <div className="feed premiumDashboardPage">
        <section className="premiumDashboardHero" style={{ "--workspace-card-accent": workspace.accent }}>
          <div>
            <p className="section-eyebrow">{workspace.label}</p>
            <h1>{greeting}, {displayName} 👋</h1>
            <p className="anypetosHeroSlogan">Any time. Any place. Any Pet.</p>
            <p>{workspace.description}</p>
          </div>
          <div className="premiumHeroActions">
            <Button leftIcon={<Icon name="plus" size={18} />} onClick={() => setPage("Add Pet")}>Add animal</Button>
            <Button variant="outline" leftIcon={<Icon name="upload" size={18} />} onClick={() => setPage("Data Center")}>Import collection</Button>
            <Button variant="ghost" leftIcon={<Icon name="message" size={18} />} onClick={() => setPage("Beta Feedback")}>Beta feedback</Button>
          </div>
        </section>

        <Card padding="none">
          <EmptyState
            icon={<Icon name={workspace.icon} size={24} />}
            title={`Create your first ${workspace.terminology.record}`}
            description={`Start your ${workspace.shortLabel.toLowerCase()} workflow with one animal, or use the Data Center to import a full collection.`}
            action={<Button leftIcon={<Icon name="plus" size={18} />} onClick={() => setPage("Add Pet")}>Create first Passport</Button>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="feed premiumDashboardPage">
      <section className="premiumDashboardHero" style={{ "--workspace-card-accent": workspace.accent }}>
        <div>
          <p className="section-eyebrow">{workspace.label}</p>
          <h1>{greeting}, {displayName} 👋</h1>
          <p className="anypetosHeroSlogan">Any time. Any place. Any Pet.</p>
          <p>{workspace.focusTitle}: {workspace.description}</p>
        </div>
        <div className="premiumHeroActions">
          <Button leftIcon={<Icon name="plus" size={18} />} onClick={() => setPage("Add Pet")}>Add animal</Button>
          <Button variant="outline" leftIcon={<Icon name="upload" size={18} />} onClick={() => setPage("Data Center")}>Import</Button>
          <Button variant="ghost" leftIcon={<Icon name="message" size={18} />} onClick={() => setPage("Beta Feedback")}>Beta feedback</Button>
        </div>
      </section>

      <div className="premiumStatStrip">
        {statCards.map((card) => (
          <Card key={card.label} className="premiumStatCard" style={{ "--workspace-card-accent": workspace.accent }}>
            <span className="premiumStatIcon"><Icon name={card.icon} size={19} /></span>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
            <small>{card.hint}</small>
          </Card>
        ))}
      </div>

      <div className="premiumDashboardTwoColumn">
        <Card className="premiumCollectionCard">
          <CardHeader
            icon={<Icon name="paw" size={19} />}
            title={`Your ${workspace.terminology.collection}`}
            description="Real pet photos only, clean placeholders when no photo has been uploaded."
            action={<Button size="sm" variant="ghost" onClick={() => setPage("Pets")}>View all</Button>}
          />
          <div className="premiumAnimalGrid">
            {pets.slice(0, 4).map((pet) => <DashboardAnimalTile key={pet.id} pet={pet} openProfile={openProfile} />)}
          </div>
        </Card>

        <Card className="premiumReminderCard">
          <CardHeader
            icon={<Icon name="calendar" size={19} />}
            title="Upcoming reminders"
            description="Care, medical, and status items that need attention."
          />
          {todayFocus.length === 0 ? (
            <p className="premiumCalmText">Everything looks calm today. No urgent care tasks right now.</p>
          ) : (
            <div className="premiumReminderList">
              {todayFocus.map((item) => (
                <button key={item.id} type="button" className="premiumReminderItem" onClick={() => setPage("Calendar")}>
                  <span><Icon name={item.icon} size={17} /></span>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                  <em>{item.status}</em>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="premiumPipelineCard">
        <CardHeader
          icon={<Icon name="activity" size={19} />}
          title={`${workspace.shortLabel} pipeline`}
          description="Status lanes change by workspace so each role gets a useful operational snapshot."
        />
        <div className="premiumPipelineGrid">
          {workspace.pipelines.map((pipeline) => (
            <button className="premiumPipelineLane" type="button" key={pipeline.label} onClick={() => setPage("Pets")}>
              <strong>{countPipelinePets(pets, pipeline)}</strong>
              <span>{pipeline.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="premiumQuickActionsCard">
        <CardHeader
          icon={<Icon name="sparkles" size={19} />}
          title="Workspace quick actions"
          description={`Fast paths for the ${workspace.shortLabel.toLowerCase()} interface.`}
        />
        <div className="workspaceQuickActions premiumQuickActions">
          {workspace.quickActions.map((action) => (
            <Button key={action.label} variant="outline" leftIcon={<Icon name={action.icon} size={16} />} onClick={() => setPage(action.page)}>
              {action.label}
            </Button>
          ))}
        </div>
      </Card>

      <section className="premiumFeedSection">
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
      </section>
    </div>
  );
}
