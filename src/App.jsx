import { lazy, Suspense, useEffect, useState } from "react";
import "./App.css";
import "./styles/ui.css";

// =====================================================
// 🟢 Utilities and Services
// =====================================================

import { calculateNextFeed } from "./utils/calculateNextFeed";
import { supabase } from "./services/supabaseClient";
import { createId } from "./utils/id";
import { getMedicationLastGiven, getNextMedicationDose } from "./utils/medicationSchedule";

// =====================================================
// 🟢 Hooks
// =====================================================

import { useProfile } from "./hooks/useProfile";
import useAsyncAction from "./hooks/useAsyncAction";

// =====================================================
// 🟢 Context Providers
// =====================================================

import { PetProvider } from "./context/PetContext";
import { usePetContext } from "./context/PetContextCore";
import { ModalProvider } from "./context/ModalContext";
import { useModal } from "./context/ModalContextCore";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import { useWorkspace } from "./context/WorkspaceContextCore";
import { FoundingBadgeProvider } from "./context/FoundingBadgeContext";

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
import PasswordRecovery from "./components/PasswordRecovery";
import PageRenderer from "./components/PageRenderer";
import BetaBanner from "./components/BetaBanner";
import AppLayout from "./layouts/AppLayout";

// =====================================================
// 🟢 App-Level Components
// =====================================================

import AppLoadingScreen from "./components/app/AppLoadingScreen";
import AppErrorState from "./components/app/AppErrorState";
import AppModalRenderer from "./components/app/AppModalRenderer";
import { getPassportTransportRoute } from "./utils/passportTransport";
import {
  DEFAULT_APP_PAGE,
  isAccessiblePage,
  persistPage,
  readInitialPage,
  readPageFromLocation,
} from "./utils/navigationState";

const PublicExpoView = lazy(() => import("./pages/PublicExpoView"));

const PublicPassportView = lazy(() =>
  import("./pages/PublicPassportView")
);

const TransferPassportView = lazy(() =>
  import("./pages/TransferPassportView")
);

const AccessInviteView = lazy(() =>
  import("./pages/AccessInviteView")
);

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
  photo: null,
  includePhotoInPassport: true,
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

function isPasswordRecoveryRoute() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return search.get("type") === "recovery" || hash.get("type") === "recovery";
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
  const [passwordRecovery, setPasswordRecovery] = useState(isPasswordRecoveryRoute);

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
  const transportRoute = getPassportTransportRoute();

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
          message: "AnyPetOS could not verify your session.",
          variant: "error",
        });
      }

      setSession(data?.session ?? null);
      setAuthLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
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
  // 🟢 Public Share Route
  // =====================================================

  if (transportRoute?.type === "share") {
  return (
    <Suspense
      fallback={
        <AppLoadingScreen message="Opening shared Passport..." />
      }
    >
      <PublicPassportView token={transportRoute.token} />
    </Suspense>
  );
}

  // =====================================================
  // 🟢 Access Invite Route
  // =====================================================

  if (transportRoute?.type === "access") {
  return (
    <Suspense
      fallback={
        <AppLoadingScreen message="Opening access invite..." />
      }
    >
      <AccessInviteView
        token={transportRoute.token}
        session={session}
      />
    </Suspense>
  );
}

  // =====================================================
  // 🟢 Public Expo Routes
  // =====================================================

  if (["expo", "expoListing", "expoKiosk"].includes(transportRoute?.type)) {
    return (
      <Suspense fallback={<AppLoadingScreen message="Opening the public Expo catalog..." />}>
        <PublicExpoView
          slug={transportRoute.slug}
          listingToken={transportRoute.listingToken || ""}
          kiosk={transportRoute.type === "expoKiosk"}
          session={session}
        />
      </Suspense>
    );
  }

  // =====================================================
  // 🟢 Authentication Loading State
  // =====================================================

  if (authLoading) {
    return <AppLoadingScreen message="Opening AnyPetOS..." />;
  }

  // =====================================================
  // 🟢 Password Recovery State
  // =====================================================

  if (passwordRecovery && session) {
    return <PasswordRecovery onComplete={() => setPasswordRecovery(false)} />;
  }

  // =====================================================
  // 🟢 Transfer Route
  // =====================================================

  if (transportRoute?.type === "transfer") {
  return (
    <Suspense
      fallback={
        <AppLoadingScreen message="Opening Passport transfer..." />
      }
    >
      <TransferPassportView
        token={transportRoute.token}
        session={session}
      />
    </Suspense>
  );
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
        message="AnyPetOS could not reach the profile database. Your data has not been changed."
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
    <WorkspaceProvider profileRole={profile.role}>
      <FoundingBadgeProvider profile={profile}>
        <PetProvider session={session}>
          <AuthenticatedApp profile={profile} session={session} />
        </PetProvider>
      </FoundingBadgeProvider>
    </WorkspaceProvider>
  );
}

