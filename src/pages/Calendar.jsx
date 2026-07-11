import { useMemo, useState } from "react";
import MedicationDoseModal from "../components/MedicationDoseModal";
import {
  Badge,
  Button,
  Card,
  FormField,
  Icon,
  IconButton,
  PageHeader,
  Select,
} from "../components/ui";
import {
  getMedicationCalendarEvents,
  getMedicationStatusLabel,
  getMedicationStatusVariant,
} from "../utils/medicationSchedule";

function sameDay(value, year, month, day) {
  const date = new Date(value);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

function eventTimestamp(event) {
  return event.type === "medication" ? event.scheduledFor : event.time;
}

export default function Calendar({ pets, giveMedication }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [animalFilter, setAnimalFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [recordTarget, setRecordTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();
  const rangeStart = firstDay.getTime();
  const rangeEnd = new Date(year, month + 1, 1).getTime() - 1;

  const feedEvents = useMemo(
    () =>
      pets.flatMap((pet) =>
        (pet.logs || [])
          .filter((log) => log.type === "Fed" && log.time >= rangeStart && log.time <= rangeEnd)
          .map((log) => ({
            ...log,
            type: "feeding",
            petId: pet.id,
            petName: pet.name,
            petSpecies: pet.species,
          }))
      ),
    [pets, rangeStart, rangeEnd]
  );

  const medicationEvents = useMemo(
    () => getMedicationCalendarEvents(pets, rangeStart, rangeEnd),
    [pets, rangeStart, rangeEnd]
  );

  const filteredEvents = useMemo(() => {
    return [...feedEvents, ...medicationEvents]
      .filter((event) => animalFilter === "all" || String(event.petId) === animalFilter)
      .filter((event) => categoryFilter === "all" || event.type === categoryFilter)
      .filter((event) => {
        if (statusFilter === "all") return true;
        if (event.type !== "medication") return statusFilter === "feeding";
        return event.status === statusFilter;
      })
      .sort((a, b) => eventTimestamp(a) - eventTimestamp(b));
  }, [feedEvents, medicationEvents, animalFilter, categoryFilter, statusFilter]);

  const getEventsForDay = (day) => filteredEvents.filter((event) => sameDay(eventTimestamp(event), year, month, day));
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const previousMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDay(null);
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const recordDose = async (options) => {
    if (!recordTarget) return;
    try {
      setSaving(true);
      await giveMedication?.(recordTarget.pet.id, recordTarget.medication.id, options);
      setRecordTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="feed careCalendarPage">
      <PageHeader
        eyebrow="Records"
        title="Care calendar"
        description="See feeding records and medication doses across the past, present, and future."
        icon={<Icon name="calendar" size={22} />}
      />

      <Card className="calendarFilterCard">
        <div className="calendarFilters">
          <FormField label="Animal">
            {(fieldProps) => (
              <Select {...fieldProps} value={animalFilter} onChange={(event) => setAnimalFilter(event.target.value)}>
                <option value="all">All animals</option>
                {pets.map((pet) => <option key={pet.id} value={String(pet.id)}>{pet.name}</option>)}
              </Select>
            )}
          </FormField>
          <FormField label="Category">
            {(fieldProps) => (
              <Select {...fieldProps} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All care</option>
                <option value="medication">Medications</option>
                <option value="feeding">Feedings</option>
              </Select>
            )}
          </FormField>
          <FormField label="Medication status">
            {(fieldProps) => (
              <Select {...fieldProps} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="due-today">Due today</option>
                <option value="given">Given</option>
                <option value="given-late">Given late</option>
                <option value="missed">Missed / unrecorded</option>
                <option value="skipped">Skipped</option>
              </Select>
            )}
          </FormField>
        </div>
      </Card>

      <Card>
        <div className="calendarHeader">
          <IconButton variant="secondary" label="Previous month" icon={<Icon name="chevronLeft" size={19} />} onClick={previousMonth} />
          <h2>{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</h2>
          <IconButton variant="secondary" label="Next month" icon={<Icon name="chevronRight" size={19} />} onClick={nextMonth} />
        </div>

        <div className="calendarLegend" aria-label="Medication status legend">
          {["given", "given-late", "due-today", "upcoming", "missed", "skipped"].map((status) => (
            <Badge key={status} variant={getMedicationStatusVariant(status)}>{getMedicationStatusLabel(status)}</Badge>
          ))}
        </div>

        <div className="calendarGrid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="calendarDayName">{day}</div>)}
          {Array.from({ length: startDay }).map((_, index) => <div key={`empty-${index}`} className="calendarCell emptyCell" />)}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const events = getEventsForDay(day);
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
                {events.length > 0 && <div className="calendarCount">{events.length} item{events.length === 1 ? "" : "s"}</div>}
                {events.slice(0, 3).map((event) => (
                  event.type === "medication" ? (
                    <div key={event.id} className={`calendarEvent calendarEvent--${event.status}`}>
                      <span>{event.petName}</span><small>{event.medName}</small>
                    </div>
                  ) : (
                    <div key={event.id || `${event.petName}-${event.time}`} className="feedDot">{event.petName} • Fed</div>
                  )
                ))}
                {events.length > 3 && <small className="calendarMore">+{events.length - 3} more</small>}
              </button>
            );
          })}
        </div>
      </Card>

      {selectedDay && (
        <Card className="calendarDetails">
          <div className="profileHeader">
            <div><h3>{month + 1}/{selectedDay}/{year}</h3><p>{selectedEvents.length} care item{selectedEvents.length === 1 ? "" : "s"}</p></div>
            <Button variant="ghost" size="sm" leftIcon={<Icon name="close" size={15} />} onClick={() => setSelectedDay(null)}>Close</Button>
          </div>

          {selectedEvents.length === 0 ? (
            <p>No care records or scheduled doses for this day.</p>
          ) : (
            <div className="calendarEventDetailsList">
              {selectedEvents.map((event) => (
                event.type === "medication" ? (
                  <div key={event.id} className="calendarEventDetail">
                    <div>
                      <strong>{event.petName} • {event.medName}</strong>
                      <small>{event.dose || "Dose not set"} • {event.route || "Route not set"}</small>
                      <p>Scheduled: {new Date(event.scheduledFor).toLocaleString()}</p>
                      {event.givenAt && <p>Actually given: {new Date(event.givenAt).toLocaleString()}</p>}
                      {event.notes && <p>Notes: {event.notes}</p>}
                    </div>
                    <div className="calendarEventDetailActions">
                      <Badge variant={getMedicationStatusVariant(event.status)}>{getMedicationStatusLabel(event.status)}</Badge>
                      {!event.record && <Button size="sm" onClick={() => setRecordTarget(event)}>Record dose</Button>}
                    </div>
                  </div>
                ) : (
                  <div key={event.id || `${event.petName}-${event.time}`} className="timelineItem">
                    <strong>{event.petName}</strong><small>{event.petSpecies || "Unknown species"}</small><p>{event.note || "Feeding logged"}</p><small>{new Date(event.time).toLocaleString()}</small>
                  </div>
                )
              ))}
            </div>
          )}
        </Card>
      )}

      <MedicationDoseModal
        open={Boolean(recordTarget)}
        pet={recordTarget?.pet}
        medication={recordTarget?.medication}
        occurrence={recordTarget}
        saving={saving}
        onClose={() => !saving && setRecordTarget(null)}
        onSubmit={recordDose}
      />
    </div>
  );
}
