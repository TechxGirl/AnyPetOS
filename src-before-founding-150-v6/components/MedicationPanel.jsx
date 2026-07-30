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
import { createId } from "../utils/id";

const EMPTY_FORM = {
  petId: "",
  name: "",
  dose: "",
  route: "Oral",
  frequencyHours: 72,
  durationDays: 10,
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

export default function MedicationPanel({
  pets,
  addMedication,
  giveMedication,
  updatePetInCloud,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingMed, setEditingMed] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const getNextDose = (med) => {
    if (!med.lastGiven) return null;
    const hours = Number(med.frequencyHours);
    if (!Number.isFinite(hours) || hours <= 0) return null;
    return med.lastGiven + hours * 60 * 60 * 1000;
  };

  const isDue = (med) => {
    const nextDose = getNextDose(med);
    return !nextDose || Date.now() >= nextDose;
  };

  const getProgress = (med) => {
    if (med.continueIndefinitely || !med.startDate || !med.durationDays) {
      return null;
    }

    const total = Number(med.durationDays) * 24 * 60 * 60 * 1000;
    if (!Number.isFinite(total) || total <= 0) return null;

    const elapsed = Date.now() - Number(med.startDate);
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const validateForm = () => {
    const nextErrors = {};
    const frequencyHours = Number(form.frequencyHours);
    const durationDays = Number(form.durationDays);

    if (!form.petId) nextErrors.petId = "Choose an animal.";
    if (!form.name.trim()) nextErrors.name = "Enter a medication name.";
    if (!Number.isFinite(frequencyHours) || frequencyHours <= 0) {
      nextErrors.frequencyHours = "Choose a valid dosing interval.";
    }
    if (
      !form.continueIndefinitely &&
      (!Number.isFinite(durationDays) || durationDays <= 0)
    ) {
      nextErrors.durationDays = "Enter a duration greater than zero.";
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
        firstDose: firstDoseTimestamp,
        lastGiven: firstDoseTimestamp,
      });

      if (result?.ok) resetForm();
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

    const firstDoseDate = med.firstDose
      ? new Date(med.firstDose).toISOString().slice(0, 10)
      : "";
    const firstDoseTime = med.firstDose
      ? new Date(med.firstDose).toTimeString().slice(0, 5)
      : "";

    setEditingMed({ petId: pet.id, medId: med.id });
    setForm({
      petId: pet.id,
      name: med.name || "",
      dose: med.dose || "",
      route: med.route || "Oral",
      frequencyHours: med.frequencyHours || 72,
      durationDays: med.durationDays || 10,
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
              durationDays: Number(form.durationDays) || 10,
              continueIndefinitely: Boolean(form.continueIndefinitely),
              firstDose: firstDoseTimestamp,
              startDate: firstDoseTimestamp || med.startDate || Date.now(),
              lastGiven: firstDoseTimestamp || med.lastGiven || null,
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

  const handleGiveMedication = async (petId, medId) => {
    if (pendingAction) return;
    try {
      setPendingAction(`give-${medId}`);
      await giveMedication(petId, medId);
    } finally {
      setPendingAction("");
    }
  };

  return (
    <div className="page-shell medication-page">
      <PageHeader
        eyebrow="Health management"
        title="Medications"
        description="Create treatment schedules, record doses, and keep each animal's course history organized."
        icon={<Icon name="pill" size={23} />}
        actions={
          <Badge variant={medicationCount > 0 ? "info" : "neutral"}>
            {medicationCount} active {medicationCount === 1 ? "course" : "courses"}
          </Badge>
        }
      />

      <Card className="medication-form-card">
        <CardHeader
          title={editingMed ? "Edit medication course" : "Add medication course"}
          description={
            editingMed
              ? "Update the dosing instructions and course details."
              : "Add the schedule exactly as directed by the veterinarian."
          }
          icon={<Icon name={editingMed ? "edit" : "plus"} size={20} />}
        />

        <form
          className="medication-form"
          onSubmit={editingMed ? saveEditMed : handleAdd}
          noValidate
        >
          <div className="medication-form-grid">
            <FormField label="Animal" error={errors.petId}>
              {(fieldProps) => (
                <Select
                  {...fieldProps}
                  value={form.petId}
                  error={Boolean(errors.petId)}
                  disabled={Boolean(editingMed)}
                  onChange={(event) => {
                    setForm((current) => ({
                      ...current,
                      petId: event.target.value,
                    }));
                    setErrors((current) => ({ ...current, petId: undefined }));
                  }}
                >
                  <option value="">Select animal</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
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
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }));
                    setErrors((current) => ({ ...current, name: undefined }));
                  }}
                />
              )}
            </FormField>

            <FormField label="Dose" optional>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  placeholder="For example, 0.18 mL"
                  value={form.dose}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      dose: event.target.value,
                    }))
                  }
                />
              )}
            </FormField>

            <FormField label="Route">
              {(fieldProps) => (
                <Select
                  {...fieldProps}
                  value={form.route}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      route: event.target.value,
                    }))
                  }
                >
                  <option>Oral</option>
                  <option>Injection</option>
                  <option>Topical</option>
                  <option>Bath / Soak</option>
                  <option>Eye Drops</option>
                  <option>Other</option>
                </Select>
              )}
            </FormField>

            <FormField label="Dosing interval" error={errors.frequencyHours}>
              {(fieldProps) => (
                <Select
                  {...fieldProps}
                  value={form.frequencyHours}
                  error={Boolean(errors.frequencyHours)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      frequencyHours: event.target.value,
                    }))
                  }
                >
                  <option value={12}>Every 12 hours</option>
                  <option value={24}>Daily</option>
                  <option value={48}>Every 48 hours</option>
                  <option value={72}>Every 72 hours</option>
                  <option value={168}>Weekly</option>
                </Select>
              )}
            </FormField>

            <FormField label="Course duration" error={errors.durationDays}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="number"
                  min="1"
                  disabled={form.continueIndefinitely}
                  value={form.durationDays}
                  error={Boolean(errors.durationDays)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      durationDays: event.target.value,
                    }))
                  }
                />
              )}
            </FormField>

            <FormField label="First dose date" optional>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="date"
                  value={form.firstDoseDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      firstDoseDate: event.target.value,
                    }))
                  }
                />
              )}
            </FormField>

            <FormField label="First dose time" optional>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="time"
                  value={form.firstDoseTime}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      firstDoseTime: event.target.value,
                    }))
                  }
                />
              )}
            </FormField>
          </div>

          <label className="medication-checkbox">
            <input
              type="checkbox"
              checked={form.continueIndefinitely}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  continueIndefinitely: event.target.checked,
                }))
              }
            />
            <span>
              <strong>Continue indefinitely</strong>
              <small>Use this for ongoing medications without a fixed end date.</small>
            </span>
          </label>

          <FormField label="Instructions and notes" optional>
            {(fieldProps) => (
              <Textarea
                {...fieldProps}
                rows={4}
                placeholder="Veterinary instructions, storage notes, or side effects to watch for"
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
              />
            )}
          </FormField>

          <div className="ui-form-actions">
            <Button
              type="submit"
              loading={pendingAction === (editingMed ? "edit" : "add")}
              leftIcon={<Icon name={editingMed ? "check" : "plus"} size={18} />}
            >
              {editingMed ? "Save changes" : "Add medication"}
            </Button>
            {editingMed && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      <section className="medication-list-section" aria-labelledby="active-medications-heading">
        <div className="section-heading-row">
          <div>
            <p className="section-eyebrow">Treatment schedules</p>
            <h2 id="active-medications-heading">Active medication courses</h2>
          </div>
        </div>

        {medicationCount === 0 ? (
          <Card className="medication-empty-state">
            <Icon name="pill" size={30} />
            <h3>No medications have been added</h3>
            <p>Add a course above when an animal begins treatment.</p>
          </Card>
        ) : (
          <div className="medication-card-grid">
            {pets.flatMap((pet) =>
              (pet.meds || []).map((med) => {
                const nextDose = getNextDose(med);
                const progress = getProgress(med);
                const due = isDue(med);

                return (
                  <Card key={`${pet.id}-${med.id}`} className="medication-course-card">
                    <CardHeader
                      title={med.name || "Unnamed medication"}
                      description={`${pet.name} • ${med.route || "Route not set"}`}
                      icon={<Icon name="pill" size={19} />}
                      action={
                        <Badge variant={due ? "danger" : "success"} dot>
                          {due ? "Dose due" : "On schedule"}
                        </Badge>
                      }
                    />

                    <dl className="medication-meta-grid">
                      <div>
                        <dt>Dose</dt>
                        <dd>{med.dose || "Not set"}</dd>
                      </div>
                      <div>
                        <dt>Interval</dt>
                        <dd>Every {med.frequencyHours || "?"} hours</dd>
                      </div>
                      <div>
                        <dt>Last given</dt>
                        <dd>{formatDateTime(med.lastGiven)}</dd>
                      </div>
                      <div>
                        <dt>Next dose</dt>
                        <dd>{nextDose ? formatDateTime(nextDose) : "Due now"}</dd>
                      </div>
                    </dl>

                    {progress !== null && (
                      <div className="medication-progress-block">
                        <div className="medication-progress-label">
                          <span>Course progress</span>
                          <strong>{progress}%</strong>
                        </div>
                        <div
                          className="progressBar"
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-label={`${med.name} course progress`}
                        >
                          <div className="progressFill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}

                    {med.continueIndefinitely && (
                      <p className="medication-ongoing-note">
                        <Icon name="history" size={16} />
                        Ongoing course with no scheduled end date
                      </p>
                    )}

                    {med.notes && <p className="medication-notes">{med.notes}</p>}

                    <div className="medication-actions">
                      <Button
                        size="sm"
                        loading={pendingAction === `give-${med.id}`}
                        leftIcon={<Icon name="check" size={16} />}
                        onClick={() => handleGiveMedication(pet.id, med.id)}
                      >
                        Mark given
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<Icon name="edit" size={16} />}
                        onClick={() => startEditMed(pet.id, med)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<Icon name="trash" size={16} />}
                        onClick={() =>
                          setDeleteTarget({
                            petId: pet.id,
                            medId: med.id,
                            name: med.name,
                            petName: pet.name,
                          })
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !pendingAction && setDeleteTarget(null)}
        title="Delete medication?"
        description="This removes the active course but keeps the existing timeline entries."
        size="sm"
        closeOnBackdrop={!pendingAction}
        closeOnEscape={!pendingAction}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={Boolean(pendingAction)}
            >
              Keep medication
            </Button>
            <Button
              variant="danger"
              loading={pendingAction === `delete-${deleteTarget?.medId}`}
              leftIcon={<Icon name="trash" size={17} />}
              onClick={confirmDeleteMedication}
            >
              Delete medication
            </Button>
          </>
        }
      >
        <p>
          Remove <strong>{deleteTarget?.name || "this medication"}</strong> from{" "}
          {deleteTarget?.petName || "this animal"}? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
