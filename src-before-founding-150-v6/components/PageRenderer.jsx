import { lazy, Suspense } from "react";

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
import Workspaces from "../pages/Workspaces";
import DataCenter from "../pages/DataCenter";
import WorkspaceModulePage from "../pages/WorkspaceModulePage";
import CareInfrastructure from "../pages/CareInfrastructure";
import PageLoadingFallback from "./app/PageLoadingFallback";

const ExpoMode = lazy(() => import("../pages/ExpoMode"));
const Community = lazy(() => import("../pages/Community"));

import { ANIMALS } from "../data/animals";
import { WORKSPACE_PAGE_SET } from "../data/workspaces";

export default function PageRenderer({
  page,
  profile,
  currentUser,
  pets,
  setPage,
  feedPet,
  addLog,
  startEdit,
  addPet,
  addMedication,
  giveMedication,
  updatePetInCloud,
  handleLogout,
  openProfile,
  openQuickMeds,
  openShedModal,
  toggleFavorite,
  createPassportTransfer,
}) {
  // =====================================================
  // 🟢 Dashboard
  // =====================================================

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

  // =====================================================
  // 🟢 Collection
  // =====================================================

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

  // =====================================================
  // 🟢 Records
  // =====================================================

  if (page === "Timeline") {
    return <Timeline pets={pets} />;
  }

  if (page === "Medications") {
    return (
      <MedicationPanel
        pets={pets}
        addMedication={addMedication}
        giveMedication={giveMedication}
        updatePetInCloud={updatePetInCloud}
      />
    );
  }

  if (page === "Calendar") {
    return <Calendar pets={pets} />;
  }

  // =====================================================
  // 🟢 Tools
  // =====================================================

  if (page === "Care Guides") {
    return <CareGuide pets={pets} reptiles={ANIMALS} />;
  }

  if (page === "AI Assistant") {
    return <AI pets={pets} />;
  }

  if (page === "Workspaces") {
    return <Workspaces pets={pets} setPage={setPage} />;
  }

  if (page === "Data Center") {
    return <DataCenter pets={pets} addPet={addPet} setPage={setPage} />;
  }

  if (page === "Expo Mode") {
    return (
      <Suspense
        fallback={
          <PageLoadingFallback
            title="Opening Expo Command Center"
            message="Loading event operations without slowing the rest of PetPassport."
          />
        }
      >
        <ExpoMode
          pets={pets}
          profile={profile}
          createPassportTransfer={createPassportTransfer}
        />
      </Suspense>
    );
  }

  if (page === "Community") {
    return (
      <Suspense
        fallback={
          <PageLoadingFallback
            title="Opening Community"
            message="Loading public discovery and expo updates."
          />
        }
      >
        <Community pets={pets} profile={profile} />
      </Suspense>
    );
  }

  if (["Care Infrastructure", "Enclosures", "Equipment", "Smart Reminders", "Files", "Access Center"].includes(page)) {
    const tabMap = {
      "Care Infrastructure": "enclosures",
      Enclosures: "enclosures",
      Equipment: "equipment",
      "Smart Reminders": "reminders",
      Files: "files",
      "Access Center": "access",
    };

    return <CareInfrastructure pets={pets} initialTab={tabMap[page] || "enclosures"} setPage={setPage} />;
  }

  if (WORKSPACE_PAGE_SET.has(page)) {
    return <WorkspaceModulePage page={page} pets={pets} setPage={setPage} />;
  }

  if (page === "Settings") {
    return <Settings user={currentUser} setUser={handleLogout} />;
  }

  // =====================================================
  // 🟢 Fallback
  // =====================================================

  return <WorkspaceModulePage page={page} pets={pets} setPage={setPage} />;
}