// =====================================================
// 🟢 Authenticated Application
// =====================================================

function AuthenticatedApp({ profile, session }) {
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
    createPassportShareLink,
    revokePassportShareLink,
    createTransferInvite,
    cancelTransferInvite,
  } = usePetContext();

  // =====================================================
  // 🟢 Modal and Async Action Context
  // =====================================================

  const { activeModal, openModal, closeModal } = useModal();
  const { runAction, isPending, isPendingPrefix } = useAsyncAction();

  // =====================================================
  // 🟢 Workspace and Persistent Navigation State
  // =====================================================

  const { workspace } = useWorkspace();
  const [page, setPage] = useState(() =>
    readInitialPage({ profile, workspace })
  );
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

  useEffect(() => {
    if (!isAccessiblePage(page, workspace)) {
      setPage(DEFAULT_APP_PAGE);
      return;
    }

    persistPage({
      page,
      profile,
      workspace,
      historyMode: "replace",
    });
  }, [page, profile, workspace]);

  useEffect(() => {
    const restorePageFromLocation = () => {
      const nextPage = readPageFromLocation(workspace);

      if (nextPage !== page) {
        closeModal();
        setPage(nextPage);
      }
    };

    window.addEventListener("popstate", restorePageFromLocation);
    window.addEventListener("hashchange", restorePageFromLocation);

    return () => {
      window.removeEventListener("popstate", restorePageFromLocation);
      window.removeEventListener("hashchange", restorePageFromLocation);
    };
  }, [closeModal, page, workspace]);

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
    id: session?.user?.id || profile.id,
    email: session?.user?.email || "",
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
          message="AnyPetOS could not reach the pet database. No records were deleted or overwritten."
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
    const safePage = isAccessiblePage(nextPage, workspace)
      ? nextPage
      : DEFAULT_APP_PAGE;

    closeModal();

    persistPage({
      page: safePage,
      profile,
      workspace,
      historyMode: safePage === page ? "replace" : "push",
    });

    setPage(safePage);
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
      errorMessage: "AnyPetOS could not sign you out.",
    });

    if (result.ok) {
      closeModal();
      persistPage({
        page: DEFAULT_APP_PAGE,
        profile,
        workspace,
        historyMode: "replace",
      });
      setPage(DEFAULT_APP_PAGE);
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
      photo: pet.photo || null,
      includePhotoInPassport: pet.includePhotoInPassport !== false,
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
                  id: createId("event"),
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
              id: createId("event"),
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

    const mealItems = Array.isArray(meal?.items) ? meal.items : [];
    const mealFoods = Array.isArray(meal?.foods) ? meal.foods : [];

    const foodText =
      mealItems.length > 0
        ? mealItems
            .map((item) =>
              [item.food, item.size, item.quantity ? `x${item.quantity}` : "", item.unit]
                .filter(Boolean)
                .join(" • ")
            )
            .join(", ")
        : mealFoods.length > 0
        ? mealFoods.join(", ")
        : meal?.food || pet.diet || "Meal";

    const resultText = meal?.result || meal?.accepted || "Ate";
    const contextParts = [
      resultText,
      meal?.refusalReason ? `Reason: ${meal.refusalReason}` : "",
      meal?.gutLoaded ? "Gut-loaded" : "",
      meal?.calciumDusted ? "Calcium dusted" : "",
      meal?.vitaminDusted ? "Vitamin dusted" : "",
      meal?.petWeight ? `Weight: ${meal.petWeight}` : "",
      meal?.notes || "",
    ].filter(Boolean);

    const feedingLog = {
      id: createId("feeding"),
      time: feedingTime,
      date: meal?.date || new Date(feedingTime).toISOString().slice(0, 10),
      items: mealItems,
      foods: mealFoods,
      result: resultText,
      refusalReason: meal?.refusalReason || "",
      gutLoaded: Boolean(meal?.gutLoaded),
      calciumDusted: Boolean(meal?.calciumDusted),
      vitaminDusted: Boolean(meal?.vitaminDusted),
      petWeight: meal?.petWeight || "",
      notes: meal?.notes || "",
    };

    const customFoodsToSave = Array.isArray(meal?.customFoodsToSave)
      ? meal.customFoodsToSave.map((food) => String(food).trim()).filter(Boolean)
      : [];

    const updatedFoodOptions = [
      ...(pet.foodOptions || []),
      ...customFoodsToSave,
    ].filter((food, index, list) => food && list.indexOf(food) === index);

    const updatedFoodList = [
      ...(pet.foodList || []),
      ...mealFoods,
      ...customFoodsToSave,
    ].filter((food, index, list) => food && list.indexOf(food) === index);

    const updatedCustomFoodOptions = [
      ...(pet.customFoodOptions || []),
      ...customFoodsToSave,
    ].filter((food, index, list) => food && list.indexOf(food) === index);

    const shouldUpdateLastFed = !["Refused", "Skipped intentionally"].includes(resultText);

    return runAction({
      key: `feed-${pet.id}`,
      action: () =>
        updatePetInCloud(pet.id, {
          lastFed: shouldUpdateLastFed ? feedingTime : pet.lastFed,
          nextFeed: shouldUpdateLastFed
            ? calculateNextFeed(feedingTime, pet.frequency)
            : pet.nextFeed,
          foodOptions: updatedFoodOptions,
          foodList: updatedFoodList,
          diet: updatedFoodList.join(", "),
          customFoodOptions: updatedCustomFoodOptions,
          feedingLogs: [feedingLog, ...(pet.feedingLogs || [])],
          logs: [
            {
              id: createId("event"),
              type: resultText === "Refused" ? "Feeding Refused" : "Fed",
              note: `Fed ${foodText}${contextParts.length ? ` - ${contextParts.join(" - ")}` : ""}`,
              time: feedingTime,
            },
            ...(pet.logs || []),
          ],
        }),
      successTitle: resultText === "Refused" ? "Refusal logged" : "Feeding logged",
      successMessage: `${pet.name}'s feeding record was saved.`,
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
      id: createId("event"),
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
              id: createId("event"),
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
              id: createId("event"),
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
    const durationCount = Number(med.durationCount ?? med.durationDays) || 10;
    const durationUnit = med.durationUnit === "days" ? "days" : "doses";

    if (
      frequencyHours <= 0 ||
      (!med.continueIndefinitely && durationCount <= 0) ||
      !med.firstDose
    ) {
      await runAction({
        key: `med-validation-${pet.id}`,
        action: async () => {
          throw new Error(
            "Medication frequency, first dose, and course length must be valid."
          );
        },
        errorTitle: "Check the medication schedule",
      });

      return;
    }

    const newMedication = {
      id: createId("event"),
      name: med.name,
      dose: med.dose,
      route: med.route || "Oral",
      frequencyHours,
      durationCount,
      durationUnit,
      durationDays: durationUnit === "days" ? durationCount : null,
      continueIndefinitely: Boolean(med.continueIndefinitely),
      startDate: med.firstDose,
      firstDose: med.firstDose,
      lastGiven: med.lastGiven || null,
      doseHistory: Array.isArray(med.doseHistory) ? med.doseHistory : [],
      notes: med.notes || "",
    };

    return runAction({
      key: `add-medication-${pet.id}`,
      action: () =>
        updatePetInCloud(pet.id, {
          meds: [...(pet.meds || []), newMedication],
          logs: [
            {
              id: createId("event"),
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

  const giveMedication = async (petId, medId, options = {}) => {
    const pet = findPetById(petId);

    if (!pet) {
      return;
    }

    const medication = (pet.meds || []).find((med) => med.id === medId);

    if (!medication) {
      return;
    }

    const status = options.status === "skipped" ? "skipped" : "given";
    const scheduledFor =
      Number(options.scheduledFor) || getNextMedicationDose(medication) || null;
    const givenAt = status === "given" ? Number(options.givenAt) || Date.now() : null;

    if (!scheduledFor) {
      return runAction({
        key: `give-medication-validation-${pet.id}-${medId}`,
        action: async () => {
          throw new Error("Choose the scheduled dose you are recording.");
        },
        errorTitle: "Dose not recorded",
      });
    }

    const doseRecord = {
      id: createId("dose"),
      scheduledFor,
      givenAt,
      status,
      notes: options.notes || "",
    };

    const updatedMeds = (pet.meds || []).map((med) => {
      if (med.id !== medId) return med;

      const existingHistory = Array.isArray(med.doseHistory) ? med.doseHistory : [];
      const withoutSameScheduledDose = existingHistory.filter(
        (record) => Math.abs(Number(record?.scheduledFor) - scheduledFor) > 5 * 60 * 1000
      );
      const doseHistory = [doseRecord, ...withoutSameScheduledDose];
      const lastGiven = getMedicationLastGiven({
        ...med,
        lastGiven: null,
        doseHistory,
      });

      return {
        ...med,
        lastGiven,
        doseHistory,
      };
    });

    const logType = status === "skipped" ? "Medication Skipped" : "Medication Administered";
    const logTime = givenAt || Date.now();

    return runAction({
      key: `give-medication-${pet.id}-${medId}`,
      action: () =>
        updatePetInCloud(pet.id, {
          meds: updatedMeds,
          logs: [
            {
              id: createId("event"),
              type: logType,
              note: `${medication.name}${
                medication.dose ? ` • ${medication.dose}` : ""
              }`,
              time: logTime,
            },
            ...(pet.logs || []),
          ],
        }),
      successTitle: status === "skipped" ? "Skipped dose saved" : "Dose logged",
      successMessage: `${
        medication.name || "Medication"
      } was recorded for ${pet.name}.`,
      errorMessage: `The medication dose could not be saved for ${pet.name}.`,
    });
  };

  // =====================================================
  // 🟢 Passport Share Actions
  // =====================================================

  const sharePassport = async (petId, view = "buyer") => {
    const pet = findPetById(petId);

    if (!pet) {
      return null;
    }

    const result = await runAction({
      key: `share-passport-${pet.id}`,
      action: () => createPassportShareLink(pet.id, view),
      successTitle: "Share link created",
      successMessage: `${pet.name}'s read-only Passport link is ready.`,
      errorMessage: `${pet.name}'s share link could not be created.`,
    });

    return result;
  };

  const revokePassportShare = async (petId) => {
    const pet = findPetById(petId);

    if (!pet) {
      return null;
    }

    const result = await runAction({
      key: `revoke-share-${pet.id}`,
      action: () => revokePassportShareLink(pet.id),
      successTitle: "Share link revoked",
      successMessage: `${pet.name}'s old Passport link no longer works.`,
      errorMessage: `${pet.name}'s share link could not be revoked.`,
    });

    return result;
  };

  // =====================================================
  // 🟢 Passport Transfer Actions
  // =====================================================

  const createPassportTransfer = async (petId, options = {}) => {
    const pet = findPetById(petId);

    if (!pet) {
      return null;
    }

    const result = await runAction({
      key: `create-transfer-${pet.id}`,
      action: () => createTransferInvite(pet.id, options),
      successTitle: "Transfer invite created",
      successMessage: `${pet.name}'s ownership invite is ready.`,
      errorMessage: `${pet.name}'s transfer invite could not be created.`,
    });

    return result;
  };

  const cancelPassportTransfer = async (petId) => {
    const pet = findPetById(petId);

    if (!pet) {
      return null;
    }

    const result = await runAction({
      key: `cancel-transfer-${pet.id}`,
      action: () => cancelTransferInvite(pet.id),
      successTitle: "Transfer invite cancelled",
      successMessage: `${pet.name}'s transfer invite was cancelled.`,
      errorMessage: `${pet.name}'s transfer invite could not be cancelled.`,
    });

    return result;
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

    share: activePetId
      ? isPending(`share-passport-${activePetId}`) ||
        isPending(`revoke-share-${activePetId}`)
      : false,

    transfer: activePetId
      ? isPending(`create-transfer-${activePetId}`) ||
        isPending(`cancel-transfer-${activePetId}`)
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
      <BetaBanner setPage={navigateToPage} />

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
        createPassportTransfer={createPassportTransfer}
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
          cancelPassportTransfer,
          createPassportTransfer,
          deletePet,
          feedPet,
          giveMedication,
          logShed,
          logWeight,
          revokePassportShare,
          saveEdit,
          sharePassport,
          startEdit,
        }}
      />
    </AppLayout>
  );
}