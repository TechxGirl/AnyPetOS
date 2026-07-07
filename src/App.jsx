import { useEffect, useState } from "react";
import "./App.css";

import { calculateNextFeed } from "./utils/calculateNextFeed";
import { supabase } from "./services/supabaseClient";
import { useProfile } from "./hooks/useProfile";
import { PetProvider, usePetContext } from "./context/PetContext";

import Sidebar from "./components/Sidebar";
import PetProfile from "./components/PetProfile";
import FeedModal from "./components/FeedModal";
import QuickMedsModal from "./components/QuickMedsModal";
import WeightModal from "./components/WeightModal";
import SharePassportModal from "./components/SharePassportModal";
import ShedModal from "./components/ShedModal";
import EditPetModal from "./components/EditPetModal";
import CreateProfile from "./components/CreateProfile";
import Auth from "./components/Auth";
import PageRenderer from "./components/PageRenderer";
import AppLayout from "./layouts/AppLayout";


// =====================================================
// 🟢 App
// =====================================================

export default function App() {
  const [session, setSession] = useState(null);
  const { profile, loading: profileLoading } = useProfile(session);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Auth />;

  if (profileLoading) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>🐍 Loading PetPassport...</h2>
        </div>
      </div>
    );
  }

  if (!profile) return <CreateProfile session={session} />;

  return (
    <PetProvider session={session}>
      <AuthenticatedApp profile={profile} setSession={setSession} />
    </PetProvider>
  );
}

// =====================================================
// 🟢 Authenticated App
// =====================================================

function AuthenticatedApp({ profile, setSession }) {
  const {
    pets,
    setPets,
    loading: petsLoading,
    addPet,
    deletePetFromCloud,
    updatePetInCloud,
    toggleFavorite,
  } = usePetContext();

  const [page, setPage] = useState("Dashboard");

  const [selectedPetId, setSelectedPetId] = useState(null);
  const [editingPetId, setEditingPetId] = useState(null);
  const [feedingPetId, setFeedingPetId] = useState(null);
  const [quickMedsPetId, setQuickMedsPetId] = useState(null);
  const [weightPetId, setWeightPetId] = useState(null);
  const [shedPetId, setShedPetId] = useState(null);
  const [sharePetId, setSharePetId] = useState(null);

  const [editForm, setEditForm] = useState({
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
  });

  if (petsLoading) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>🐾 Loading Passports...</h2>
        </div>
      </div>
    );
  }

  const currentUser = {
    displayName: profile.display_name,
    username: profile.username,
    primaryRole: profile.role,
  };

  const selectedPet = pets.find((pet) => pet.id === selectedPetId);
  const feedingPet = pets.find((pet) => pet.id === feedingPetId);
  const quickMedsPet = pets.find((pet) => pet.id === quickMedsPetId);
  const weightPet = pets.find((pet) => pet.id === weightPetId);
  const shedPet = pets.find((pet) => pet.id === shedPetId);
  const sharePet = pets.find((pet) => pet.id === sharePetId);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPage("Dashboard");
  };

  const deletePet = async (petId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this pet profile? This cannot be undone."
    );

    if (!confirmed) return;

    await deletePetFromCloud(petId);

    setSelectedPetId(null);
    setEditingPetId(null);
    setFeedingPetId(null);
    setQuickMedsPetId(null);
    setWeightPetId(null);
    setShedPetId(null);
    setSharePetId(null);
  };

  const startEdit = (pet) => {
    setEditingPetId(pet.id);

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
  };

  const saveEdit = async () => {
    const currentPet = pets.find((pet) => pet.id === editingPetId);

    if (!currentPet) return;

    const oldStatus = currentPet.status || "Healthy";
    const newStatus = editForm.status || "Healthy";
    const statusChanged = oldStatus !== newStatus;

    await updatePetInCloud(editingPetId, {
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
    });

    setEditingPetId(null);
  };

  const addLog = async (petId, type, note = "") => {
    const pet = pets.find((item) => item.id === petId);

    if (!pet) return;

    await updatePetInCloud(petId, {
      logs: [
        {
          id: crypto.randomUUID(),
          type,
          note,
          time: Date.now(),
        },
        ...(pet.logs || []),
      ],
    });
  };

  const feedPet = async (petId, meal = null) => {
    const pet = pets.find((item) => item.id === petId);

    if (!pet) return;

    const feedingTime = meal?.date
      ? new Date(meal.date).getTime()
      : Date.now();

    const foodText =
      Array.isArray(meal?.foods) && meal.foods.length > 0
        ? meal.foods.join(", ")
        : meal?.food || pet.diet || "Meal";

    const amountText = meal?.amount ? ` - ${meal.amount}` : "";
    const acceptedText = meal?.accepted ? ` - ${meal.accepted}` : "";
    const notesText = meal?.notes ? ` - ${meal.notes}` : "";

    await updatePetInCloud(petId, {
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
    });
  };

  const logWeight = async (petId, weightEntry) => {
    const pet = pets.find((item) => item.id === petId);

    if (!pet) return;

    const entry = {
      id: crypto.randomUUID(),
      ...weightEntry,
      time: new Date(weightEntry.date).getTime(),
    };

    await updatePetInCloud(petId, {
      weightLogs: [entry, ...(pet.weightLogs || [])],
      logs: [
        {
          id: crypto.randomUUID(),
          type: "Weight Logged",
          note: `${pet.name} weighed ${weightEntry.weight} ${weightEntry.unit}`,
          time: entry.time,
        },
        ...(pet.logs || []),
      ],
    });
  };

  const logShed = async (petId, shedEntry) => {
    const pet = pets.find((item) => item.id === petId);

    if (!pet) return;

    const entryTime = new Date(shedEntry.date).getTime();

    await updatePetInCloud(petId, {
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
    });
  };

