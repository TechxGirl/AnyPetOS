function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeReceipt(receipt = {}) {
  const snapshot = receipt.transfer_snapshot || receipt.transferSnapshot || {};
  const passport = snapshot.passport || {};
  const documents = Array.isArray(snapshot.documents)
    ? snapshot.documents
    : Array.isArray(receipt.documents)
      ? receipt.documents
      : [];
  const acknowledgedIds = Array.isArray(receipt.acknowledged_document_ids)
    ? receipt.acknowledged_document_ids
    : Array.isArray(receipt.acknowledgedDocumentIds)
      ? receipt.acknowledgedDocumentIds
      : [];
  const signatureDataUrl = receipt.signature_data_url || receipt.signatureDataUrl || "";
  const signatureMethod = receipt.signature_method
    || receipt.signatureMethod
    || (signatureDataUrl ? "typed_name_and_drawn" : "typed_name");

  return {
    id: receipt.id || "",
    petId: receipt.pet_id || receipt.petId || snapshot.transferMeta?.petId || "",
    petName: passport.name || receipt.pet_name || receipt.petName || "Animal",
    passportId: passport.passportId || receipt.passportId || "",
    signerName: receipt.typed_name || receipt.typedName || "Recipient",
    signerEmail: receipt.signer_email || receipt.signerEmail || "",
    signedAt: receipt.signed_at || receipt.signedAt || new Date().toISOString(),
    signatureDataUrl,
    signatureMethod,
    documentsReviewed: Boolean(
      receipt.documents_reviewed
      ?? receipt.documentsReviewed
      ?? acknowledgedIds.length
    ),
    electronicConsentAccepted: Boolean(
      receipt.electronic_consent_accepted
      ?? receipt.electronicConsentAccepted
      ?? receipt.consent_text
      ?? receipt.consentText
    ),
    consentText: receipt.consent_text || receipt.consentText || "",
    documents,
    acknowledgedIds: acknowledgedIds.map(String),
    transferToken: receipt.transfer_token || receipt.transferToken || "",
  };
}

export function safeTransferFileName(name = "document") {
  return String(name || "document")
    .replace(/[^a-z0-9._-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "document";
}

function formatSignatureMethod(method) {
  return method === "typed_name_and_drawn"
    ? "Typed legal name + optional drawn signature"
    : "Typed legal name";
}

export function buildTransferReceiptHtml(receipt) {
  const normalized = normalizeReceipt(receipt);
  const signedDate = new Date(normalized.signedAt).toLocaleString();
  const documentRows = normalized.documents
    .map((document) => {
      const acknowledged = normalized.acknowledgedIds.includes(String(document.id));
      return `
        <tr>
          <td>${escapeHtml(document.fileName || "Document")}</td>
          <td>${escapeHtml(document.fileType || "Document")}</td>
          <td>${acknowledged ? "Opened, reviewed, and accepted" : "Included with transfer"}</td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AnyPetOS Electronic Transfer Receipt</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; margin: 0; color: #152033; background: #f4f7fb; }
    main { max-width: 820px; margin: 40px auto; padding: 32px; background: white; border: 1px solid #dce3ee; border-radius: 18px; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    h2 { margin-top: 28px; font-size: 18px; }
    p { line-height: 1.55; }
    .meta { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; margin-top: 20px; }
    .meta div { padding: 14px; border: 1px solid #e4e9f1; border-radius: 12px; background: #f8fafc; }
    .meta span { display: block; color: #667085; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
    .meta strong { display: block; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e8edf4; vertical-align: top; }
    th { color: #667085; font-size: 12px; text-transform: uppercase; }
    .signature { margin-top: 18px; padding: 16px; border: 1px solid #dce3ee; border-radius: 14px; }
    .typed-signature { margin: 12px 0; padding: 14px; border-left: 4px solid #2f80ed; background: #f8fafc; }
    .signature img { display: block; width: 100%; max-width: 520px; height: 150px; object-fit: contain; object-position: left center; background: #fff; }
    .fine { color: #667085; font-size: 12px; }
    @media (max-width: 640px) { main { margin: 0; border-radius: 0; padding: 22px; } .meta { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <h1>Electronic ownership transfer receipt</h1>
    <p>This receipt records the recipient's document review, consent, and electronic signature for an AnyPetOS ownership transfer.</p>

    <div class="meta">
      <div><span>Animal</span><strong>${escapeHtml(normalized.petName)}</strong></div>
      <div><span>Passport ID</span><strong>${escapeHtml(normalized.passportId || "Not assigned")}</strong></div>
      <div><span>Signed by</span><strong>${escapeHtml(normalized.signerName)}</strong></div>
      <div><span>Signer email</span><strong>${escapeHtml(normalized.signerEmail || "Not recorded")}</strong></div>
      <div><span>Signed at</span><strong>${escapeHtml(signedDate)}</strong></div>
      <div><span>Signature method</span><strong>${escapeHtml(formatSignatureMethod(normalized.signatureMethod))}</strong></div>
      <div><span>Document review</span><strong>${normalized.documentsReviewed ? "Confirmed" : "Not confirmed"}</strong></div>
      <div><span>Electronic consent</span><strong>${normalized.electronicConsentAccepted ? "Accepted" : "Not recorded"}</strong></div>
      <div><span>Receipt ID</span><strong>${escapeHtml(normalized.id || "Pending")}</strong></div>
    </div>

    <h2>Documents included</h2>
    <table>
      <thead><tr><th>Document</th><th>Type</th><th>Review record</th></tr></thead>
      <tbody>${documentRows || '<tr><td colspan="3">No documents were attached.</td></tr>'}</tbody>
    </table>

    <h2>Electronic consent</h2>
    <p>${escapeHtml(normalized.consentText || "The signer agreed to the required documents and consented to use their typed legal name as an electronic signature for this transfer.")}</p>

    <div class="signature">
      <strong>Electronic signature</strong>
      <p class="typed-signature"><span class="fine">Typed legal name</span><br /><strong>${escapeHtml(normalized.signerName)}</strong></p>
      ${normalized.signatureDataUrl ? `<img src="${normalized.signatureDataUrl}" alt="Optional drawn signature" />` : ""}
      <p class="fine">The typed legal name above was adopted as the signer's electronic signature on ${escapeHtml(signedDate)}.${normalized.signatureDataUrl ? " An optional drawn signature was also captured." : ""}</p>
    </div>

    <p class="fine">This receipt is an application record and is not legal advice. Parties should keep any original agreement and follow applicable local laws.</p>
  </main>
</body>
</html>`;
}

export function createTransferReceiptBlob(receipt) {
  return new Blob([buildTransferReceiptHtml(receipt)], { type: "text/html;charset=utf-8" });
}

export function downloadTransferReceipt(receipt) {
  const normalized = normalizeReceipt(receipt);
  const blob = createTransferReceiptBlob(receipt);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeTransferFileName(normalized.petName)}-electronic-transfer-receipt.html`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export { normalizeReceipt };
