import { useEffect, useState } from "react";
import "./App.css";
import "./styles/ui.css";

// =====================================================
// 🟢 Utilities and Services
// =====================================================

import { calculateNextFeed } from "./utils/calculateNextFeed";
import { supabase } from "./services/supabaseClient";

// =====================================================
// 🟢 Hooks
// =====================================================

import { useProfile } from "./hooks/useProfile";
import useAsyncAction from "./hooks/useAsyncAction";

// =====================================================
// 🟢 Context Providers
// =====================================================

import { PetProvider, usePetContext } from "./context/PetContext";
import { ModalProvider, useModal } from "./context/ModalContext";
import { ThemeProvider } from "./context/ThemeContext";

// =====================================================
// 🟢 Shared UI
// =====================================================

import { ToastProvider, useToast } from "./components/ui";

// =====================================================
// 🟢 Main Components
// =====================================================

import Sidebar from "./components/Sidebar";
import CreateProfile from "./components/CreateProfile";
import Auth from "./components/Auth";
import PageRenderer from "./components/PageRenderer";
import AppLayout from "./layouts/AppLayout";

// =====================================================
// 🟢 App-Level Components
// =====================================================

import AppLoadingScreen from "./components/app/AppLoadingScreen";
import AppErrorState from "./components/app/AppErrorState";
import AppModalRenderer from "./components/app/AppModalRenderer";

// =====================================================
// 🟢 Default Edit Form
// =====================================================

const EMPTY_EDIT_FORM = {
  name: "",
  category: "",
  animalGroup: "",
  species: "",
  careProfile: "",
  morph: "",
  sex: "",
  dob: "",
  ageType: "unknown",
  estimatedAge: "",
  ageNote: "",
  temperament: "",
  status: "Healthy",
  diet: "",
  foodList: [],
  frequency: 0,
  substrate: "",
  notes: "",
  foodOptions: [],
  substrateOptions: [],
  temperamentOptions: [],
};

// =====================================================
// 🟢 Date Helper
// =====================================================

function normalizeDateToTimestamp(value, fallback = Date.now()) {
  if (!value) return fallback;

  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    throw new Error("Please enter a valid date.");
  }

  return timestamp;
}

// =====================================================
// 🟢 App Providers
// =====================================================

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

// =====================================================
// 🟢 Authentication and Profile Gate
// =====================================================

function AppContent() {
  // =====================================================
  // 🟢 Authentication State
  // =====================================================

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // =====================================================
  // 🟢 Profile and Shared Context
  // =====================================================

  const {
    profile,
    loading: profileLoading,
    error: profileError,
  } = useProfile(session);

  const { showToast } = useToast();
  const { closeModal } = useModal();

  // =====================================================
  // 🟢 Supabase Session Listener
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Unable to load Supabase session:", error);

        showToast({
          title: "Sign-in check failed",
          message: "PetPassport could not verify your session.",
          variant: "error",
        });
      }

      setSession(data?.session ?? null);
      setAuthLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);

      if (!nextSession) {
        closeModal();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [closeModal, showToast]);

  // =====================================================
  // 🟢 Authentication Loading State
  // =====================================================

  if (authLoading) {
    return <AppLoadingScreen message="Opening PetPassport..." />;
  }

  // =====================================================
  // 🟢 Signed-Out State
  // =====================================================

  if (!session) {
    return <Auth />;
  }

  // =====================================================
  // 🟢 Profile Loading State
  // =====================================================

  if (profileLoading) {
    return <AppLoadingScreen message="Loading your profile..." />;
  }

  // =====================================================
  // 🟢 Profile Error State
  // =====================================================

  if (profileError) {
    return (
      <AppErrorState
        title="Your profile could not be loaded"
        message="PetPassport could not reach the profile database. Your data has not been changed."
      />
    );
  }

  // =====================================================
  // 🟢 Profile Setup State
  // =====================================================

  if (!profile) {
    return <CreateProfile session={session} />;
  }

  // =====================================================
  // 🟢 Authenticated App
  // =====================================================

  return (
    <PetProvider session={session}>
      <AuthenticatedApp profile={profile} />
    </PetProvider>
  );
}

// =====================================================
// 🟢 Authenticated Application
// =====================================================

