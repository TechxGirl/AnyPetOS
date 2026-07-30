import { useEffect, useMemo, useState } from "react";
import { Button, Icon, IconButton, useToast } from "./ui";
import {
  buildEmailHref,
  buildShareUrl,
  buildSmsHref,
  buildTransferUrl,
  copyTextToClipboard,
  nativeSharePassport,
} from "../utils/passportTransport";

// =====================================================
// 🟢 Share View Presets
// =====================================================

let shareQrModulePromise = null;

async function createShareQr(value, options = {}) {
  shareQrModulePromise ||= import("qrcode");
  const module = await shareQrModulePromise;
  const QRCode = module.default || module;
  return QRCode.toDataURL(value, options);
}

const SHARE_VIEWS = {
  sitter: {
    label: "Pet sitter",
    description: "Daily care, feeding, medications, and emergency notes.",
  },
  vet: {
    label: "Veterinarian",
    description: "Medical history, medications, weight, status, and timeline.",
  },
  buyer: {
    label: "Buyer / adopter",
    description: "Species, morph, sex, DOB, weight, feeding, and temperament.",
  },
  family: {
    label: "Family member",
    description: "General care information and reminders.",
  },
  rescue: {
    label: "Rescue organization",
    description: "Intake notes, recovery, medications, status, and timeline.",
  },
};

// =====================================================
// 🟢 SharePassportModal
// =====================================================

