import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { normalizePet } from "../utils/normalizePet";
import { resolveCareProfile } from "../utils/careProfileResolver";
import {
  buildPublicPassportSnapshot,
  buildShareUrl,
  buildTransferUrl,
  createTransportToken,
} from "../utils/passportTransport";
import { createId } from "../utils/id";

// =====================================================
// 🟢 Date Helpers
// =====================================================

function timestampToMs(value) {
  return value ? new Date(value).getTime() : null;
}

function msToTimestamp(value) {
  return value ? new Date(value).toISOString() : null;
}

// =====================================================
// 🟢 Supabase Row → Pet
// =====================================================

function rowToPet(row) {
  const basePet = normalizePet({
    ...row.data,
    id: row.id,
    cloudId: row.id,
    name: row.name,
    species: row.species,
    morph: row.morph,
    sex: row.sex,
    status: row.status,
    favorite: row.favorite,
    lastFed: timestampToMs(row.last_fed),
    nextFeed: timestampToMs(row.next_feed),
  });

  const resolved = resolveCareProfile({
    species: basePet.species,
    category: basePet.category,
    animalGroup: basePet.animalGroup,
    careProfile: basePet.careProfile,
  });

  return normalizePet({
    ...basePet,
    careProfile: resolved.key,
    foodOptions:
      basePet.foodOptions?.length > 0
        ? basePet.foodOptions
        : resolved.profile?.feeding?.foodOptions || [],
    substrateOptions:
      basePet.substrateOptions?.length > 0
        ? basePet.substrateOptions
        : resolved.profile?.substrateOptions || [],
    temperamentOptions:
      basePet.temperamentOptions?.length > 0
        ? basePet.temperamentOptions
        : resolved.profile?.temperamentOptions || [],
  });
}

// =====================================================
// 🟢 usePets
// =====================================================

