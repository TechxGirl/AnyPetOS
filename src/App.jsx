import { useEffect, useState } from "react";
import "./App.css";

import { normalizePet } from "./utils/normalizePet";
import { calculateNextFeed } from "./utils/calculateNextFeed";

import { supabase } from "./services/supabaseClient";

import { useProfile } from "./hooks/useProfile";
import {
  PetProvider,
  usePetContext,
} from "./context/PetContext";

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
  // =====================================================
  // 🟢 Auth / Profile State
  // =====================================================

  const [session, setSession] = useState(null);
  const { profile, loading: profileLoading } = useProfile(session);

  // =====================================================
  // 🟢 Supabase Auth Session
  // =====================================================

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

  // =====================================================
  // 🟢 Auth Screens
  // =====================================================

  if (!session) {
    return <Auth />;
  }

  if (profileLoading) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>🐍 Loading PetPassport...</h2>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <CreateProfile session={session} />;
  }

  // =====================================================
  // 🟢 Authenticated App
  // =====================================================

  return (
    <PetProvider session={session}>
      <AuthenticatedApp
        profile={profile}
        setSession={setSession}
      />
    </PetProvider>
  );
}

// =====================================================
// 🟢 AuthenticatedApp
// =====================================================

function AuthenticatedApp({ profile, setSession }) {
  // =====================================================
  // 🟢 Cloud Pet Storage
  // =====================================================

  const {
    pets,
    setPets,
    loading: petsLoading,
    addPet,
    deletePetFromCloud,
    toggleFavorite,
  } = usePetContext();

  // =====================================================
  // 🟢 Navigation State
  // =====================================================

  const [page, setPage] = useState("Dashboard");

  // =====================================================
  // 🟢 Modal State
  // =====================================================

  const [selectedPetId, setSelectedPetId] = useState(null);
  const [editingPetId, setEditingPetId] = useState(null);
  const [feedingPetId, setFeedingPetId] = useState(null);
  const [quickMedsPetId, setQuickMedsPetId] = useState(null);
  const [weightPetId, setWeightPetId] = useState(null);
  const [shedPetId, setShedPetId] = useState(null);
  const [sharePetId, setSharePetId] = useState(null);

  // =====================================================
  // 🟢 Edit Form State
  // =====================================================

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

  // =====================================================
  // 🟢 Loading Screen
  // =====================================================

  if (petsLoading) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>🐾 Loading Passports...</h2>
        </div>
      </div>
    );
  }

  // =====================================================
  // 🟢 Derived Profile Data
  // =====================================================

  const currentUser = {
    displayName: profile.display_name,
    username: profile.username,
    primaryRole: profile.role,
  };

  // =====================================================
  // 🟢 Selected Pet Helpers
  // =====================================================

  const selectedPet = pets.find((pet) => pet.id === selectedPetId);
  const feedingPet = pets.find((pet) => pet.id === feedingPetId);
  const quickMedsPet = pets.find((pet) => pet.id === quickMedsPetId);
  const weightPet = pets.find((pet) => pet.id === weightPetId);
  const shedPet = pets.find((pet) => pet.id === shedPetId);
  const sharePet = pets.find((pet) => pet.id === sharePetId);

  // =====================================================
  // 🟢 Auth Actions
  // =====================================================

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setPage("Dashboard");
  };

  // =====================================================
  // 🟢 Pet Actions
  // =====================================================

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

  const saveEdit = () => {
    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== editingPetId) return pet;

        const oldStatus = pet.status || "Healthy";
        const newStatus = editForm.status || "Healthy";
        const statusChanged = oldStatus !== newStatus;

        return normalizePet({
          ...pet,
          ...editForm,
          logs: statusChanged
            ? [
                {
                  id: crypto.randomUUID(),
                  type: "Status Update",
                  note: `${pet.name} marked ${newStatus}`,
                  time: Date.now(),
                },
                ...(pet.logs || []),
              ]
            : pet.logs,
        });
      })
    );

    setEditingPetId(null);
  };

  // =====================================================
  // 🟢 Log Actions
  // =====================================================

  const addLog = (petId, type, note = "") => {
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              logs: [
                {
                  id: crypto.randomUUID(),
                  type,
                  note,
                  time: Date.now(),
                },
                ...(pet.logs || []),
              ],
            }
          : pet
      )
    );
  };

  const feedPet = (petId, meal = null) => {
    const feedingTime = meal?.date
      ? new Date(meal.date).getTime()
      : Date.now();

    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;

        const foodText =
          Array.isArray(meal?.foods) && meal.foods.length > 0
            ? meal.foods.join(", ")
            : meal?.food || pet.diet || "Meal";

        const amountText = meal?.amount ? ` - ${meal.amount}` : "";
        const acceptedText = meal?.accepted ? ` - ${meal.accepted}` : "";
        const notesText = meal?.notes ? ` - ${meal.notes}` : "";

        return {
          ...pet,
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
        };
      })
    );
  };

  const logWeight = (petId, weightEntry) => {
    const entry = {
      id: crypto.randomUUID(),
      ...weightEntry,
      time: new Date(weightEntry.date).getTime(),
    };

    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
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
            }
          : pet
      )
    );
  };

  const logShed = (petId, shedEntry) => {
    const entryTime = new Date(shedEntry.date).getTime();

    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
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
            }
          : pet
      )
    );
  };

  // =====================================================
  // 🟢 Medication Actions
  // =====================================================

  const addMedication = (petId, med) => {
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              meds: [
                ...(pet.meds || []),
                {
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
                },
              ],
            }
          : pet
      )
    );
  };

  const giveMedication = (petId, medId) => {
    const now = Date.now();

    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId
          ? {
              ...pet,
              meds: (pet.meds || []).map((med) =>
                med.id === medId
                  ? { ...med, lastGiven: now }
                  : med
              ),
              logs: [
                {
                  id: crypto.randomUUID(),
                  type: "Medication Administered",
                  note: "Medication dose logged",
                  time: now,
                },
                ...(pet.logs || []),
              ],
            }
          : pet
      )
    );
  };

  // =====================================================
  // 🟢 Main App
  // =====================================================

  return (
    <AppLayout
      sidebar={
        <Sidebar
          page={page}
          setPage={setPage}
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
        setPage={setPage}
        feedPet={setFeedingPetId}
        addLog={addLog}
        startEdit={startEdit}
        addPet={addPet}
        addMedication={addMedication}
        giveMedication={giveMedication}
        handleLogout={handleLogout}
        openProfile={setSelectedPetId}
        openQuickMeds={setQuickMedsPetId}
        openShedModal={setShedPetId}
        toggleFavorite={toggleFavorite}
      />

      {/* =====================================================
          🟢 Modals
      ===================================================== */}

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