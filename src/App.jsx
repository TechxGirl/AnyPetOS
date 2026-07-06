import { useEffect, useState } from "react";
import "./App.css";

import { generateAnimalId } from "./utils/generateAnimalId";
import { normalizePet } from "./utils/normalizePet";
import { calculateNextFeed } from "./utils/calculateNextFeed";

import Sidebar from "./components/Sidebar";
import AddPet from "./components/AddPet";
import MedicationPanel from "./components/MedicationPanel";
import PetProfile from "./components/PetProfile";
import Timeline from "./components/Timeline";
import FeedModal from "./components/FeedModal";
import QuickMedsModal from "./components/QuickMedsModal";
import WeightModal from "./components/WeightModal";
import SharePassportModal from "./components/SharePassportModal";
import ShedModal from "./components/ShedModal";
import EditPetModal from "./components/EditPetModal";
import Onboarding from "./components/Onboarding";
import Auth from "./components/Auth";

import Dashboard from "./pages/Dashboard";
import Pets from "./pages/Pets";
import Favorites from "./pages/Favorites";
import AI from "./pages/AI";
import Calendar from "./pages/Calendar";
import CareGuide from "./pages/CareGuide";
import Settings from "./pages/Settings";

import { ANIMALS } from "./data/animals";
import { supabase } from "./services/supabaseClient";
import { useProfile } from "./hooks/useProfile";


export default function App() {
  // 🟢 User / Navigation State
  const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
});

const [session, setSession] = useState(null);
  const [page, setPage] = useState("Dashboard");
  const { profile, loading: profileLoading } = useProfile(session);

  // 🟢 Pet Storage
  const [pets, setPets] = useState(() => {
    const saved = localStorage.getItem("pets");
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.map(normalizePet) : [];
  });

  // 🟢 Modal State
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [editingPetId, setEditingPetId] = useState(null);
  const [feedingPetId, setFeedingPetId] = useState(null);
  const [quickMedsPetId, setQuickMedsPetId] = useState(null);
  const [weightPetId, setWeightPetId] = useState(null);
  const [shedPetId, setShedPetId] = useState(null);
  const [sharePetId, setSharePetId] = useState(null);

  // 🟢 Edit Form State
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

 // 🟢 Save Pets to Browser Storage
useEffect(() => {
  localStorage.setItem("pets", JSON.stringify(pets));
}, [pets]);

// 🟢 Save User to Browser Storage
useEffect(() => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}, [user]);
  // 🟢 Selected Pet Helpers
  const selectedPet = pets.find((pet) => pet.id === selectedPetId);
  const feedingPet = pets.find((pet) => pet.id === feedingPetId);
  const quickMedsPet = pets.find((pet) => pet.id === quickMedsPetId);
  const weightPet = pets.find((pet) => pet.id === weightPetId);
  const shedPet = pets.find((pet) => pet.id === shedPetId);
  const sharePet = pets.find((pet) => pet.id === sharePetId);

  // =========================
  // 🟢 PET ACTIONS
  // =========================

  const addPet = (newPet) => {
    setPets((prev) => [
      ...prev,
      normalizePet({
        ...newPet,
        id: crypto.randomUUID(),
        passportId: generateAnimalId(newPet.species || newPet.category || "Pet"),
        logs: [],
        weightLogs: [],
        meds: [],
        lastFed: null,
        nextFeed: null,
      }),
    ]);

    setPage("Pets");
  };

  const toggleFavorite = (petId) => {
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === petId ? { ...pet, favorite: !pet.favorite } : pet
      )
    );
  };

  const deletePet = (petId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this pet profile? This cannot be undone."
    );

    if (!confirmed) return;

    setPets((prev) => prev.filter((pet) => pet.id !== petId));
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

  // =========================
  // 🟢 LOG ACTIONS
  // =========================

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
    const feedingTime = meal?.date ? new Date(meal.date).getTime() : Date.now();

    setPets((prev) =>
      prev.map((pet) => {
        if (pet.id !== petId) return pet;

        // 🟢 Foods Logged
      const foodText = Array.isArray(meal?.foods) && meal.foods.length > 0
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

  // =========================
  // 🟢 MEDICATION ACTIONS
  // =========================

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
                med.id === medId ? { ...med, lastGiven: now } : med
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

  // =========================
  // 🟢 LOGIN SCREEN
  // =========================

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
  return <Onboarding setUser={setUser} />;
}

  // =========================
  // 🟢 MAIN APP
  // =========================

  return (
    <div className="appShell">
      <Sidebar
  page={page}
  setPage={setPage}
  user={user}
/>

      <main className="mainContent">
        {page === "Dashboard" && (
          <Dashboard
            pets={pets}
            feedPet={(petId) => setFeedingPetId(petId)}
            addLog={addLog}
            startEdit={startEdit}
            openProfile={setSelectedPetId}
            openQuickMeds={setQuickMedsPetId}
            openShedModal={setShedPetId}
            toggleFavorite={toggleFavorite}
            setPage={setPage}
          />
        )}

        {page === "Pets" && (
          <Pets
            pets={pets}
            feedPet={(petId) => setFeedingPetId(petId)}
            addLog={addLog}
            startEdit={startEdit}
            openProfile={setSelectedPetId}
            openQuickMeds={setQuickMedsPetId}
            openShedModal={setShedPetId}
            toggleFavorite={toggleFavorite}
          />
        )}

        {page === "Favorites" && (
          <Favorites
            pets={pets}
            feedPet={(petId) => setFeedingPetId(petId)}
            startEdit={startEdit}
            openProfile={setSelectedPetId}
            openQuickMeds={setQuickMedsPetId}
            openShedModal={setShedPetId}
            toggleFavorite={toggleFavorite}
          />
        )}

        {page === "Add Pet" && <AddPet addPet={addPet} />}

        {page === "Timeline" && <Timeline pets={pets} />}

        {page === "Medications" && (
          <MedicationPanel
            pets={pets}
            addMedication={addMedication}
            giveMedication={giveMedication}
            setPets={setPets}
          />
        )}

        {page === "Calendar" && <Calendar pets={pets} />}

        {page === "Care Guides" && (
          <CareGuide pets={pets} reptiles={ANIMALS} />
        )}

        {page === "AI Assistant" && <AI pets={pets} />}

        {page === "Settings" && <Settings user={user} setUser={setUser} />}
      </main>

      {/* 🟢 Modals */}
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
          feedPet={(petId) => setFeedingPetId(petId)}
          addLog={addLog}
          startEdit={startEdit}
          deletePet={deletePet}
          openQuickMeds={setQuickMedsPetId}
          openWeightModal={setWeightPetId}
          openSharePassport={setSharePetId}
          openShedModal={setShedPetId}
        />
      )}

           {/* 🟢 Edit Pet Modal */}
      {editingPetId && (
        <EditPetModal
          editForm={editForm}
          setEditForm={setEditForm}
          saveEdit={saveEdit}
          cancelEdit={() => setEditingPetId(null)}
        />
      )}
    </div>
  );
}