export function usePets(session) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =====================================================
  // 🟢 Load Pets
  // =====================================================

  useEffect(() => {
    let active = true;

    async function loadPets() {
      if (!session) {
        if (active) {
          setPets([]);
          setError(null);
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: loadError } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (loadError) {
        console.error("Unable to load pets:", loadError);
        setError(loadError);
        setPets([]);
      } else {
        setPets((data || []).map(rowToPet));
      }

      setLoading(false);
    }

    loadPets();

    return () => {
      active = false;
    };
  }, [session]);

  // =====================================================
  // 🟢 Pet Lookup
  // =====================================================

  const findPetById = useCallback(
    (petId) =>
      pets.find(
        (pet) =>
          String(pet.id) === String(petId) ||
          String(pet.cloudId) === String(petId)
      ),
    [pets]
  );

  // =====================================================
  // 🟢 Add Pet
  // =====================================================

  const addPet = useCallback(
    async (newPet) => {
      if (!session) throw new Error("You must be signed in to add a pet.");

      const petToSave = normalizePet({
        ...newPet,
        logs: [],
        weightLogs: [],
        meds: [],
        lastFed: null,
        nextFeed: null,
      });

      const { data, error: insertError } = await supabase
        .from("pets")
        .insert({
          user_id: session.user.id,
          name: petToSave.name,
          species: petToSave.species,
          morph: petToSave.morph || null,
          sex: petToSave.sex || null,
          status: petToSave.status || "Healthy",
          favorite: Boolean(petToSave.favorite),
          last_fed: msToTimestamp(petToSave.lastFed),
          next_feed: msToTimestamp(petToSave.nextFeed),
          data: petToSave,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Unable to add pet:", insertError);
        throw insertError;
      }

      const savedPet = rowToPet(data);
      setPets((previous) => [savedPet, ...previous]);
      return savedPet;
    },
    [session]
  );

  // =====================================================
  // 🟢 Delete Pet
  // =====================================================

  const deletePetFromCloud = useCallback(async (petId) => {
    const { error: deleteError } = await supabase
      .from("pets")
      .delete()
      .eq("id", petId);

    if (deleteError) {
      console.error("Unable to delete pet:", deleteError);
      throw deleteError;
    }

    setPets((previous) =>
      previous.filter((pet) => String(pet.id) !== String(petId))
    );

    return true;
  }, []);

  // =====================================================
  // 🟢 Update Pet
  // =====================================================

  const updatePetInCloud = useCallback(
    async (petId, updates) => {
      const currentPet = pets.find(
        (pet) =>
          String(pet.id) === String(petId) ||
          String(pet.cloudId) === String(petId)
      );

      if (!currentPet) throw new Error("Could not find the selected pet.");

      const databasePetId = currentPet.cloudId || currentPet.id;

      const updatedPet = normalizePet({
        ...currentPet,
        ...updates,
        id: databasePetId,
        cloudId: databasePetId,
      });

      const { data, error: updateError } = await supabase
        .from("pets")
        .update({
          name: updatedPet.name,
          species: updatedPet.species,
          morph: updatedPet.morph || null,
          sex: updatedPet.sex || null,
          status: updatedPet.status || "Healthy",
          favorite: Boolean(updatedPet.favorite),
          last_fed: msToTimestamp(updatedPet.lastFed),
          next_feed: msToTimestamp(updatedPet.nextFeed),
          updated_at: new Date().toISOString(),
          data: updatedPet,
        })
        .eq("id", databasePetId)
        .select()
        .single();

      if (updateError) {
        console.error("Unable to update pet:", updateError);
        throw updateError;
      }

      const savedPet = rowToPet(data);

      setPets((previous) =>
        previous.map((pet) =>
          String(pet.id) === String(currentPet.id) ||
          String(pet.cloudId) === String(databasePetId)
            ? savedPet
            : pet
        )
      );

      return savedPet;
    },
    [pets]
  );

  // =====================================================
  // 🟢 Favorite
  // =====================================================

  const toggleFavorite = useCallback(
    async (petId) => {
      const currentPet = findPetById(petId);

      if (!currentPet) throw new Error("Could not find the selected pet.");

      return updatePetInCloud(currentPet.id, {
        favorite: !currentPet.favorite,
      });
    },
    [findPetById, updatePetInCloud]
  );

  // =====================================================
  // 🟢 Create Share Link
  // =====================================================

  const createPassportShareLink = useCallback(
    async (petId, view = "buyer") => {
      if (!session) throw new Error("You must be signed in to share a Passport.");

      const pet = findPetById(petId);

      if (!pet) throw new Error("Could not find the selected pet.");

      const token = createTransportToken();
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const databasePetId = pet.cloudId || pet.id;
      const snapshot = buildPublicPassportSnapshot(pet, view);

      // Regenerating a share link should always create a fresh token.
      // First disable any older active share links for this pet/owner,
      // then insert the new active link. This keeps revoked links dead.
      const { error: disableOldShareError } = await supabase
        .from("passport_shares")
        .update({
          enabled: false,
          revoked_at: nowIso,
          updated_at: nowIso,
        })
        .eq("pet_id", databasePetId)
        .eq("owner_id", session.user.id)
        .eq("enabled", true);

      if (disableOldShareError) {
        console.error("Unable to disable old share links:", disableOldShareError);
        throw disableOldShareError;
      }

      const { error: shareError } = await supabase
        .from("passport_shares")
        .insert({
          pet_id: databasePetId,
          owner_id: session.user.id,
          token,
          view,
          enabled: true,
          public_snapshot: snapshot,
          revoked_at: null,
          created_at: nowIso,
          updated_at: nowIso,
        });

      if (shareError) {
        console.error("Unable to create share link:", shareError);
        throw shareError;
      }

      const share = {
        enabled: true,
        token,
        view,
        createdAt: now,
        revokedAt: null,
      };

      return updatePetInCloud(pet.id, {
        share,
        logs: [
          {
            id: createId("event"),
            type: "Passport Shared",
            note: `Share link created for ${pet.name}`,
            time: Date.now(),
          },
          ...(pet.logs || []),
        ],
      });
    },
    [findPetById, session, updatePetInCloud]
  );

  // =====================================================
  // 🟢 Revoke Share Link
  // =====================================================

  const revokePassportShareLink = useCallback(
    async (petId) => {
      if (!session) throw new Error("You must be signed in to revoke a link.");

      const pet = findPetById(petId);

      if (!pet) throw new Error("Could not find the selected pet.");

      const token = pet.share?.token;

      if (token) {
        const { error: revokeError } = await supabase
          .from("passport_shares")
          .update({
            enabled: false,
            revoked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("token", token)
          .eq("owner_id", session.user.id);

        if (revokeError) {
          console.error("Unable to revoke share link:", revokeError);
          throw revokeError;
        }
      }

      return updatePetInCloud(pet.id, {
        share: {
          enabled: false,
          token: "",
          view: pet.share?.view || "buyer",
          createdAt: pet.share?.createdAt || null,
          revokedAt: Date.now(),
        },
        logs: [
          {
            id: createId("event"),
            type: "Passport Share Revoked",
            note: `Share link revoked for ${pet.name}`,
            time: Date.now(),
          },
          ...(pet.logs || []),
        ],
      });
    },
    [findPetById, session, updatePetInCloud]
  );

  // =====================================================
  // 🟢 Create Transfer Invite
  // =====================================================

  const createTransferInvite = useCallback(
    async (petId, options = {}) => {
      if (!session) throw new Error("You must be signed in to transfer a Passport.");

      const pet = findPetById(petId);

      if (!pet) throw new Error("Could not find the selected pet.");

      const normalizedOptions = typeof options === "number"
        ? { expiresInDays: options }
        : (options || {});
      const expiresInDays = Math.max(1, Number(normalizedOptions.expiresInDays || 14));
      const requestedDocumentIds = Array.isArray(normalizedOptions.documentIds)
        ? normalizedOptions.documentIds.filter(Boolean)
        : [];
      const requestedSignatureDocumentIds = Array.isArray(normalizedOptions.signatureDocumentIds)
        ? normalizedOptions.signatureDocumentIds.filter(Boolean)
        : [];

      const token = createTransportToken();
      const now = Date.now();
      const expiresAt = now + expiresInDays * 24 * 60 * 60 * 1000;
      const snapshot = buildPublicPassportSnapshot(pet, "buyer");
      const databasePetId = pet.cloudId || pet.id;
      const transferDocuments = [];

      if (requestedDocumentIds.length > 0) {
        const { data: fileRows, error: fileError } = await supabase
          .from("pet_files")
          .select("id, pet_id, bucket, storage_path, file_name, file_type, mime_type, size_bytes, notes, is_public_passport")
          .eq("user_id", session.user.id)
          .eq("is_public_passport", true)
          .in("id", requestedDocumentIds);

        if (fileError) {
          console.error("Unable to load transfer documents:", fileError);
          throw fileError;
        }

        const eligibleFiles = (fileRows || []).filter(
          (file) => !file.pet_id || String(file.pet_id) === String(databasePetId)
        );
        const signedUrlSeconds = Math.ceil(expiresInDays * 24 * 60 * 60);

        const signedDocuments = await Promise.all(
          eligibleFiles.map(async (file) => {
            const { data, error: signError } = await supabase.storage
              .from(file.bucket || "pet-files")
              .createSignedUrl(file.storage_path, signedUrlSeconds);

            if (signError) throw signError;

            return {
              id: file.id,
              fileName: file.file_name,
              fileType: file.file_type || "Document",
              mimeType: file.mime_type || "application/octet-stream",
              sizeBytes: Number(file.size_bytes || 0),
              notes: file.notes || "",
              linkedToPet: Boolean(file.pet_id),
              requiresSignature: requestedSignatureDocumentIds.some(
                (id) => String(id) === String(file.id)
              ),
              url: data.signedUrl,
              expiresAt,
            };
          })
        );

        transferDocuments.push(...signedDocuments);
      }

      const signatureDocumentIds = transferDocuments
        .filter((document) => document.requiresSignature)
        .map((document) => document.id);

      snapshot.documents = transferDocuments;
      snapshot.transferMeta = {
        petId: String(databasePetId),
        token,
        expiresAt,
      };
      snapshot.signaturePolicy = {
        required: signatureDocumentIds.length > 0,
        requiredDocumentIds: signatureDocumentIds,
        requiredDocumentNames: transferDocuments
          .filter((document) => document.requiresSignature)
          .map((document) => document.fileName),
        consentText:
          "I confirm that I opened and reviewed every required agreement, agree to their terms, and consent to use my typed legal name as my electronic signature for this ownership transfer.",
        version: "2026-07-10-v2",
      };

      const { error: cancelOldError } = await supabase
        .from("passport_transfers")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("pet_id", databasePetId)
        .eq("from_user_id", session.user.id)
        .eq("status", "pending");

      if (cancelOldError) {
        console.error("Unable to cancel old transfer invites:", cancelOldError);
        throw cancelOldError;
      }

      const { error: transferError } = await supabase
        .from("passport_transfers")
        .insert({
          pet_id: databasePetId,
          from_user_id: session.user.id,
          token,
          status: "pending",
          public_snapshot: snapshot,
          expires_at: new Date(expiresAt).toISOString(),
        });

      if (transferError) {
        console.error("Unable to create transfer invite:", transferError);
        throw transferError;
      }

      return updatePetInCloud(pet.id, {
        transfer: {
          enabled: true,
          token,
          status: "pending",
          createdAt: now,
          expiresAt,
          cancelledAt: null,
          acceptedAt: null,
          documentIds: transferDocuments.map((document) => document.id),
          documents: transferDocuments.map((document) => ({
            id: document.id,
            fileName: document.fileName,
            fileType: document.fileType,
            sizeBytes: document.sizeBytes,
            requiresSignature: Boolean(document.requiresSignature),
          })),
          signatureRequired: signatureDocumentIds.length > 0,
          signatureRequiredDocumentIds: signatureDocumentIds,
          signatureStatus: signatureDocumentIds.length > 0 ? "awaiting_signature" : "not_required",
        },
        logs: [
          {
            id: createId("event"),
            type: "Transfer Invite Created",
            note: transferDocuments.length > 0
              ? `Transfer invite created for ${pet.name} with ${transferDocuments.length} document${transferDocuments.length === 1 ? "" : "s"}${signatureDocumentIds.length > 0 ? ` and electronic acceptance required for ${signatureDocumentIds.length} agreement${signatureDocumentIds.length === 1 ? "" : "s"}` : ""}`
              : `Transfer invite created for ${pet.name}`,
            time: now,
          },
          ...(pet.logs || []),
        ],
      });
    },
    [findPetById, session, updatePetInCloud]
  );

  // =====================================================
  // 🟢 Cancel Transfer Invite
  // =====================================================

  const cancelTransferInvite = useCallback(
    async (petId) => {
      if (!session) throw new Error("You must be signed in to cancel a transfer.");

      const pet = findPetById(petId);

      if (!pet) throw new Error("Could not find the selected pet.");

      const token = pet.transfer?.token;

      if (token) {
        const { error: cancelError } = await supabase
          .from("passport_transfers")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
          })
          .eq("token", token)
          .eq("from_user_id", session.user.id);

        if (cancelError) {
          console.error("Unable to cancel transfer invite:", cancelError);
          throw cancelError;
        }
      }

      return updatePetInCloud(pet.id, {
        transfer: {
          enabled: false,
          token: "",
          status: "cancelled",
          createdAt: pet.transfer?.createdAt || null,
          expiresAt: pet.transfer?.expiresAt || null,
          cancelledAt: Date.now(),
          acceptedAt: null,
        },
        logs: [
          {
            id: createId("event"),
            type: "Transfer Invite Cancelled",
            note: `Transfer invite cancelled for ${pet.name}`,
            time: Date.now(),
          },
          ...(pet.logs || []),
        ],
      });
    },
    [findPetById, session, updatePetInCloud]
  );

  // =====================================================
  // 🟢 Return State and Actions
  // =====================================================

  return {
    pets,
    setPets,
    loading,
    error,
    addPet,
    deletePetFromCloud,
    updatePetInCloud,
    toggleFavorite,
    createPassportShareLink,
    revokePassportShareLink,
    createTransferInvite,
    cancelTransferInvite,
    buildShareUrl,
    buildTransferUrl,
  };
}