export default function SharePassportModal({
  pet,
  close,
  createShareLink,
  revokeShareLink,
  createTransferInvite,
  cancelTransferInvite,
  savingShare = false,
  savingTransfer = false,
}) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [view, setView] = useState(pet?.share?.view || "buyer");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const { showToast } = useToast();

  if (!pet) return null;

  // =====================================================
  // 🟢 Derived Link State
  // =====================================================

  const activeShareToken = pet.share?.enabled ? pet.share?.token : "";
  const activeTransferToken =
    pet.transfer?.enabled && pet.transfer?.status === "pending"
      ? pet.transfer?.token
      : "";

  const shareUrl = useMemo(
    () => (activeShareToken ? buildShareUrl(activeShareToken) : ""),
    [activeShareToken]
  );

  const transferUrl = useMemo(
    () => (activeTransferToken ? buildTransferUrl(activeTransferToken) : ""),
    [activeTransferToken]
  );

  const latestWeight = pet.weightLogs?.[0];
  const foods = pet.foodList || [];
  const selectedView = SHARE_VIEWS[view];

  const showIdentityDetails = ["buyer", "vet", "rescue"].includes(view);
  const showCareDetails = ["sitter", "family", "buyer"].includes(view);
  const showMedicalDetails = ["vet", "buyer", "rescue"].includes(view);

  // =====================================================
  // 🟢 QR Code
  // =====================================================

  useEffect(() => {
    let active = true;

    const generateQr = async () => {
      if (!shareUrl) {
        setQrCodeUrl("");
        return;
      }

      try {
        const dataUrl = await createShareQr(shareUrl, {
          margin: 2,
          width: 220,
        });

        if (active) {
          setQrCodeUrl(dataUrl);
        }
      } catch (error) {
        console.error("Unable to generate QR code:", error);

        if (active) {
          setQrCodeUrl("");
        }
      }
    };

    generateQr();

    return () => {
      active = false;
    };
  }, [shareUrl]);

  // =====================================================
  // 🟢 Link Actions
  // =====================================================

  const handleCreateShareLink = async () => {
    const result = await createShareLink?.(pet.id, view);

    if (result?.ok) {
      showToast({
        title: "Share link ready",
        message: "You can now copy, text, email, or scan this Passport.",
        variant: "success",
      });
    }
  };

  const handleRevokeShareLink = async () => {
    const confirmed = window.confirm(
      "Revoke this shared Passport link? Anyone with the old link will lose access."
    );

    if (!confirmed) return;

    const result = await revokeShareLink?.(pet.id);

    if (result?.ok) {
      showToast({
        title: "Share link revoked",
        message: "The old public link no longer works.",
        variant: "success",
      });
    }
  };

  const handleCopyShareLink = async () => {
    await copyTextToClipboard(shareUrl);

    showToast({
      title: "Copied",
      message: "Passport link copied to your clipboard.",
      variant: "success",
    });
  };

  const handleNativeShare = async () => {
    const didShare = await nativeSharePassport({
      title: `${pet.name}'s AnyPetOS`,
      text: `Here is ${pet.name}'s AnyPetOS.`,
      url: shareUrl,
    });

    if (!didShare) {
      await handleCopyShareLink();
    }
  };

  // =====================================================
  // 🟢 Transfer Actions
  // =====================================================

  const handleCreateTransferInvite = async () => {
    const confirmed = window.confirm(
      "Create an ownership transfer invite? The recipient can preview the Passport, then accept ownership after signing in."
    );

    if (!confirmed) return;

    const result = await createTransferInvite?.(pet.id);

    if (result?.ok) {
      showToast({
        title: "Transfer invite ready",
        message: "Copy the transfer link and send it to the new owner.",
        variant: "success",
      });
    }
  };

  const handleCancelTransferInvite = async () => {
    const confirmed = window.confirm(
      "Cancel this transfer invite? The recipient will no longer be able to accept ownership."
    );

    if (!confirmed) return;

    const result = await cancelTransferInvite?.(pet.id);

    if (result?.ok) {
      showToast({
        title: "Transfer invite cancelled",
        message: "The ownership invite no longer works.",
        variant: "success",
      });
    }
  };

  const handleCopyTransferLink = async () => {
    await copyTextToClipboard(transferUrl);

    showToast({
      title: "Copied",
      message: "Transfer invite copied to your clipboard.",
      variant: "success",
    });
  };

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <div
      className="modalOverlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !savingShare &&
          !savingTransfer
        ) {
          close();
        }
      }}
    >
      <section
        className="modal petProfileModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-passport-title"
      >
        <div className="profileHeader">
          <div>
            <h2 id="share-passport-title">Transport Passport</h2>
            <p>{pet.name}</p>
          </div>

          <IconButton
            variant="ghost"
            icon={<Icon name="close" size={19} />}
            label="Close share preview"
            onClick={close}
            disabled={savingShare || savingTransfer}
          />
        </div>

        {/* 🟢 Share View */}
        <div className="card innerCard">
          <h3>Read-only share view</h3>

          <label>Who are you sharing with?</label>
          <select
            value={view}
            onChange={(event) => setView(event.target.value)}
            disabled={savingShare}
          >
            {Object.entries(SHARE_VIEWS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <p className="helperText">{selectedView.description}</p>

          <div className="buttonRow">
            <Button
              loading={savingShare}
              leftIcon={<Icon name="share" size={16} />}
              onClick={handleCreateShareLink}
            >
              {shareUrl ? "Regenerate share link" : "Create share link"}
            </Button>

            {shareUrl && (
              <Button
                variant="outline"
                leftIcon={<Icon name="trash" size={16} />}
                onClick={handleRevokeShareLink}
                disabled={savingShare}
              >
                Revoke link
              </Button>
            )}
          </div>
        </div>

        {/* 🟢 Active Share Link */}
        {shareUrl && (
          <div className="card innerCard">
            <h3>Send Passport</h3>

            <label>Read-only Passport link</label>
            <input readOnly value={shareUrl} onFocus={(event) => event.target.select()} />

            <div className="buttonRow">
              <Button
                variant="secondary"
                leftIcon={<Icon name="clipboard" size={16} />}
                onClick={handleCopyShareLink}
              >
                Copy link
              </Button>

              <Button
                variant="secondary"
                leftIcon={<Icon name="share" size={16} />}
                onClick={handleNativeShare}
              >
                Share from device
              </Button>

              <a className="ui-button ui-button--outline ui-button--md" href={buildSmsHref(shareUrl, pet.name)}>
                <span className="ui-button__content">
                  <Icon name="file" size={16} />
                  <span>Text</span>
                </span>
              </a>

              <a className="ui-button ui-button--outline ui-button--md" href={buildEmailHref(shareUrl, pet.name)}>
                <span className="ui-button__content">
                  <Icon name="file" size={16} />
                  <span>Email</span>
                </span>
              </a>
            </div>

            {qrCodeUrl && (
              <div className="passportQrBox">
                <img src={qrCodeUrl} alt={`QR code for ${pet.name}'s AnyPetOS`} />
                <p className="helperText">
                  Scan this QR code to open the read-only Passport.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 🟢 Transfer Ownership */}
        <div className="card innerCard">
          <h3>Transfer ownership</h3>
          <p>
            Use this when an animal is sold, adopted, rescued, or handed off.
            The recipient can preview the Passport without signing up, but must
            sign in to accept ownership.
          </p>

          <div className="buttonRow">
            <Button
              loading={savingTransfer}
              leftIcon={<Icon name="shield" size={16} />}
              onClick={handleCreateTransferInvite}
            >
              {transferUrl ? "Refresh transfer invite" : "Create transfer invite"}
            </Button>

            {transferUrl && (
              <Button
                variant="outline"
                leftIcon={<Icon name="trash" size={16} />}
                onClick={handleCancelTransferInvite}
                disabled={savingTransfer}
              >
                Cancel transfer
              </Button>
            )}
          </div>

          {transferUrl && (
            <>
              <label>Transfer invite link</label>
              <input readOnly value={transferUrl} onFocus={(event) => event.target.select()} />

              <div className="buttonRow">
                <Button
                  variant="secondary"
                  leftIcon={<Icon name="clipboard" size={16} />}
                  onClick={handleCopyTransferLink}
                >
                  Copy transfer link
                </Button>

                <a className="ui-button ui-button--outline ui-button--md" href={buildSmsHref(transferUrl, pet.name)}>
                  <span className="ui-button__content">
                    <Icon name="file" size={16} />
                    <span>Text transfer</span>
                  </span>
                </a>

                <a className="ui-button ui-button--outline ui-button--md" href={buildEmailHref(transferUrl, pet.name)}>
                  <span className="ui-button__content">
                    <Icon name="file" size={16} />
                    <span>Email transfer</span>
                  </span>
                </a>
              </div>
            </>
          )}
        </div>

        {/* 🟢 Passport Preview */}
        <div className="card innerCard passportPreview">
          <h3>Preview</h3>

          <p>
            <strong>Passport ID:</strong> {pet.passportId || "Not assigned"}
          </p>
          <p>
            <strong>Name:</strong> {pet.name}
          </p>
          <p>
            <strong>Status:</strong> {pet.status || "Healthy"}
          </p>
          <p>
            <strong>Species:</strong> {pet.species || "Unknown"}
          </p>

          {showIdentityDetails && (
            <>
              <p>
                <strong>Morph / breed:</strong> {pet.morph || "Not set"}
              </p>
              <p>
                <strong>Sex:</strong> {pet.sex || "Unknown"}
              </p>
              <p>
                <strong>DOB / hatch:</strong>{" "}
                {pet.dob ? new Date(pet.dob).toLocaleDateString() : "Unknown"}
              </p>
              <p>
                <strong>Age estimate:</strong>{" "}
                {pet.ageType === "estimated"
                  ? pet.estimatedAge || "Estimated"
                  : pet.ageType === "exact"
                  ? "Exact DOB provided"
                  : "Unknown"}
              </p>
              <p>
                <strong>Temperament:</strong> {pet.temperament || "Not set"}
              </p>
            </>
          )}

          {showCareDetails && (
            <>
              <p>
                <strong>Foods:</strong>{" "}
                {foods.length > 0 ? foods.join(", ") : pet.diet || "Not set"}
              </p>
              <p>
                <strong>Feeding schedule:</strong>{" "}
                {pet.frequency ? `Every ${pet.frequency} days` : "Not set"}
              </p>
            </>
          )}

          {showMedicalDetails && (
            <>
              <p>
                <strong>Latest weight:</strong>{" "}
                {latestWeight
                  ? `${latestWeight.weight} ${latestWeight.unit}`
                  : "No weight logged"}
              </p>
              <p>
                <strong>Medications:</strong>{" "}
                {pet.meds?.length ? `${pet.meds.length} active or recorded` : "None"}
              </p>
              <p>
                <strong>Timeline entries:</strong> {pet.logs?.length || 0}
              </p>
            </>
          )}

          {view === "sitter" && (
            <>
              <p>
                <strong>Care notes:</strong> {pet.notes || "No notes added."}
              </p>
              <p>
                <strong>Emergency status:</strong> {pet.status || "Healthy"}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
