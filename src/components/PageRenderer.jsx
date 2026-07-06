// =====================================================
// 🟢 PageRenderer.jsx
//
// Decides which main page to display.
//
// =====================================================

import Dashboard from "../pages/Dashboard";
import Pets from "../pages/Pets";
import Favorites from "../pages/Favorites";
import AddPet from "./AddPet";
import Timeline from "./Timeline";
import MedicationPanel from "./MedicationPanel";
import Calendar from "../pages/Calendar";
import CareGuide from "../pages/CareGuide";
import AI from "../pages/AI";
import Settings from "../pages/Settings";

import { ANIMALS } from "../data/animals";

export default function PageRenderer({
  page,
  profile,
  currentUser,
  pets,
  setPets,
  setPage,
  feedPet,
  addLog,
  startEdit,
  addPet,
  addMedication,
  giveMedication,
  handleLogout,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
}) {
  if (page === "Dashboard") {
    return (
      <Dashboard
        profile={profile}
        pets={pets}
        feedPet={feedPet}
        addLog={addLog}
        startEdit={startEdit}
        openProfile={openProfile}
        openQuickMeds={openQuickMeds}
        openShedModal={openShedModal}
        toggleFavorite={toggleFavorite}
        setPage={setPage}
      />
    );
  }

  if (page === "Pets") {
    return (
      <Pets
        pets={pets}
        feedPet={feedPet}
        addLog={addLog}
        startEdit={startEdit}
        openProfile={openProfile}
        openQuickMeds={openQuickMeds}
        openShedModal={openShedModal}
        toggleFavorite={toggleFavorite}
      />
    );
  }

  if (page === "Favorites") {
    return (
      <Favorites
        pets={pets}
        feedPet={feedPet}
        startEdit={startEdit}
        openProfile={openProfile}
        openQuickMeds={openQuickMeds}
        openShedModal={openShedModal}
        toggleFavorite={toggleFavorite}
      />
    );
  }

  if (page === "Add Pet") {
    return <AddPet addPet={addPet} />;
  }

  if (page === "Timeline") {
    return <Timeline pets={pets} />;
  }

  if (page === "Medications") {
    return (
      <MedicationPanel
        pets={pets}
        addMedication={addMedication}
        giveMedication={giveMedication}
        setPets={setPets}
      />
    );
  }

  if (page === "Calendar") {
    return <Calendar pets={pets} />;
  }

  if (page === "Care Guides") {
    return <CareGuide pets={pets} reptiles={ANIMALS} />;
  }

  if (page === "AI Assistant") {
    return <AI pets={pets} />;
  }

  if (page === "Settings") {
    return (
      <Settings
        user={currentUser}
        setUser={handleLogout}
      />
    );
  }

  return null;
}