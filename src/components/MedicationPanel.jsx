import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  FormField,
  Icon,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
  useToast,
} from "./ui";
import MedicationDoseModal from "./MedicationDoseModal";
import { createId } from "../utils/id";
import {
  generateMedicationOccurrences,
  getMedicationCourseLabel,
  getMedicationDurationCount,
  getMedicationDurationUnit,
  getMedicationLastGiven,
  getMedicationProgress,
  getMedicationStatusLabel,
  getMedicationStatusVariant,
  getNextMedicationOccurrence,
  isMedicationDue,
} from "../utils/medicationSchedule";

const EMPTY_FORM = {
  petId: "",
  name: "",
  dose: "",
  route: "Oral",
  frequencyHours: 72,
  durationCount: 10,
  durationUnit: "doses",
  firstDoseDate: "",
  firstDoseTime: "",
  notes: "",
  continueIndefinitely: false,
};

function formatDateTime(value) {
  if (!value) return "Not logged";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
}

function formatLocalDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function getCardOccurrences(med) {
  const anchor = med.firstDose || med.startDate || Date.now();
  if (med.continueIndefinitely) {
    return generateMedicationOccurrences(med, {
      rangeStart: Date.now() - 30 * 24 * 60 * 60 * 1000,
      rangeEnd: Date.now() + 90 * 24 * 60 * 60 * 1000,
      maxOccurrences: 500,
    });
  }
  return generateMedicationOccurrences(med, {
    rangeStart: anchor,
    maxOccurrences: 1000,
  });
}