function AuthenticatedApp({ profile }) {
  // =====================================================
  // 🟢 Pet Context
  // =====================================================

  const {
    pets,
    setPets,
    loading: petsLoading,
    error: petsError,
    addPet,
    deletePetFromCloud,
    updatePetInCloud,
    toggleFavorite,
  } = usePetContext();

  // =====================================================
  // 🟢 Modal and Async Action Context
  // =====================================================

  const { activeModal, openModal, closeModal } = useModal();
  const { runAction, isPending, isPendingPrefix } = useAsyncAction();

  // =====================================================
  // 🟢 Local State
  // =====================================================

  const [page, setPage] = useState("Dashboard");
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

  // =====================================================
  // 🟢 Pet Loading State
  // =====================================================

  if (petsLoading) {
    return <AppLoadingScreen message="Loading your pets..." />;
  }

  // =====================================================
  // 🟢 Current User
  // =====================================================

  const currentUser = {
    displayName: profile.display_name,
    username: profile.username,
    primaryRole: profile.role,
  };

  // =====================================================
  // 🟢 Pet Error State
  // =====================================================

  if (petsError) {
    return (
      <AppLayout
        sidebar={
          <Sidebar page={page} setPage={setPage} user={currentUser} />
        }
      >
        <AppErrorState
          title="Your pet records could not be loaded"
          message="PetPassport could not reach the pet database. No records were deleted or overwritten."
        />
      </AppLayout>
    );
  }

  // =====================================================
  // 🟢 Pet Lookup Helper
  // =====================================================

  const findPetById = (petId) =>
    pets.find(
      (item) =>
        String(item.id) === String(petId) ||
        String(item.cloudId) === String(petId)
    );

  // =====================================================
  // 🟢 Navigation Actions
  // =====================================================

  const navigateToPage = (nextPage) => {
    closeModal();
    setPage(nextPage);
  };

    // =====================================================
  // 🟢 Authentication Actions
  // =====================================================

  const handleLogout = async () => {
    const result = await runAction({
      key: "logout",
      action: async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }
      },
      successTitle: "Signed out",
      successMessage: "You have been safely signed out.",
      errorMessage: "PetPassport could not sign you out.",
    });

    if (result.ok) {
      closeModal();
      setPage("Dashboard");
    }
  };

  // =====================================================
  // 🟢 Delete Pet
  // =====================================================

  const deletePet = async (petId) => {
    const pet = findPetById(petId);

    if (!pet) {
      return;
    }

    const result = await runAction({
      key: `delete-pet-${pet.id}`,
      action: () => deletePetFromCloud(pet.id),
      successTitle: "Pet deleted",
      successMessage: `${pet.name}'s profile was deleted.`,
      errorMessage: `${pet.name}'s profile could not be deleted.`,
    });

    if (result.ok) {
      closeModal();
    }
  };

  // =====================================================
  // 🟢 Start Pet Edit
  // =====================================================

  const startEdit = (pet) => {
    setEditForm({
      name: pet.name || "",
      category: pet.category || "",
      animalGroup: pet.animalGroup || "",
      species: pet.species || "",
      careProfile: pet.careProfile || "",
      morph: pet.morph || "",
      sex: pet.sex || "",
      dob: pet.dob || "",
      ageType: pet.ageType || "unknown",
      estimatedAge: pet.estimatedAge || "",
      ageNote: pet.ageNote || "",
      temperament: pet.temperament || "",
      status: pet.status || "Healthy",
      diet: pet.diet || "",
      foodList: Array.isArray(pet.foodList) ? pet.foodList : [],
      frequency: pet.frequency || 0,
      substrate: pet.substrate || "",
      notes: pet.notes || "",
      foodOptions: pet.foodOptions || [],
      substrateOptions: pet.substrateOptions || [],
      temperamentOptions: pet.temperamentOptions || [],
    });

    openModal("editPet", pet.id);
  };

  // =====================================================
  // 🟢 Save Pet Edit
  // =====================================================

  const saveEdit = async (petId) => {
    const currentPet = findPetById(petId);

    if (!currentPet) {
      return;
    }

    const oldStatus = currentPet.status || "Healthy";
    const newStatus = editForm.status || "Healthy";
    const statusChanged = oldStatus !== newStatus;

    const result = await runAction({
      key: `edit-pet-${currentPet.id}`,
      action: () =>
        updatePetInCloud(currentPet.id, {
          ...editForm,
          foodOptions: currentPet.foodOptions || [],
          substrateOptions: currentPet.substrateOptions || [],
          temperamentOptions: currentPet.temperamentOptions || [],
          logs: statusChanged
            ? [
                {
                  id: crypto.randomUUID(),
                  type: "Status Update",
                  note: `${currentPet.name} marked ${newStatus}`,
                  time: Date.now(),
                },
                ...(currentPet.logs || []),
              ]
            : currentPet.logs,
        }),
      successTitle: "Profile updated",
      successMessage: `${currentPet.name}'s details were saved.`,
      errorMessage: `${currentPet.name}'s changes could not be saved.`,
    });

    if (result.ok) {
      closeModal();
    }
  };

  // =====================================================
  // 🟢 General Care Log
  // =====================================================

  const addLog = async (petId, type, note = "") => {
    const pet = findPetById(petId);

    if (!pet) {
      return;
    }

    return runAction({
      key: `log-${pet.id}-${type}`,
      action: () =>
        updatePetInCloud(pet.id, {
          logs: [
            {
              id: crypto.randomUUID(),
              type,
              note,
              time: Date.now(),
            },
            ...(pet.logs || []),
          ],
        }),
      successTitle: "Care log saved",
      successMessage: `${type} was added for ${pet.name}.`,
      errorMessage: `${type} could not be added for ${pet.name}.`,
    });
  };

  // =====================================================
  // 🟢 Feeding Actions
  // =====================================================

  const feedPet = async (petId, meal = null) => {
    const pet = findPetById(petId);

    if (!pet) {
      return;
    }

    let feedingTime;

    try {
      feedingTime = normalizeDateToTimestamp(meal?.date);
    } catch (error) {
      await runAction({
        key: `feed-validation-${pet.id}`,
        action: async () => {
          throw error;
        },
        errorTitle: "Check the feeding date",
        errorMessage: error.message,
      });

      return;
    }

    const foodText =
      Array.isArray(meal?.foods) && meal.foods.length > 0
        ? meal.foods.join(", ")
        : meal?.food || pet.diet || "Meal";

    const amountText = meal?.amount ? ` - ${meal.amount}` : "";
    const acceptedText = meal?.accepted ? ` - ${meal.accepted}` : "";
    const notesText = meal?.notes ? ` - ${meal.notes}` : "";

    return runAction({
      key: `feed-${pet.id}`,
      action: () =>
        updatePetInCloud(pet.id, {
          lastFed: feedingTime,
          nextFeed: calculateNextFeed(feedingTime, pet.frequency),
          logs: [
            {
              id: crypto.randomUUID(),
              type: "Fed",
              note: `Fed ${foodText}${amountText}${acceptedText}${notesText}`,
              time: feedingTime,
            },
            ...(pet.logs || []),
          ],
        }),
      successTitle: "Feeding logged",
      successMessage: `${pet.name}'s feeding was saved.`,
      errorMessage: `${pet.name}'s feeding could not be saved.`,
    });
  };

  // =====================================================
  // 🟢 Weight Actions
  // =====================================================

  const logWeight = async (petId, weightEntry) => {
    const pet = findPetById(petId);

    if (!pet) {
      return;
    }

    const weight = Number(weightEntry.weight);

    if (!Number.isFinite(weight) || weight <= 0) {
      await runAction({
        key: `weight-validation-${pet.id}`,
        action: async () => {
          throw new Error("Weight must be a number greater than zero.");
        },
        errorTitle: "Check the weight",
      });

      return;
    }

    let entryTime;

    try {
      entryTime = normalizeDateToTimestamp(weightEntry.date);
    } catch (error) {
      await runAction({
        key: `weight-date-validation-${pet.id}`,
        action: async () => {
          throw error;
        },
        errorTitle: "Check the measurement date",
      });

      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      ...weightEntry,
      weight,
      time: entryTime,
    };

    return runAction({
      key: `weight-${pet.id}`,
      action: () =>
        updatePetInCloud(pet.id, {
          weightLogs: [entry, ...(pet.weightLogs || [])],
          logs: [
            {
              id: crypto.randomUUID(),
              type: "Weight Logged",
              note: `${pet.name} weighed ${weight} ${weightEntry.unit}`,
              time: entryTime,
            },
            ...(pet.logs || []),
          ],
        }),
      successTitle: "Weight logged",
      successMessage: `${pet.name}'s new weight was saved.`,
      errorMessage: `${pet.name}'s weight could not be saved.`,
    });
  };

  // =====================================================
  // 🟢 Shed Actions
  // =====================================================

  const logShed = async (petId, shedEntry) => {
    const pet = findPetById(petId);

    if (!pet) {
      return;
    }

    let entryTime;

    try {
      entryTime = normalizeDateToTimestamp(shedEntry.date);
    } catch (error) {
      await runAction({
        key: `shed-validation-${pet.id}`,
        action: async () => {
          throw error;
        },
        errorTitle: "Check the shed date",
      });

      return;
    }

    return runAction({
      key: `shed-${pet.id}`,
      action: () =>
        updatePetInCloud(pet.id, {
          logs: [
            {
              id: crypto.randomUUID(),
              type: "Shed",
              note: `${shedEntry.shedType}${
                shedEntry.notes ? ` - ${shedEntry.notes}` : ""
              }`,
              time: entryTime,
            },
            ...(pet.logs || []),
          ],
        }),
      successTitle: "Shed logged",
      successMessage: `${pet.name}'s shed record was saved.`,
      errorMessage: `${pet.name}'s shed could not be saved.`,
    });
  };

    // =====================================================
  // 🟢 Add Medication
  // =====================================================

  const addMedication = async (petId, med) => {
    const pet = findPetById(petId);

    if (!pet) {
      return;
    }

    const frequencyHours = Number(med.frequencyHours) || 72;
    const durationDays = Number(med.durationDays) || 10;

    if (frequencyHours <= 0 || durationDays <= 0) {
      await runAction({
        key: `med-validation-${pet.id}`,
        action: async () => {
          throw new Error(
            "Medication frequency and duration must be greater than zero."
          );
        },
        errorTitle: "Check the medication schedule",
      });

      return;
    }

    const newMedication = {
      id: crypto.randomUUID(),
      name: med.name,
      dose: med.dose,
      route: med.route || "Oral",
      frequencyHours,
      durationDays,
      continueIndefinitely: Boolean(med.continueIndefinitely),
      startDate: med.firstDose || Date.now(),
      firstDose: med.firstDose || null,
      lastGiven: med.lastGiven || med.firstDose || null,
      notes: med.notes || "",
    };

    return runAction({
      key: `add-medication-${pet.id}`,
      action: () =>
        updatePetInCloud(pet.id, {
          meds: [...(pet.meds || []), newMedication],
          logs: [
            {
              id: crypto.randomUUID(),
              type: "Medication Added",
              note: `${newMedication.name}${
                newMedication.dose ? ` • ${newMedication.dose}` : ""
              }`,
              time: Date.now(),
            },
            ...(pet.logs || []),
          ],
        }),
      successTitle: "Medication added",
      successMessage: `${newMedication.name} was added for ${pet.name}.`,
      errorMessage: `${newMedication.name} could not be added for ${pet.name}.`,
    });
  };

  // =====================================================
  // 🟢 Give Medication
  // =====================================================

  const giveMedication = async (petId, medId) => {
    const pet = findPetById(petId);

    if (!pet) {
      return;
    }

    const now = Date.now();

    const medication = (pet.meds || []).find(
      (med) => med.id === medId
    );

    const updatedMeds = (pet.meds || []).map((med) =>
      med.id === medId
        ? {
            ...med,
            lastGiven: now,
          }
        : med
    );

    return runAction({
      key: `give-medication-${pet.id}-${medId}`,
      action: () =>
        updatePetInCloud(pet.id, {
          meds: updatedMeds,
          logs: [
            {
              id: crypto.randomUUID(),
              type: "Medication Administered",
              note: medication
                ? `${medication.name}${
                    medication.dose ? ` • ${medication.dose}` : ""
                  }`
                : "Medication dose logged",
              time: now,
            },
            ...(pet.logs || []),
          ],
        }),
      successTitle: "Dose logged",
      successMessage: `${
        medication?.name || "Medication"
      } was recorded for ${pet.name}.`,
      errorMessage: `The medication dose could not be saved for ${pet.name}.`,
    });
  };

  // =====================================================
  // 🟢 Active Pet
  // =====================================================

  const activePetId = activeModal?.petId
    ? findPetById(activeModal.petId)?.id
    : null;

  // =====================================================
  // 🟢 Saving States
  // =====================================================

  const saving = {
    edit: activePetId
      ? isPending(`edit-pet-${activePetId}`)
      : false,

    delete: activePetId
      ? isPending(`delete-pet-${activePetId}`)
      : false,

    feed: activePetId
      ? isPending(`feed-${activePetId}`)
      : false,

    weight: activePetId
      ? isPending(`weight-${activePetId}`)
      : false,

    shed: activePetId
      ? isPending(`shed-${activePetId}`)
      : false,

    medication: activePetId
      ? isPendingPrefix(`give-medication-${activePetId}-`)
      : false,
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <AppLayout
      sidebar={
        <Sidebar
          page={page}
          setPage={navigateToPage}
          user={currentUser}
        />
      }
    >
      <PageRenderer
        page={page}
        profile={profile}
        currentUser={currentUser}
        pets={pets}
        setPets={setPets}
        setPage={navigateToPage}
        feedPet={(petId) => openModal("feed", petId)}
        addLog={addLog}
        startEdit={startEdit}
        addPet={addPet}
        addMedication={addMedication}
        giveMedication={giveMedication}
        updatePetInCloud={updatePetInCloud}
        handleLogout={handleLogout}
        openProfile={(petId) => openModal("profile", petId)}
        openQuickMeds={(petId) =>
          openModal("quickMeds", petId)
        }
        openShedModal={(petId) =>
          openModal("shed", petId)
        }
        toggleFavorite={toggleFavorite}
      />

      <AppModalRenderer
        activeModal={activeModal}
        closeModal={closeModal}
        openModal={openModal}
        pets={pets}
        setPage={navigateToPage}
        editForm={editForm}
        setEditForm={setEditForm}
        saving={saving}
        actions={{
          addLog,
          deletePet,
          feedPet,
          giveMedication,
          logShed,
          logWeight,
          saveEdit,
          startEdit,
        }}
      />
    </AppLayout>
  );
}