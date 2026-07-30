import { useEffect, useMemo, useState } from "react";
import Auth from "../components/Auth";
import TransferSignaturePad from "../components/TransferSignaturePad";
import { supabase } from "../services/supabaseClient";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Icon,
  Input,
  PageHeader,
} from "../components/ui";
import {
  createTransferReceiptBlob,
  downloadTransferReceipt,
  safeTransferFileName,
} from "../utils/transferReceipt";

// =====================================================
// 🟢 TransferPassportView.jsx
// =====================================================

function formatDate(value) {
  if (!value) return "Not logged";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Not logged";
  }
}

function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "Size unavailable";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeRpcObject(value) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function TransferDocuments({
  documents = [],
  interactive = false,
  requiredDocumentIds = [],
  reviewedDocumentIds = [],
  onReview,
}) {
  if (!Array.isArray(documents) || documents.length === 0) return null;

  const requiredIds = requiredDocumentIds.map(String);
  const reviewedIds = reviewedDocumentIds.map(String);

  return (
    <Card className="transferDocumentsCard">
      <CardHeader
        icon={<Icon name="file" size={18} />}
        title="Documents included"
        description={
          requiredIds.length > 0
            ? "Review every required agreement before signing the ownership transfer."
            : "These records were intentionally attached to this ownership transfer."
        }
      />
      <div className="transferDocumentsList">
        {documents.map((document) => {
          const documentId = String(document.id || document.fileName);
          const requiresSignature = requiredIds.includes(documentId);
          const reviewed = reviewedIds.includes(documentId);

          return (
            <article
              key={documentId}
              className={[
                "transferDocumentRow",
                requiresSignature ? "requires-signature" : "",
                reviewed ? "is-reviewed" : "",
              ].filter(Boolean).join(" ")}
            >
              <span className="transferDocumentRow__icon" aria-hidden="true">
                <Icon name={requiresSignature ? "clipboard" : "file"} size={19} />
              </span>
              <div className="transferDocumentRow__copy">
                <div className="transferDocumentRow__titleLine">
                  <strong>{document.fileName || "Document"}</strong>
                  {requiresSignature && (
                    <Badge variant={reviewed ? "success" : "info"}>
                      {reviewed ? "Reviewed" : "Review required"}
                    </Badge>
                  )}
                </div>
                <small>
                  {document.fileType || "Document"} • {formatFileSize(document.sizeBytes)}
                </small>
                {document.notes && <p>{document.notes}</p>}

                {interactive && requiresSignature && (
                  <p className={reviewed ? "transferDocumentReviewStatus is-ready" : "transferDocumentReviewStatus"}>
                    <Icon name={reviewed ? "check" : "alert"} size={14} />
                    <span>
                      {reviewed
                        ? "Opened and reviewed"
                        : "Open this agreement before confirming review below"}
                    </span>
                  </p>
                )}
              </div>
              <a
                className="ui-button ui-button--outline ui-button--sm"
                href={document.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => onReview?.(documentId)}
              >
                <span className="ui-button__content">
                  <Icon name="file" size={15} />
                  <span>{reviewed ? "Reviewed" : "Review"}</span>
                </span>
              </a>
            </article>
          );
        })}
      </div>
    </Card>
  );
}

function TransferReceiptCard({ receipt, copySummary }) {
  if (!receipt) return null;

  return (
    <Card className="transferReceiptCard">
      <CardHeader
        icon={<Icon name="check" size={18} />}
        title="Electronic transfer receipt"
        description="A permanent electronic acceptance record was created for both parties."
      />
      <div className="transferReceiptMeta">
        <div><span>Signed by</span><strong>{receipt.typed_name || receipt.typedName}</strong></div>
        <div><span>Signed at</span><strong>{formatDate(receipt.signed_at || receipt.signedAt)}</strong></div>
        <div><span>Signer email</span><strong>{receipt.signer_email || receipt.signerEmail || "Not recorded"}</strong></div>
        <div><span>Signature method</span><strong>{(receipt.signature_method || receipt.signatureMethod) === "typed_name_and_drawn" ? "Typed name + drawn signature" : "Typed legal name"}</strong></div>
        <div><span>Receipt ID</span><strong>{receipt.id || "Saved"}</strong></div>
      </div>
      {copySummary && <p className="helperText">{copySummary}</p>}
      <Button
        variant="outline"
        leftIcon={<Icon name="file" size={16} />}
        onClick={() => downloadTransferReceipt(receipt)}
      >
        Download receipt
      </Button>
    </Card>
  );
}

