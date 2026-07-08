import { useState } from "react";
import { Button, Icon, IconButton, PageHeader } from "../components/ui";

export default function Calendar({ pets }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  const feedLogs = pets.flatMap((pet) =>
    (pet.logs || [])
      .filter((log) => log.type === "Fed")
      .map((log) => ({ ...log, petName: pet.name, petSpecies: pet.species }))
  );

  const getLogsForDay = (day) =>
    feedLogs.filter((log) => {
      const logDate = new Date(log.time);
      return logDate.getFullYear() === year && logDate.getMonth() === month && logDate.getDate() === day;
    });

  const selectedLogs = selectedDay ? getLogsForDay(selectedDay) : [];

  const previousMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="feed">
      <PageHeader
        eyebrow="Records"
        title="Care calendar"
        description="Review feeding activity by month and open a day for full details."
        icon={<Icon name="calendar" size={22} />}
      />

      <div className="card">
        <div className="calendarHeader">
          <IconButton variant="secondary" label="Previous month" icon={<Icon name="chevronLeft" size={19} />} onClick={previousMonth} />
          <h2>{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</h2>
          <IconButton variant="secondary" label="Next month" icon={<Icon name="chevronRight" size={19} />} onClick={nextMonth} />
        </div>

        <div className="calendarGrid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="calendarDayName">{day}</div>
          ))}

          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="calendarCell emptyCell" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const logs = getLogsForDay(day);
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                type="button"
                className={`calendarCell clickableCalendarCell ${isSelected ? "selectedCalendarCell" : ""}`}
                onClick={() => setSelectedDay(day)}
                aria-pressed={isSelected}
              >
                <strong>{day}</strong>
                {logs.length > 0 && (
                  <div className="calendarCount">{logs.length} feeding{logs.length > 1 ? "s" : ""}</div>
                )}
                {logs.slice(0, 3).map((log) => (
                  <div key={log.id || `${log.petName}-${log.time}`} className="feedDot">{log.petName}</div>
                ))}
                {logs.length > 3 && <small className="calendarMore">+{logs.length - 3} more</small>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="card calendarDetails">
          <div className="profileHeader">
            <div>
              <h3>Feedings on {month + 1}/{selectedDay}/{year}</h3>
              <p>{selectedLogs.length} feeding{selectedLogs.length === 1 ? "" : "s"} logged</p>
            </div>
            <Button variant="ghost" size="sm" leftIcon={<Icon name="close" size={15} />} onClick={() => setSelectedDay(null)}>Close</Button>
          </div>

          {selectedLogs.length === 0 ? (
            <p>No feedings logged for this day.</p>
          ) : (
            selectedLogs.map((log) => (
              <div key={log.id || `${log.petName}-${log.time}`} className="timelineItem">
                <strong>{log.petName}</strong>
                <small>{log.petSpecies || "Unknown species"}</small>
                <p>{log.note || "Feeding logged"}</p>
                <small>{new Date(log.time).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