// =====================================================
// 🟢 Medication Actions
// =====================================================

const findPetById = (petId) =>
  pets.find(
    (item) =>
      String(item.id) === String(petId) ||
      String(item.cloudId) === String(petId)
  );

const addMedication = async (petId, med) => {
  const pet = findPetById(petId);

  if (!pet) {
    alert("Could not find pet.");
    return;
  }

  const newMedication = {
    id: crypto.randomUUID(),
    name: med.name,
    dose: med.dose,
    route: med.route || "Oral",
    frequencyHours: Number(med.frequencyHours) || 72,
    durationDays: Number(med.durationDays) || 10,
    continueIndefinitely: Boolean(med.continueIndefinitely),
    startDate: med.firstDose || Date.now(),
    firstDose: med.firstDose || null,
    lastGiven: med.lastGiven || med.firstDose || null,
    notes: med.notes || "",
  };

  await updatePetInCloud(pet.id, {
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
  });
};

const giveMedication = async (petId, medId) => {
  const pet = findPetById(petId);

  if (!pet) return;

  const now = Date.now();

  const medication = (pet.meds || []).find((med) => med.id === medId);

  const updatedMeds = (pet.meds || []).map((med) =>
    med.id === medId
      ? {
          ...med,
          lastGiven: now,
        }
      : med
  );

  await updatePetInCloud(pet.id, {
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
  });
};
  return (
    <AppLayout
      sidebar={
        <Sidebar page={page} setPage={setPage} user={currentUser} />
      }
    >
      <PageRenderer
  page={page}
  profile={profile}
  currentUser={currentUser}
  pets={pets}
  setPets={setPets}
  setPage={setPage}
  feedPet={setFeedingPetId}
  addLog={addLog}
  startEdit={startEdit}
  addPet={addPet}
  addMedication={addMedication}
  giveMedication={giveMedication}
  updatePetInCloud={updatePetInCloud}
  handleLogout={handleLogout}
  openProfile={setSelectedPetId}
  openQuickMeds={setQuickMedsPetId}
  openShedModal={setShedPetId}
  toggleFavorite={toggleFavorite}
/>

      {sharePet && (
        <SharePassportModal
          pet={sharePet}
          close={() => setSharePetId(null)}
        />
      )}

      {weightPet && (
        <WeightModal
          pet={weightPet}
          close={() => setWeightPetId(null)}
          logWeight={logWeight}
        />
      )}

      {shedPet && (
        <ShedModal
          pet={shedPet}
          close={() => setShedPetId(null)}
          logShed={logShed}
        />
      )}

      {quickMedsPet && (
        <QuickMedsModal
          pet={quickMedsPet}
          close={() => setQuickMedsPetId(null)}
          giveMedication={giveMedication}
          openMedications={() => {
            setQuickMedsPetId(null);
            setPage("Medications");
          }}
        />
      )}

      {feedingPet && (
        <FeedModal
          pet={feedingPet}
          close={() => setFeedingPetId(null)}
          feedPet={feedPet}
        />
      )}

      {selectedPet && (
        <PetProfile
          pet={selectedPet}
          close={() => setSelectedPetId(null)}
          feedPet={setFeedingPetId}
          addLog={addLog}
          startEdit={startEdit}
          deletePet={deletePet}
          openQuickMeds={setQuickMedsPetId}
          openWeightModal={setWeightPetId}
          openSharePassport={setSharePetId}
          openShedModal={setShedPetId}
        />
      )}

      {editingPetId && (
        <EditPetModal
          editForm={editForm}
          setEditForm={setEditForm}
          saveEdit={saveEdit}
          cancelEdit={() => setEditingPetId(null)}
        />
      )}
    </AppLayout>
  );
}