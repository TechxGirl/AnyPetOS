import PetProfile from "../PetProfile";
import FeedModal from "../FeedModal";
import QuickMedsModal from "../QuickMedsModal";
import WeightModal from "../WeightModal";
import SharePassportModal from "../SharePassportModal";
import ShedModal from "../ShedModal";
import EditPetModal from "../EditPetModal";
import { Button, Modal } from "../ui";

function findPet(pets, petId) {
  if (petId === null || petId === undefined) return null;

  return pets.find(
    (pet) =>
      String(pet.id) === String(petId) ||
      String(pet.cloudId) === String(petId)
  );
}

export default function AppModalRenderer({
  activeModal,
  closeModal,
  openModal,
  pets,
  setPage,
  editForm,
  setEditForm,
  actions,
  saving,
}) {
  if (!activeModal) return null;

  const pet = findPet(pets, activeModal.petId);

  switch (activeModal.type) {
    case "sharePassport":
      return pet ? (
        <SharePassportModal
          pet={pet}
          close={closeModal}
          createShareLink={actions.sharePassport}
          revokeShareLink={actions.revokePassportShare}
          createTransferInvite={actions.createPassportTransfer}
          cancelTransferInvite={actions.cancelPassportTransfer}
          savingShare={saving.share}
          savingTransfer={saving.transfer}
        />
      ) : null;

    case "weight":
      return pet ? (
        <WeightModal
          pet={pet}
          close={closeModal}
          logWeight={actions.logWeight}
          saving={saving.weight}
        />
      ) : null;

    case "shed":
      return pet ? (
        <ShedModal
          pet={pet}
          close={closeModal}
          logShed={actions.logShed}
          saving={saving.shed}
        />
      ) : null;

    case "quickMeds":
      return pet ? (
        <QuickMedsModal
          pet={pet}
          close={closeModal}
          giveMedication={actions.giveMedication}
          saving={saving.medication}
          openMedications={() => {
            closeModal();
            setPage("Medications");
          }}
        />
      ) : null;

    case "feed":
      return pet ? (
        <FeedModal
          pet={pet}
          close={closeModal}
          feedPet={actions.feedPet}
          saving={saving.feed}
        />
      ) : null;

    case "profile":
      return pet ? (
        <PetProfile
          pet={pet}
          close={closeModal}
          feedPet={(petId) => openModal("feed", petId)}
          addLog={actions.addLog}
          startEdit={actions.startEdit}
          deletePet={(petId) => openModal("confirmDelete", petId)}
          openQuickMeds={(petId) => openModal("quickMeds", petId)}
          openWeightModal={(petId) => openModal("weight", petId)}
          openSharePassport={(petId) =>
            openModal("sharePassport", petId)
          }
          openShedModal={(petId) => openModal("shed", petId)}
        />
      ) : null;

    case "editPet":
      return (
        <EditPetModal
          editForm={editForm}
          setEditForm={setEditForm}
          saveEdit={() => actions.saveEdit(activeModal.petId)}
          cancelEdit={closeModal}
          saving={saving.edit}
        />
      );

    case "confirmDelete":
      return (
        <Modal
          open
          onClose={closeModal}
          size="sm"
          title={`Delete ${pet?.name || "this pet"}?`}
          description="This action cannot be undone."
          closeOnBackdrop={!saving.delete}
          closeOnEscape={!saving.delete}
          footer={
            <>
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={saving.delete}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={saving.delete}
                onClick={() => actions.deletePet(activeModal.petId)}
              >
                Delete pet
              </Button>
            </>
          }
        >
          <p className="ui-confirm-copy">
            The profile and its connected records will be removed using your
            current deletion behavior. Consider switching this to archive-only
            before public launch so medical history cannot disappear by
            accident.
          </p>
        </Modal>
      );

    default:
      return null;
  }
}
