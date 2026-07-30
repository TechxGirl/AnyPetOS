import { Button, Card, EmptyState, Icon, PageHeader, useToast } from "./ui";

export default function Timeline({ pets }) {
  const { showToast } = useToast();
  const allLogs = pets.flatMap((pet) => (pet.logs || []).map((log) => ({ ...log, petName: pet.name, petSpecies: pet.species }))).sort((a, b) => b.time - a.time);

  const getIcon = (type = "") => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("fed")) return "utensils";
    if (lowerType.includes("shed")) return "history";
    if (lowerType.includes("med")) return "pill";
    if (lowerType.includes("weight")) return "weight";
    if (lowerType.includes("water")) return "droplet";
    if (lowerType.includes("sick") || lowerType.includes("status")) return "alert";
    return "file";
  };

  return (
    <div className="feed">
      <PageHeader eyebrow="Records" title="Care timeline" description="Every feeding, shed, medication, weight, and care event in one place." icon={<Icon name="history" size={22} />} />

      {allLogs.length === 0 ? (
        <Card padding="none"><EmptyState icon={<Icon name="history" size={24} />} title="No logs yet" description="Start by feeding a pet, logging a shed, or adding a medication event." /></Card>
      ) : (
        <div className="timelineList">
          {allLogs.map((log) => (
            <div key={log.id || `${log.petName}-${log.time}`} className="timelineEvent">
              <div className="timelineDot"><Icon name={getIcon(log.type)} size={18} /></div>
              <div className="timelineContent card">
                <div className="timelineTop">
                  <div><h3>{log.petName}</h3><p>{log.petSpecies || "Unknown species"}</p></div>
                  <small>{new Date(log.time).toLocaleString()}</small>
                </div>
                <p className="timelineType">{log.type}</p>
                {log.note && <p className="timelineNote">{log.note}</p>}
                <div className="buttonRow">
                  <Button variant="ghost" size="sm" leftIcon={<Icon name="edit" size={14} />} onClick={() => showToast({ title: "Timeline editing is coming next", message: "Editing historical events is planned for a later development phase.", variant: "info" })}>Edit</Button>
                  <Button variant="ghost" size="sm" leftIcon={<Icon name="trash" size={14} />} onClick={() => showToast({ title: "Timeline controls are coming next", message: "Deleting historical events is planned for a later development phase.", variant: "info" })}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
