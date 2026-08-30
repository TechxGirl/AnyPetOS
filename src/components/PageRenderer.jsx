import { lazy, Suspense } from "react";
import PageLoadingFallback from "./app/PageLoadingFallback";
import { WORKSPACE_PAGE_SET } from "../data/workspaces";

// =====================================================
// 🟢 PageRenderer.jsx
//
// Decides which main page to display.
//
// Secondary application screens are lazy-loaded so
// users only download feature code when they need it.
// =====================================================

// =====================================================
// 🟢 Lazy Pages
// =====================================================

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Pets = lazy(() => import("../pages/Pets"));
const Favorites = lazy(() => import("../pages/Favorites"));
const AddPet = lazy(() => import("./AddPet"));
const Timeline = lazy(() => import("./Timeline"));
const MedicationPanel = lazy(() => import("./MedicationPanel"));
const Calendar = lazy(() => import("../pages/Calendar"));
const AI = lazy(() => import("../pages/AI"));
const Settings = lazy(() => import("../pages/Settings"));
const Workspaces = lazy(() => import("../pages/Workspaces"));
const DataCenter = lazy(() => import("../pages/DataCenter"));
const WorkspaceModulePage = lazy(() =>
  import("../pages/WorkspaceModulePage")
);
const CareInfrastructure = lazy(() =>
  import("../pages/CareInfrastructure")
);
const BetaFeedback = lazy(() =>
  import("../pages/BetaFeedback")
);
const ExpoMode = lazy(() => import("../pages/ExpoMode"));
const Community = lazy(() => import("../pages/Community"));

// Keep the animal knowledge data out of the main bundle too.
const CareGuide = lazy(async () => {
  const [careGuideModule, animalModule] =
    await Promise.all([
      import("../pages/CareGuide"),
      import("../data/animals"),
    ]);

  const CareGuidePage = careGuideModule.default;
  const reptiles = animalModule.ANIMALS;

  return {
    default: function LazyCareGuide(props) {
      return (
        <CareGuidePage
          {...props}
          reptiles={reptiles}
        />
      );
    },
  };
});

// =====================================================
// 🟢 Loading Copy
// =====================================================

function getLoadingCopy(page) {
  if (page === "Expo Mode") {
    return {
      title: "Opening Expo Command Center",
      message:
        "Loading event operations without slowing the rest of AnyPetOS.",
    };
  }

  if (page === "Community") {
    return {
      title: "Opening Community",
      message:
        "Loading public discovery and expo updates.",
    };
  }

  return {
    title: `Opening ${page || "AnyPetOS"}`,
    message:
      "Loading this workspace without slowing the rest of AnyPetOS.",
  };
}

// =====================================================
// 🟢 Page Content
// =====================================================

function PageContent({
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
  if (page === "Beta Feedback") {
    return (
      <BetaFeedback
        currentUser={currentUser}
        setPage={setPage}
      />
    );
  }

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
    return (
      <AddPet
        addPet={addPet}
        draftKey={`anypetos-add-pet-draft-v1-${
          profile?.id ||
          currentUser?.id ||
          currentUser?.username ||
          "default"
        }`}
      />
    );
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
    return (
      <Calendar
        pets={pets}
        giveMedication={giveMedication}
      />
    );
  }

  // =====================================================
  // 🟢 Tools
  // =====================================================

  if (page === "Care Guides") {
    return <CareGuide pets={pets} />;
  }

  if (page === "AI Assistant") {
    return <AI pets={pets} />;
  }

  if (page === "Workspaces") {
    return (
      <Workspaces
        pets={pets}
        setPage={setPage}
      />
    );
  }

  if (page === "Data Center") {
    return (
      <DataCenter
        pets={pets}
        addPet={addPet}
        setPage={setPage}
      />
    );
  }

  if (page === "Expo Mode") {
    return (
      <ExpoMode
        pets={pets}
        profile={profile}
        createPassportTransfer={
          createPassportTransfer
        }
      />
    );
  }

  if (page === "Community") {
    return (
      <Community
        pets={pets}
        profile={profile}
      />
    );
  }

  if (
    [
      "Care Infrastructure",
      "Enclosures",
      "Equipment",
      "Smart Reminders",
      "Files",
      "Access Center",
    ].includes(page)
  ) {
    const tabMap = {
      "Care Infrastructure": "enclosures",
      Enclosures: "enclosures",
      Equipment: "equipment",
      "Smart Reminders": "reminders",
      Files: "files",
      "Access Center": "access",
    };

    return (
      <CareInfrastructure
        pets={pets}
        initialTab={
          tabMap[page] || "enclosures"
        }
        setPage={setPage}
      />
    );
  }

  if (WORKSPACE_PAGE_SET.has(page)) {
    return (
      <WorkspaceModulePage
        page={page}
        pets={pets}
        setPage={setPage}
      />
    );
  }

  if (page === "Settings") {
    return (
      <Settings
        user={currentUser}
        profile={profile}
        setUser={handleLogout}
      />
    );
  }

  // =====================================================
  // 🟢 Fallback
  // =====================================================

  return (
    <WorkspaceModulePage
      page={page}
      pets={pets}
      setPage={setPage}
    />
  );
}

// =====================================================
// 🟢 Page Renderer
// =====================================================

export default function PageRenderer(props) {
  const loadingCopy = getLoadingCopy(props.page);

  return (
    <Suspense
      fallback={
        <PageLoadingFallback
          title={loadingCopy.title}
          message={loadingCopy.message}
        />
      }
    >
      <PageContent {...props} />
    </Suspense>
  );
}