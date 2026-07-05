export default function Timeline({ pets }) {
  // 🟢 Build Timeline Logs
  const allLogs = pets
    .flatMap((pet) =>
      (pet.logs || []).map((log) => ({
        ...log,
        petName: pet.name,
        petSpecies: pet.species,
      }))
    )
    .sort((a, b) => b.time - a.time);

  // 🟢 Timeline Icons
  const getIcon = (type = "") => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes("fed")) return "🍽";
    if (lowerType.includes("shed")) return "🐍";
    if (lowerType.includes("med")) return "💊";
    if (lowerType.includes("weight")) return "⚖️";
    if (lowerType.includes("water")) return "💧";
    if (lowerType.includes("sick")) return "⚠️";
    if (lowerType.includes("status")) return "🔄";
    if (lowerType.includes("substrate")) return "🧼";

    return "📝";
  };

  return (
    <div className="feed">
      {/* 🟢 Page Header */}
      <div className="pageHeader">
        <h2>📜 Care Timeline</h2>
        <p>Every feeding, shed, medication, and care event in one place.</p>
      </div>

      {/* 🟢 Empty State */}
      {allLogs.length === 0 ? (
        <div className="card">
          <h3>No logs yet</h3>
          <p>
            Start by feeding a pet, logging a shed, or adding a medication event.
          </p>
        </div>
      ) : (
        // 🟢 Timeline List
        <div className="timelineList">
          {allLogs.map((log) => (
            <div
              key={log.id || `${log.petName}-${log.time}`}
              className="timelineEvent"
            >
              <div className="timelineDot">
                {getIcon(log.type)}
              </div>

              <div className="timelineContent card">
                {/* 🟢 Timeline Top Row */}
                <div className="timelineTop">
                  <div>
                    <h3>{log.petName}</h3>
                    <p>{log.petSpecies || "Unknown species"}</p>
                  </div>

                  <small>
                    {new Date(log.time).toLocaleString()}
                  </small>
                </div>

                {/* 🟢 Log Details */}
                <p className="timelineType">
                  {log.type}
                </p>

                {log.note && (
                  <p className="timelineNote">
                    {log.note}
                  </p>
                )}

                {/* 🟢 Future Log Actions */}
                <div className="buttonRow">
                  <button
                    onClick={() =>
                      alert("Edit Log coming next!")
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() =>
                      alert("Delete Log coming next!")
                    }
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}