export default function TransferPassportView({ token, session }) {
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [reviewedDocumentIds, setReviewedDocumentIds] = useState([]);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [showOptionalSignature, setShowOptionalSignature] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [copySummary, setCopySummary] = useState("");

  useEffect(() => {
    let active = true;

    const loadTransfer = async () => {
      setLoading(true);
      setError("");

      const { data, error: transferError } = await supabase.rpc(
        "get_transfer_passport_by_token",
        { transfer_token: token }
      );

      if (!active) return;

      if (transferError || !data) {
        setSnapshot(null);
        setError("This transfer invite is invalid, expired, or unavailable.");
      } else {
        const result = normalizeRpcObject(data);
        setSnapshot(result?.public_snapshot || result);
        setStatus(result?.status || "pending");
      }

      setLoading(false);
    };

    loadTransfer();

    return () => {
      active = false;
    };
  }, [token]);

  const passport = snapshot?.passport || {};
  const care = snapshot?.care || {};
  const documents = Array.isArray(snapshot?.documents) ? snapshot.documents : [];
  const signaturePolicy = snapshot?.signaturePolicy || {};
  const signatureRequired = Boolean(signaturePolicy.required);
  const requiredDocumentIds = useMemo(
    () => (Array.isArray(signaturePolicy.requiredDocumentIds)
      ? signaturePolicy.requiredDocumentIds.map(String)
      : []),
    [signaturePolicy.requiredDocumentIds]
  );

  const reviewedIds = useMemo(
    () => reviewedDocumentIds.map(String),
    [reviewedDocumentIds]
  );
  const allRequiredDocumentsOpened = requiredDocumentIds.length > 0
    && requiredDocumentIds.every((id) => reviewedIds.includes(String(id)));
  const acknowledgedDocumentIds = reviewConfirmed ? requiredDocumentIds : [];
  const signatureReady = !signatureRequired || (
    allRequiredDocumentsOpened
    && reviewConfirmed
    && typedName.trim().length >= 2
    && consentAccepted
  );

  const markReviewed = (documentId) => {
    setReviewedDocumentIds((current) => Array.from(new Set([...current, String(documentId)])));
  };

  const createRecipientLibraryCopies = async (signedReceipt) => {
    const petId = snapshot?.transferMeta?.petId || signedReceipt?.pet_id || signedReceipt?.petId;
    if (!session?.user?.id || !petId) {
      return "The transfer completed, but AnyPetOS could not determine where to file the recipient copies.";
    }

    let copiedCount = 0;
    const errors = [];
    const folder = `${session.user.id}/${petId}/transfer-${safeTransferFileName(token)}`;

    for (const document of documents) {
      try {
        const safeName = `${safeTransferFileName(document.id || "document")}-${safeTransferFileName(document.fileName || "document")}`;
        const storagePath = `${folder}/${safeName}`;
        const existing = await supabase
          .from("pet_files")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("storage_path", storagePath)
          .maybeSingle();

        if (existing.data) {
          copiedCount += 1;
          continue;
        }

        const response = await fetch(document.url);
        if (!response.ok) throw new Error(`Could not download ${document.fileName}.`);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from("pet-files")
          .upload(storagePath, blob, {
            upsert: false,
            contentType: document.mimeType || blob.type || "application/octet-stream",
          });
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from("pet_files").insert({
          user_id: session.user.id,
          pet_id: petId,
          enclosure_id: null,
          bucket: "pet-files",
          storage_path: storagePath,
          file_name: document.fileName || safeName,
          file_type: document.fileType || "Transferred document",
          mime_type: document.mimeType || blob.type || "application/octet-stream",
          size_bytes: Number(document.sizeBytes || blob.size || 0),
          is_public_passport: false,
          notes: `Permanent recipient copy from ${passport.name || "animal"}'s signed ownership transfer.`,
        });
        if (insertError) throw insertError;
        copiedCount += 1;
      } catch (copyError) {
        console.error("Unable to copy transfer document:", copyError);
        errors.push(document.fileName || "Document");
      }
    }

    try {
      const receiptBlob = createTransferReceiptBlob(signedReceipt);
      const receiptPath = `${folder}/signed-transfer-receipt.html`;
      const existingReceipt = await supabase
        .from("pet_files")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("storage_path", receiptPath)
        .maybeSingle();

      if (!existingReceipt.data) {
        const { error: receiptUploadError } = await supabase.storage
          .from("pet-files")
          .upload(receiptPath, receiptBlob, {
            upsert: false,
            contentType: "text/html;charset=utf-8",
          });
        if (receiptUploadError) throw receiptUploadError;

        const { error: receiptInsertError } = await supabase.from("pet_files").insert({
          user_id: session.user.id,
          pet_id: petId,
          enclosure_id: null,
          bucket: "pet-files",
          storage_path: receiptPath,
          file_name: `${passport.name || "Animal"} electronic transfer receipt.html`,
          file_type: "Electronic transfer receipt",
          mime_type: "text/html",
          size_bytes: receiptBlob.size,
          is_public_passport: false,
          notes: "Electronic acceptance receipt created when ownership was accepted.",
        });
        if (receiptInsertError) throw receiptInsertError;
      }
    } catch (receiptError) {
      console.error("Unable to save recipient receipt copy:", receiptError);
      errors.push("Electronic transfer receipt");
    }

    if (errors.length > 0) {
      return `${copiedCount} attached document${copiedCount === 1 ? " was" : "s were"} copied into your Document Library. ${errors.length} item${errors.length === 1 ? " needs" : "s need"} another attempt.`;
    }

    return `${copiedCount} attached document${copiedCount === 1 ? " was" : "s were"} copied into your Document Library with the electronic transfer receipt.`;
  };

  const acceptTransfer = async () => {
    if (!session || !signatureReady) return;

    setAccepting(true);
    setError("");
    setCopySummary("");

    try {
      let signedReceipt = null;

      if (signatureRequired) {
        const consentText = signaturePolicy.consentText
          || "I confirm that I opened and reviewed every required agreement, agree to their terms, and consent to use my typed legal name as my electronic signature for this ownership transfer.";

        const { data: signatureData, error: signatureError } = await supabase.rpc(
          "record_passport_transfer_signature",
          {
            transfer_token: token,
            signer_name: typedName.trim(),
            signature_data_url: signatureDataUrl || "",
            acknowledged_document_ids: acknowledgedDocumentIds,
            consent_text: consentText,
            user_agent: navigator.userAgent || "",
          }
        );

        if (signatureError) {
          const missingSetup = ["PGRST202", "42883"].includes(signatureError.code)
            || /record_passport_transfer_signature/i.test(signatureError.message || "");
          throw new Error(
            missingSetup
              ? "The electronic acceptance database update has not been installed yet. Run SUPABASE_TRANSFER_ELECTRONIC_ACCEPTANCE_V5_1.sql in Supabase, then try again."
              : signatureError.message || "AnyPetOS could not save the electronic acceptance record."
          );
        }

        const signatureRecord = normalizeRpcObject(signatureData) || {};
        signedReceipt = {
          ...signatureRecord,
          transfer_token: token,
          pet_id: snapshot?.transferMeta?.petId || signatureRecord.pet_id,
          typed_name: typedName.trim(),
          signer_email: session.user.email || signatureRecord.signer_email || "",
          signature_data_url: signatureDataUrl || "",
          acknowledged_document_ids: acknowledgedDocumentIds,
          documents_reviewed: reviewConfirmed,
          electronic_consent_accepted: consentAccepted,
          signature_method: signatureDataUrl ? "typed_name_and_drawn" : "typed_name",
          consent_text: consentText,
          signed_at: signatureRecord.signed_at || new Date().toISOString(),
          transfer_snapshot: snapshot,
        };
      }

      const { error: acceptError } = await supabase.rpc(
        "accept_passport_transfer",
        { transfer_token: token }
      );

      if (acceptError) {
        throw new Error(
          acceptError.message || "AnyPetOS could not accept this transfer invite."
        );
      }

      setAccepted(true);
      setStatus("accepted");

      if (signedReceipt) {
        setReceipt(signedReceipt);
        const summary = await createRecipientLibraryCopies(signedReceipt);
        setCopySummary(summary);
      }
    } catch (acceptError) {
      setError(acceptError.message || "AnyPetOS could not complete this transfer.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>Loading transfer invite...</h2>
          <p>Opening the secure Passport handoff.</p>
        </div>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>Transfer unavailable</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <main className="pageContent publicPassportPage">
        <PageHeader
          eyebrow="AnyPetOS transfer"
          title={`Accept ${passport.name || "this animal"}'s Passport`}
          description={
            signatureRequired
              ? "Preview the Passport and attached agreements now. Sign in to review, sign, and accept ownership."
              : "You can preview the Passport now. Sign in or create an account to accept ownership."
          }
          icon={<Icon name="share" size={22} />}
        />

        <Card>
          <CardHeader icon={<Icon name="paw" size={18} />} title="Passport preview" />
          <div className="transferPassportPhotoStrip">
            {passport.photo?.dataUrl ? (
              <img src={passport.photo.dataUrl} alt={passport.photo.alt || `${passport.name} profile`} />
            ) : (
              <div className="transferPassportPhotoFallback">
                {(passport.name || passport.species || "PP").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <strong>{passport.name || "Unnamed animal"}</strong>
              <small>{passport.species || "Unknown species"}{passport.morph ? ` • ${passport.morph}` : ""}</small>
            </div>
          </div>
          <div className="profileGrid">
            <div className="profileStat"><p>Name</p><strong>{passport.name || "Unnamed animal"}</strong></div>
            <div className="profileStat"><p>Species</p><strong>{passport.species || "Unknown"}</strong></div>
            <div className="profileStat"><p>Morph / breed</p><strong>{passport.morph || "Not set"}</strong></div>
            <div className="profileStat"><p>Status</p><strong>{passport.status || "Healthy"}</strong></div>
          </div>
        </Card>

        <TransferDocuments
          documents={documents}
          requiredDocumentIds={requiredDocumentIds}
          onReview={markReviewed}
        />

        <Card>
          <CardHeader icon={<Icon name="user" size={18} />} title="Sign in to continue" />
          <Auth />
        </Card>
      </main>
    );
  }

  return (
    <main className="pageContent publicPassportPage">
      <PageHeader
        eyebrow="AnyPetOS transfer"
        title={`Accept ${passport.name || "this animal"}'s Passport`}
        description={
          signatureRequired
            ? "Review the required agreements, confirm your consent, and accept ownership with your typed legal name."
            : "Review the animal record, then accept ownership into your AnyPetOS account."
        }
        icon={<Icon name="share" size={22} />}
      />

      {accepted && (
        <>
          <Card>
            <CardHeader icon={<Icon name="check" size={18} />} title="Transfer accepted" />
            <p>
              This Passport now belongs to your account. The care history stayed with the animal.
            </p>
            <Button onClick={() => (window.location.href = "/")}>Open my dashboard</Button>
          </Card>
          <TransferReceiptCard receipt={receipt} copySummary={copySummary} />
        </>
      )}

      {!accepted && (
        <>
          <Card>
            <CardHeader icon={<Icon name="paw" size={18} />} title="Passport preview" />
            <div className="transferPassportPhotoStrip">
              {passport.photo?.dataUrl ? (
                <img src={passport.photo.dataUrl} alt={passport.photo.alt || `${passport.name} profile`} />
              ) : (
                <div className="transferPassportPhotoFallback">
                  {(passport.name || passport.species || "PP").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <strong>{passport.name || "Unnamed animal"}</strong>
                <small>{passport.species || "Unknown species"}{passport.morph ? ` • ${passport.morph}` : ""}</small>
              </div>
            </div>
            <div className="profileGrid">
              <div className="profileStat"><p>Name</p><strong>{passport.name || "Unnamed animal"}</strong></div>
              <div className="profileStat"><p>Species</p><strong>{passport.species || "Unknown"}</strong></div>
              <div className="profileStat"><p>Morph / breed</p><strong>{passport.morph || "Not set"}</strong></div>
              <div className="profileStat"><p>Sex</p><strong>{passport.sex || "Unknown"}</strong></div>
              <div className="profileStat"><p>Status</p><strong>{passport.status || "Healthy"}</strong></div>
              <div className="profileStat">
                <p>Foods</p>
                <strong>{care.foodList?.length ? care.foodList.join(", ") : care.diet || "Not set"}</strong>
              </div>
              <div className="profileStat"><p>Last fed</p><strong>{formatDate(care.lastFed)}</strong></div>
            </div>
          </Card>

          <TransferDocuments
            documents={documents}
            interactive={signatureRequired}
            requiredDocumentIds={requiredDocumentIds}
            reviewedDocumentIds={reviewedDocumentIds}
            onReview={markReviewed}
          />

          {status !== "pending" ? (
            <Card>
              <CardHeader icon={<Icon name="alert" size={18} />} title="Invite not pending" />
              <p>This invite is currently marked as {status}.</p>
            </Card>
          ) : signatureRequired ? (
            <Card className="transferSignatureCard">
              <CardHeader
                icon={<Icon name="edit" size={18} />}
                title="Review and accept the transfer"
                description="Open every required agreement, confirm your review, and use your typed legal name as your electronic signature."
              />

              <div className="transferSignatureProgress">
                <div>
                  <span>Required agreements</span>
                  <strong>{requiredDocumentIds.filter((id) => reviewedIds.includes(String(id))).length} of {requiredDocumentIds.length} opened</strong>
                </div>
                <div>
                  <span>Review confirmation</span>
                  <strong>{reviewConfirmed ? "Confirmed" : "Needed"}</strong>
                </div>
                <div>
                  <span>Electronic consent</span>
                  <strong>{consentAccepted ? "Confirmed" : "Needed"}</strong>
                </div>
              </div>

              <label className={`transferSignatureConsent ${!allRequiredDocumentsOpened ? "is-disabled" : ""}`}>
                <input
                  type="checkbox"
                  checked={reviewConfirmed}
                  disabled={!allRequiredDocumentsOpened}
                  onChange={(event) => setReviewConfirmed(event.target.checked)}
                />
                <span>
                  <strong>I have opened and reviewed every required agreement</strong>
                  <small>
                    {allRequiredDocumentsOpened
                      ? "Confirm that you reviewed the documents attached to this transfer."
                      : "Open every required agreement above before this confirmation becomes available."}
                  </small>
                </span>
              </label>

              <label className="transferSignatureField">
                <span>Full legal name</span>
                <Input
                  value={typedName}
                  onChange={(event) => setTypedName(event.target.value)}
                  placeholder="Type your full legal name"
                  autoComplete="name"
                />
                <small>Your typed name will be recorded as your electronic signature.</small>
              </label>

              <label className="transferSignatureConsent">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(event) => setConsentAccepted(event.target.checked)}
                />
                <span>
                  <strong>I agree to the terms and consent to sign electronically</strong>
                  <small>
                    {signaturePolicy.consentText || "I agree to the required agreements and consent to use my typed legal name as my electronic signature for this ownership transfer."}
                  </small>
                </span>
              </label>

              <div className="transferOptionalSignature">
                <div>
                  <strong>Drawn signature</strong>
                  <small>Optional. Your typed legal name and consent are the required electronic signature.</small>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Icon name="edit" size={15} />}
                  onClick={() => setShowOptionalSignature((current) => !current)}
                >
                  {showOptionalSignature ? "Hide signature pad" : "Add drawn signature (optional)"}
                </Button>
              </div>

              {showOptionalSignature && (
                <TransferSignaturePad value={signatureDataUrl} onChange={setSignatureDataUrl} />
              )}

              {error && <p className="transferErrorMessage">{error}</p>}

              <Button
                loading={accepting}
                disabled={!signatureReady}
                leftIcon={<Icon name="check" size={16} />}
                onClick={acceptTransfer}
              >
                Sign and accept transfer
              </Button>
              {!signatureReady && (
                <p className="helperText">
                  Open every required agreement, confirm your review, type your legal name, and accept the electronic-signature terms.
                </p>
              )}
            </Card>
          ) : (
            <Card>
              <CardHeader icon={<Icon name="shield" size={18} />} title="Accept ownership" />
              <p>
                Accepting this transfer moves the Passport into your account. The care history stays with the animal.
              </p>
              {error && <p className="transferErrorMessage">{error}</p>}
              <Button
                loading={accepting}
                leftIcon={<Icon name="check" size={16} />}
                onClick={acceptTransfer}
              >
                Accept transfer
              </Button>
            </Card>
          )}
        </>
      )}
    </main>
  );
}
