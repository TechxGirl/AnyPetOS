import { useState } from "react";

// =====================================================
// 🟢 Calendar.jsx
//
// Feeding history calendar.
//
// Current Responsibilities:
// • Shows feeding logs by month
// • Lets user click a day
// • Shows feeding details for that day
//
// Future Responsibilities:
// • Filter by pet
// • Show meds, sheds, weight, and cleaning logs
// • Export monthly care history
//
// =====================================================

export default function Calendar({ pets }) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // =====================================================
  // 🟢 Date Helpers
  // =====================================================

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  // =====================================================
  // 🟢 Feeding Logs
  // =====================================================

  const feedLogs = pets.flatMap((pet) =>
    (pet.logs || [])
      .filter((log) => log.type === "Fed")
      .map((log) => ({
        ...log,
        petName: pet.name,
        petSpecies: pet.species,
      }))
  );

  const getLogsForDay = (day) => {
    return feedLogs.filter((log) => {
      const logDate = new Date(log.time);

      return (
        logDate.getFullYear() === year &&
        logDate.getMonth() === month &&
        logDate.getDate() === day
      );
    });
  };

  const selectedLogs = selectedDay
    ? getLogsForDay(selectedDay)
    : [];

  // =====================================================
  // 🟢 Calendar Navigation
  // =====================================================

  const previousMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div className="feed">
      {/* 🟢 Calendar Header */}
      <div className="calendarHeader">
        <button onClick={previousMonth}>←</button>

        <h2>
          📅{" "}
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>

        <button onClick={nextMonth}>→</button>
      </div>

      {/* 🟢 Calendar Grid */}
      <div className="calendarGrid">
        {/* 🟢 Weekday Labels */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendarDayName">
            {day}
          </div>
        ))}

        {/* 🟢 Empty Leading Cells */}
        {Array.from({ length: startDay }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="calendarCell emptyCell"
          />
        ))}

        {/* 🟢 Month Days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const logs = getLogsForDay(day);
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              className={`calendarCell clickableCalendarCell ${
                isSelected ? "selectedCalendarCell" : ""
              }`}
              onClick={() => setSelectedDay(day)}
            >
              <strong>{day}</strong>

              {logs.length > 0 && (
                <div className="calendarCount">
                  🍽 {logs.length} feeding
                  {logs.length > 1 ? "s" : ""}
                </div>
              )}

              {logs.slice(0, 3).map((log) => (
                <div key={log.id} className="feedDot">
                  {log.petName}
                </div>
              ))}

              {logs.length > 3 && (
                <small className="calendarMore">
                  +{logs.length - 3} more
                </small>
              )}
            </button>
          );
        })}
      </div>

      {/* 🟢 Selected Day Details */}
      {selectedDay && (
        <div className="card calendarDetails">
          <div className="profileHeader">
            <div>
              <h3>
                🍽 Feedings on {month + 1}/{selectedDay}/{year}
              </h3>

              <p>
                {selectedLogs.length} feeding
                {selectedLogs.length === 1 ? "" : "s"} logged
              </p>
            </div>

            <button onClick={() => setSelectedDay(null)}>
              ✕
            </button>
          </div>

          {selectedLogs.length === 0 ? (
            <p>No feedings logged for this day.</p>
          ) : (
            selectedLogs.map((log) => (
              <div key={log.id} className="timelineItem">
                <strong>{log.petName}</strong>

                <small>
                  {log.petSpecies || "Unknown species"}
                </small>

                <p>{log.note || "Feeding logged"}</p>

                <small>
                  {new Date(log.time).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}