import { useMemo, useState } from "react";
import { Button, FormField, Input, Modal, Select, Textarea } from "./ui";
import {
  generateMedicationOccurrences,
  getNextMedicationOccurrence,
} from "../utils/medicationSchedule";

function toLocalDate(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toLocalTime(value) {
  const date = new Date(value);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function combineLocalDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;

  const timestamp = new Date(`${dateValue}T${timeValue}`).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
}

function MedicationDoseModalContent({
  pet,
  medication,
  occurrence,
  saving,
  onClose,
  onSubmit,
}) {
  const [now] = useState(Date.now);

  const availableOccurrences = useMemo(
    () =>
      generateMedicationOccurrences(medication, {
        rangeStart: Math.min(
          medication.firstDose || medication.startDate || now,
          now - 365 * 24 * 60 * 60 * 1000
        ),
        rangeEnd: now + 365 * 24 * 60 * 60 * 1000,
        now,
        maxOccurrences: 1000,
      }),
    [medication, now]
  );

  const defaultOccurrence =
    occurrence ||
    getNextMedicationOccurrence(medication, now) ||
    availableOccurrences[0];

  const [scheduledFor, setScheduledFor] = useState(() =>
    defaultOccurrence?.scheduledFor
      ? String(defaultOccurrence.scheduledFor)
      : ""
  );

  const [status, setStatus] = useState(() =>
    defaultOccurrence?.status === "skipped" ? "skipped" : "given"
  );

  const [actualDate, setActualDate] = useState(() =>
    toLocalDate(defaultOccurrence?.givenAt || now)
  );

  const [actualTime, setActualTime] = useState(() =>
    toLocalTime(defaultOccurrence?.givenAt || now)
  );

  const [notes, setNotes] = useState(
    () => defaultOccurrence?.notes || ""
  );

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const scheduledTimestamp = Number(scheduledFor);

    if (!Number.isFinite(scheduledTimestamp)) {
      setError("Choose the scheduled dose you are recording.");
      return;
    }

    const givenAt =
      status === "given"
        ? combineLocalDateTime(actualDate, actualTime)
        : null;

    if (status === "given" && !givenAt) {
      setError("Enter a valid administration date and time.");
      return;
    }

    setError("");

    await onSubmit?.({
      scheduledFor: scheduledTimestamp,
      givenAt,
      status,
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      open
      onClose={() => !saving && onClose?.()}
      title={`Record ${medication.name || "medication"}`}
      description={`${pet.name} • The planned schedule stays fixed unless you edit the course.`}
      size="md"
      closeOnBackdrop={!saving}
      closeOnEscape={!saving}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            loading={saving}
            onClick={handleSubmit}
          >
            {status === "skipped"
              ? "Save skipped dose"
              : "Save dose"}
          </Button>
        </>
      }
    >
      <div className="medication-dose-form">
        <FormField label="Scheduled dose">
          {(fieldProps) => (
            <Select
              {...fieldProps}
              value={scheduledFor}
              onChange={(event) =>
                setScheduledFor(event.target.value)
              }
            >
              <option value="">
                Choose a scheduled dose
              </option>

              {availableOccurrences.map((item) => (
                <option
                  key={item.id}
                  value={item.scheduledFor}
                >
                  Dose {item.doseNumber} •{" "}
                  {new Date(
                    item.scheduledFor
                  ).toLocaleString()}{" "}
                  • {item.status.replaceAll("-", " ")}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField label="Outcome">
          {(fieldProps) => (
            <Select
              {...fieldProps}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
            >
              <option value="given">Given</option>
              <option value="skipped">Skipped</option>
            </Select>
          )}
        </FormField>

        {status === "given" && (
          <div className="medication-dose-date-grid">
            <FormField label="Actually given date">
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="date"
                  value={actualDate}
                  onChange={(event) =>
                    setActualDate(event.target.value)
                  }
                />
              )}
            </FormField>

            <FormField label="Actually given time">
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="time"
                  value={actualTime}
                  onChange={(event) =>
                    setActualTime(event.target.value)
                  }
                />
              )}
            </FormField>
          </div>
        )}

        <FormField label="Notes" optional>
          {(fieldProps) => (
            <Textarea
              {...fieldProps}
              rows={3}
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Reaction, injection site, reason skipped, or other notes"
            />
          )}
        </FormField>

        {error && (
          <p
            className="medication-form-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

export default function MedicationDoseModal({
  open,
  pet,
  medication,
  occurrence,
  saving = false,
  onClose,
  onSubmit,
}) {
  if (!open || !medication || !pet) {
    return null;
  }

  const resetKey = [
    medication.id || medication.name || "medication",
    occurrence?.scheduledFor || "next",
    occurrence?.givenAt || "",
    occurrence?.status || "",
    occurrence?.notes || "",
  ].join("|");

  return (
    <MedicationDoseModalContent
      key={resetKey}
      pet={pet}
      medication={medication}
      occurrence={occurrence}
      saving={saving}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}