export default function MedicationPanel({
  pets,
  addMedication,
  giveMedication,
  updatePetInCloud,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingMed, setEditingMed] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [recordTarget, setRecordTarget] = useState(null);
  const [backfillTarget, setBackfillTarget] = useState(null);
  const [backfillConfirmed, setBackfillConfirmed] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState({});
  const [pendingAction, setPendingAction] = useState("");
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  const medicationCount = useMemo(
    () => pets.reduce((total, pet) => total + (pet.meds || []).length, 0),
    [pets]
  );

  const findPet = (petId) =>
    pets.find(
      (pet) =>
        String(pet.id) === String(petId) ||
        String(pet.cloudId) === String(petId)
    );

  const buildFirstDoseTimestamp = () => {
    if (!form.firstDoseDate) return null;
    const time = form.firstDoseTime || "00:00";
    const timestamp = new Date(`${form.firstDoseDate}T${time}`).getTime();
    if (Number.isNaN(timestamp)) {
      throw new Error("Please enter a valid first-dose date and time.");
    }
    return timestamp;
  };

  const validateForm = () => {
    const nextErrors = {};
    const frequencyHours = Number(form.frequencyHours);
    const durationCount = Number(form.durationCount);

    if (!form.petId) nextErrors.petId = "Choose an animal.";
    if (!form.name.trim()) nextErrors.name = "Enter a medication name.";
    if (!form.firstDoseDate) nextErrors.firstDoseDate = "Enter the first scheduled dose date.";
    if (!form.firstDoseTime) nextErrors.firstDoseTime = "Enter the first scheduled dose time.";
    if (!Number.isFinite(frequencyHours) || frequencyHours <= 0) {
      nextErrors.frequencyHours = "Choose a valid dosing interval.";
    }
    if (
      !form.continueIndefinitely &&
      (!Number.isFinite(durationCount) || durationCount <= 0)
    ) {
      nextErrors.durationCount = "Enter a course length greater than zero.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setEditingMed(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!validateForm() || pendingAction) return;

    const pet = findPet(form.petId);
    if (!pet) {
      showToast({
        title: "Animal not found",
        message: "Refresh the page and choose the animal again.",
        variant: "error",
      });
      return;
    }

    try {
      setPendingAction("add");
      const firstDoseTimestamp = buildFirstDoseTimestamp();
      const result = await addMedication(pet.id, {
        ...form,
        durationCount: Number(form.durationCount),
        durationUnit: form.durationUnit,
        firstDose: firstDoseTimestamp,
        lastGiven: null,
        doseHistory: [],
      });

      if (result?.ok !== false) resetForm();
    } catch (error) {
      console.error("Unable to add medication:", error);
      showToast({
        title: "Medication not added",
        message: error?.message || "Please check the details and try again.",
        variant: "error",
      });
    } finally {
      setPendingAction("");
    }
  };

  const startEditMed = (petId, med) => {
    const pet = findPet(petId);
    if (!pet) return;

    const firstDoseDate = formatLocalDateInput(med.firstDose || med.startDate);
    const firstDoseTime = med.firstDose || med.startDate
      ? new Date(med.firstDose || med.startDate).toTimeString().slice(0, 5)
      : "";

    setEditingMed({ petId: pet.id, medId: med.id });
    setForm({
      petId: pet.id,
      name: med.name || "",
      dose: med.dose || "",
      route: med.route || "Oral",
      frequencyHours: med.frequencyHours || 72,
      durationCount: getMedicationDurationCount(med) || 10,
      durationUnit: getMedicationDurationUnit(med) === "ongoing" ? "doses" : getMedicationDurationUnit(med),
      firstDoseDate,
      firstDoseTime,
      notes: med.notes || "",
      continueIndefinitely: Boolean(med.continueIndefinitely),
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEditMed = async (event) => {
    event.preventDefault();
    if (!editingMed || !validateForm() || pendingAction) return;

    const pet = findPet(editingMed.petId);
    if (!pet) return;

    try {
      setPendingAction("edit");
      const firstDoseTimestamp = buildFirstDoseTimestamp();
      const updatedMeds = (pet.meds || []).map((med) =>
        med.id === editingMed.medId
          ? {
              ...med,
              name: form.name.trim(),
              dose: form.dose.trim(),
              route: form.route,
              frequencyHours: Number(form.frequencyHours),
              durationCount: Number(form.durationCount) || 10,
              durationUnit: form.durationUnit,
              durationDays:
                form.durationUnit === "days"
                  ? Number(form.durationCount) || 10
                  : null,
              continueIndefinitely: Boolean(form.continueIndefinitely),
              firstDose: firstDoseTimestamp,
              startDate: firstDoseTimestamp,
              lastGiven: med.lastGiven || null,
              doseHistory: Array.isArray(med.doseHistory) ? med.doseHistory : [],
              notes: form.notes.trim(),
            }
          : med
      );

      await updatePetInCloud(pet.id, {
        meds: updatedMeds,
        logs: [
          {
            id: createId("event"),
            type: "Medication Updated",
            note: form.name.trim(),
            time: Date.now(),
          },
          ...(pet.logs || []),
        ],
      });

      showToast({
        title: "Medication updated",
        message: `${form.name.trim()} was updated for ${pet.name}.`,
        variant: "success",
      });
      resetForm();
    } catch (error) {
      console.error("Unable to update medication:", error);
      showToast({
        title: "Changes not saved",
        message: error?.message || "Please try again.",
        variant: "error",
      });
    } finally {
      setPendingAction("");
    }
  };

  const confirmDeleteMedication = async () => {
    if (!deleteTarget || pendingAction) return;
    const pet = findPet(deleteTarget.petId);
    if (!pet) return;

    try {
      setPendingAction(`delete-${deleteTarget.medId}`);
      await updatePetInCloud(pet.id, {
        meds: (pet.meds || []).filter((med) => med.id !== deleteTarget.medId),
        logs: [
          {
            id: createId("event"),
            type: "Medication Deleted",
            note: deleteTarget.name || "Medication removed",
            time: Date.now(),
          },
          ...(pet.logs || []),
        ],
      });

      showToast({
        title: "Medication deleted",
        message: `${deleteTarget.name || "The medication"} was removed from ${pet.name}.`,
        variant: "success",
      });
      setDeleteTarget(null);
    } catch (error) {
      console.error("Unable to delete medication:", error);
      showToast({
        title: "Medication not deleted",
        message: error?.message || "Please try again.",
        variant: "error",
      });
    } finally {
      setPendingAction("");
    }
  };

  const submitDoseRecord = async (options) => {
    if (!recordTarget || pendingAction) return;
    try {
      setPendingAction(`give-${recordTarget.med.id}`);
      await giveMedication(recordTarget.pet.id, recordTarget.med.id, options);
      setRecordTarget(null);
    } finally {
      setPendingAction("");
    }
  };

  const openBackfill = (pet, med) => {
    const occurrences = getCardOccurrences(med).filter(
      (item) => item.scheduledFor < startOfToday() && item.status === "missed"
    );
    setBackfillConfirmed(false);
    setBackfillTarget({ pet, med, occurrences });
  };

  const confirmBackfill = async () => {
    if (!backfillTarget || !backfillConfirmed || pendingAction) return;
    const { pet, med, occurrences } = backfillTarget;
    if (!occurrences.length) return;

    try {
      setPendingAction(`backfill-${med.id}`);
      const existingHistory = Array.isArray(med.doseHistory) ? med.doseHistory : [];
      const newRecords = occurrences.map((item) => ({
        id: createId("dose"),
        scheduledFor: item.scheduledFor,
        givenAt: item.scheduledFor,
        status: "given",
        notes: "Backfilled as given at the scheduled time.",
      }));
      const combinedHistory = [...newRecords, ...existingHistory];
      const latestGiven = Math.max(...combinedHistory.map((item) => Number(item.givenAt) || 0));
      const updatedMeds = (pet.meds || []).map((item) =>
        item.id === med.id
          ? {
              ...item,
              doseHistory: combinedHistory,
              lastGiven: latestGiven || null,
            }
          : item
      );

      await updatePetInCloud(pet.id, {
        meds: updatedMeds,
        logs: [
          {
            id: createId("event"),
            type: "Medication History Backfilled",
            note: `${med.name || "Medication"} • ${newRecords.length} earlier doses confirmed`,
            time: Date.now(),
          },
          ...(pet.logs || []),
        ],
      });

      showToast({
        title: "Earlier doses recorded",
        message: `${newRecords.length} ${med.name || "medication"} doses were added to ${pet.name}'s history.`,
        variant: "success",
      });
      setBackfillTarget(null);
      setBackfillConfirmed(false);
    } catch (error) {
      console.error("Unable to backfill medication history:", error);
      showToast({
        title: "History not updated",
        message: error?.message || "Please try again.",
        variant: "error",
      });
    } finally {
      setPendingAction("");
    }
  };

  return (
    <div className="page-shell medication-page">
      <PageHeader
        eyebrow="Health management"
        title="Medications"
        description="Create fixed treatment schedules, record each actual dose, and keep the calendar in sync."
        icon={<Icon name="pill" size={23} />}
        actions={
          <Badge variant={medicationCount > 0 ? "info" : "neutral"}>
            {medicationCount} {medicationCount === 1 ? "course" : "courses"}
          </Badge>
        }
      />

      <Card className="medication-form-card">
        <CardHeader
          title={editingMed ? "Edit medication course" : "Add medication course"}
          description={
            editingMed
              ? "Changing the schedule does not rewrite recorded administration history."
              : "Enter the veterinarian's schedule. Planned doses and actual administrations are stored separately."
          }
          icon={<Icon name={editingMed ? "edit" : "plus"} size={20} />}
        />

        <form className="medication-form" onSubmit={editingMed ? saveEditMed : handleAdd} noValidate>
          <div className="medication-form-grid">
            <FormField label="Animal" error={errors.petId}>
              {(fieldProps) => (
                <Select
                  {...fieldProps}
                  value={form.petId}
                  error={Boolean(errors.petId)}
                  disabled={Boolean(editingMed)}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, petId: event.target.value }));
                    setErrors((current) => ({ ...current, petId: undefined }));
                  }}
                >
                  <option value="">Select animal</option>
                  {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                </Select>
              )}
            </FormField>

            <FormField label="Medication name" error={errors.name}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  placeholder="For example, Baytril or Meloxicam"
                  value={form.name}
                  error={Boolean(errors.name)}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, name: event.target.value }));
                    setErrors((current) => ({ ...current, name: undefined }));
                  }}
                />
              )}
            </FormField>

            <FormField label="Dose" optional>
              {(fieldProps) => <Input {...fieldProps} placeholder="For example, 0.18 mL" value={form.dose} onChange={(event) => setForm((current) => ({ ...current, dose: event.target.value }))} />}
            </FormField>

            <FormField label="Route">
              {(fieldProps) => (
                <Select {...fieldProps} value={form.route} onChange={(event) => setForm((current) => ({ ...current, route: event.target.value }))}>
                  <option>Oral</option><option>Injection</option><option>Topical</option><option>Bath / Soak</option><option>Eye Drops</option><option>Other</option>
                </Select>
              )}
            </FormField>

            <FormField label="Dosing interval" error={errors.frequencyHours}>
              {(fieldProps) => (
                <Select {...fieldProps} value={form.frequencyHours} error={Boolean(errors.frequencyHours)} onChange={(event) => setForm((current) => ({ ...current, frequencyHours: event.target.value }))}>
                  <option value={12}>Every 12 hours</option>
                  <option value={24}>Every 24 hours</option>
                  <option value={48}>Every 48 hours</option>
                  <option value={72}>Every 72 hours</option>
                  <option value={168}>Weekly</option>
                </Select>
              )}
            </FormField>

            <div className="medication-duration-grid">
              <FormField label="Course length" error={errors.durationCount}>
                {(fieldProps) => <Input {...fieldProps} type="number" min="1" disabled={form.continueIndefinitely} value={form.durationCount} error={Boolean(errors.durationCount)} onChange={(event) => setForm((current) => ({ ...current, durationCount: event.target.value }))} />}
              </FormField>
              <FormField label="Measured in">
                {(fieldProps) => (
                  <Select {...fieldProps} disabled={form.continueIndefinitely} value={form.durationUnit} onChange={(event) => setForm((current) => ({ ...current, durationUnit: event.target.value }))}>
                    <option value="doses">Doses</option>
                    <option value="days">Days</option>
                  </Select>
                )}
              </FormField>
            </div>

            <FormField label="First scheduled dose date" error={errors.firstDoseDate}>
              {(fieldProps) => <Input {...fieldProps} type="date" value={form.firstDoseDate} error={Boolean(errors.firstDoseDate)} onChange={(event) => setForm((current) => ({ ...current, firstDoseDate: event.target.value }))} />}
            </FormField>

            <FormField label="First scheduled dose time" error={errors.firstDoseTime}>
              {(fieldProps) => <Input {...fieldProps} type="time" value={form.firstDoseTime} error={Boolean(errors.firstDoseTime)} onChange={(event) => setForm((current) => ({ ...current, firstDoseTime: event.target.value }))} />}
            </FormField>
          </div>

          <label className="medication-checkbox">
            <input type="checkbox" checked={form.continueIndefinitely} onChange={(event) => setForm((current) => ({ ...current, continueIndefinitely: event.target.checked }))} />
            <span><strong>Continue indefinitely</strong><small>Use this for an ongoing medication without a fixed number of doses or days.</small></span>
          </label>

          <FormField label="Instructions and notes" optional>
            {(fieldProps) => <Textarea {...fieldProps} rows={4} placeholder="Veterinary instructions, storage notes, or side effects to watch for" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />}
          </FormField>

          <div className="ui-form-actions">
            <Button type="submit" loading={pendingAction === (editingMed ? "edit" : "add")} leftIcon={<Icon name={editingMed ? "check" : "plus"} size={18} />}>
              {editingMed ? "Save schedule" : "Add medication"}
            </Button>
            {editingMed && <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>}
          </div>
        </form>
      </Card>

      <section className="medication-list-section" aria-labelledby="active-medications-heading">
        <div className="section-heading-row">
          <div><p className="section-eyebrow">Treatment schedules</p><h2 id="active-medications-heading">Medication courses</h2></div>
        </div>

        {medicationCount === 0 ? (
          <Card className="medication-empty-state"><Icon name="pill" size={30} /><h3>No medications have been added</h3><p>Add a course above when an animal begins treatment.</p></Card>
        ) : (
          <div className="medication-card-grid">
            {pets.flatMap((pet) =>
              (pet.meds || []).map((med) => {
                const occurrences = getCardOccurrences(med);
                const nextOccurrence = getNextMedicationOccurrence(med);
                const progress = getMedicationProgress(med);
                const due = isMedicationDue(med);
                const expanded = Boolean(expandedSchedules[med.id]);
                const earlierUnrecorded = occurrences.filter((item) => item.scheduledFor < startOfToday() && item.status === "missed");
                const complete = !med.continueIndefinitely && occurrences.length > 0 && !nextOccurrence;

                return (
                  <Card key={`${pet.id}-${med.id}`} className="medication-course-card">
                    <CardHeader
                      title={med.name || "Unnamed medication"}
                      description={`${pet.name} • ${med.route || "Route not set"}`}
                      icon={<Icon name="pill" size={19} />}
                      action={<Badge variant={complete ? "success" : due ? "danger" : "success"} dot>{complete ? "Complete" : due ? "Dose needs attention" : "On schedule"}</Badge>}
                    />

                    <dl className="medication-meta-grid">
                      <div><dt>Dose</dt><dd>{med.dose || "Not set"}</dd></div>
                      <div><dt>Interval</dt><dd>Every {med.frequencyHours || "?"} hours</dd></div>
                      <div><dt>Course</dt><dd>{getMedicationCourseLabel(med)}</dd></div>
                      <div><dt>First scheduled</dt><dd>{formatDateTime(med.firstDose || med.startDate)}</dd></div>
                      <div><dt>Last actually given</dt><dd>{formatDateTime(getMedicationLastGiven(med))}</dd></div>
                      <div><dt>Next unresolved dose</dt><dd>{nextOccurrence ? formatDateTime(nextOccurrence.scheduledFor) : complete ? "Course complete" : "Not scheduled"}</dd></div>
                    </dl>

                    {progress && (
                      <div className="medication-progress-block">
                        <div className="medication-progress-label"><span>Recorded course progress</span><strong>{progress.completed}/{progress.total} doses • {progress.percent}%</strong></div>
                        <div className="progressBar" role="progressbar" aria-valuenow={progress.percent} aria-valuemin="0" aria-valuemax="100" aria-label={`${med.name} course progress`}><div className="progressFill" style={{ width: `${progress.percent}%` }} /></div>
                      </div>
                    )}

                    {med.continueIndefinitely && <p className="medication-ongoing-note"><Icon name="history" size={16} />Ongoing course with a rolling calendar window</p>}
                    {med.notes && <p className="medication-notes">{med.notes}</p>}

                    <div className="medication-actions">
                      <Button size="sm" disabled={!nextOccurrence} leftIcon={<Icon name="check" size={16} />} onClick={() => setRecordTarget({ pet, med, occurrence: nextOccurrence })}>Record dose</Button>
                      <Button size="sm" variant="secondary" leftIcon={<Icon name="calendar" size={16} />} onClick={() => setExpandedSchedules((current) => ({ ...current, [med.id]: !current[med.id] }))}>{expanded ? "Hide schedule" : "View schedule"}</Button>
                      {earlierUnrecorded.length > 0 && <Button size="sm" variant="outline" leftIcon={<Icon name="history" size={16} />} onClick={() => openBackfill(pet, med)}>Backfill earlier doses</Button>}
                      <Button size="sm" variant="secondary" leftIcon={<Icon name="edit" size={16} />} onClick={() => startEditMed(pet.id, med)}>Edit</Button>
                      <Button size="sm" variant="danger" leftIcon={<Icon name="trash" size={16} />} onClick={() => setDeleteTarget({ petId: pet.id, medId: med.id, name: med.name, petName: pet.name })}>Delete</Button>
                    </div>

                    {expanded && (
                      <div className="medication-schedule-list">
                        <div className="medication-schedule-heading"><strong>Scheduled doses</strong><small>Past, present, and future</small></div>
                        {occurrences.length === 0 ? <p>No schedule can be generated until a first dose and interval are set.</p> : occurrences.map((item) => (
                          <div key={item.id} className="medication-schedule-row">
                            <div><strong>Dose {item.doseNumber}</strong><small>{formatDateTime(item.scheduledFor)}</small>{item.givenAt && <small>Actually given: {formatDateTime(item.givenAt)}</small>}</div>
                            <div className="medication-schedule-actions">
                              <Badge variant={getMedicationStatusVariant(item.status)}>{getMedicationStatusLabel(item.status)}</Badge>
                              {!item.record && <Button size="sm" variant="ghost" onClick={() => setRecordTarget({ pet, med, occurrence: item })}>Record</Button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}
      </section>

      <MedicationDoseModal
        open={Boolean(recordTarget)}
        pet={recordTarget?.pet}
        medication={recordTarget?.med}
        occurrence={recordTarget?.occurrence}
        saving={pendingAction === `give-${recordTarget?.med?.id}`}
        onClose={() => !pendingAction && setRecordTarget(null)}
        onSubmit={submitDoseRecord}
      />

      <Modal
        open={Boolean(backfillTarget)}
        onClose={() => !pendingAction && setBackfillTarget(null)}
        title="Backfill earlier doses?"
        description="This records only doses scheduled before today. Today's dose remains open for its actual administration time."
        size="md"
        closeOnBackdrop={!pendingAction}
        closeOnEscape={!pendingAction}
        footer={<><Button variant="secondary" onClick={() => setBackfillTarget(null)} disabled={Boolean(pendingAction)}>Cancel</Button><Button loading={pendingAction === `backfill-${backfillTarget?.med?.id}`} disabled={!backfillConfirmed} onClick={confirmBackfill}>Record earlier doses</Button></>}
      >
        <div className="medication-backfill-copy">
          <p>This will mark <strong>{backfillTarget?.occurrences?.length || 0}</strong> earlier {backfillTarget?.med?.name || "medication"} doses for <strong>{backfillTarget?.pet?.name}</strong> as given at their scheduled times.</p>
          <p>Use this only when those doses were truly administered. It is designed to repair history imported from the older one-timestamp medication system.</p>
          <label className="medication-checkbox"><input type="checkbox" checked={backfillConfirmed} onChange={(event) => setBackfillConfirmed(event.target.checked)} /><span><strong>I confirm these earlier doses were given</strong><small>Today's scheduled dose will not be included.</small></span></label>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !pendingAction && setDeleteTarget(null)}
        title="Delete medication?"
        description="This removes the active course but keeps existing timeline entries."
        size="sm"
        closeOnBackdrop={!pendingAction}
        closeOnEscape={!pendingAction}
        footer={<><Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={Boolean(pendingAction)}>Keep medication</Button><Button variant="danger" loading={pendingAction === `delete-${deleteTarget?.medId}`} leftIcon={<Icon name="trash" size={17} />} onClick={confirmDeleteMedication}>Delete medication</Button></>}
      >
        <p>Remove <strong>{deleteTarget?.name || "this medication"}</strong> from {deleteTarget?.petName || "this animal"}? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
