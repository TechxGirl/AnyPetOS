import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { createId } from "../utils/id";
import { buildAccessUrl, createTransportToken } from "../utils/passportTransport";
import { buildPublicPassportSnapshot } from "../utils/passportTransport";

function sortNewest(items = []) {
  return [...items].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function normalizeOptionalId(value) {
  if (!value || value === "none") return null;
  return value;
}

function safeFileName(name = "file") {
  return name.replace(/[^a-z0-9._-]/gi, "-").replace(/-+/g, "-");
}

export function useCareInfrastructure(pets = []) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enclosures, setEnclosures] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [files, setFiles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const petsById = useMemo(() => {
    const map = new Map();
    pets.forEach((pet) => {
      map.set(String(pet.cloudId || pet.id), pet);
      map.set(String(pet.id), pet);
    });
    return map;
  }, [pets]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      setUser(null);
      setError(userError || new Error("You must be signed in to load care infrastructure."));
      setLoading(false);
      return;
    }

    setUser(userData.user);

    const [enclosureResult, equipmentResult, reminderResult, fileResult, permissionResult] = await Promise.all([
      supabase.from("enclosures").select("*").order("created_at", { ascending: false }),
      supabase.from("equipment").select("*").order("created_at", { ascending: false }),
      supabase.from("care_reminders").select("*").order("due_at", { ascending: true }),
      supabase.from("pet_files").select("*").order("created_at", { ascending: false }),
      supabase.from("access_permissions").select("*").order("created_at", { ascending: false }),
    ]);

    const firstError = enclosureResult.error || equipmentResult.error || reminderResult.error || fileResult.error || permissionResult.error;

    if (firstError) {
      setError(firstError);
      setEnclosures([]);
      setEquipment([]);
      setReminders([]);
      setFiles([]);
      setPermissions([]);
    } else {
      setEnclosures(sortNewest(enclosureResult.data || []));
      setEquipment(sortNewest(equipmentResult.data || []));
      setReminders(reminderResult.data || []);
      setFiles(sortNewest(fileResult.data || []));
      setPermissions(sortNewest(permissionResult.data || []));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEnclosure = useCallback(async (form) => {
    if (!user) throw new Error("You must be signed in to create an enclosure.");

    const payload = {
      user_id: user.id,
      name: form.name?.trim() || "New enclosure",
      type: form.type || "Terrarium",
      size: form.size || "",
      location: form.location || "",
      pet_id: normalizeOptionalId(form.pet_id),
      warm_temp: form.warm_temp || "",
      cool_temp: form.cool_temp || "",
      humidity: form.humidity || "",
      substrate: form.substrate || "",
      cleaning_interval_days: Number(form.cleaning_interval_days) || null,
      last_cleaned_at: form.last_cleaned_at || null,
      notes: form.notes || "",
    };

    const { data, error: insertError } = await supabase.from("enclosures").insert(payload).select().single();
    if (insertError) throw insertError;
    setEnclosures((previous) => [data, ...previous]);
    return data;
  }, [user]);

  const updateEnclosure = useCallback(async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from("enclosures")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;
    setEnclosures((previous) => previous.map((item) => (item.id === id ? data : item)));
    return data;
  }, []);

  const deleteEnclosure = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from("enclosures").delete().eq("id", id);
    if (deleteError) throw deleteError;
    setEnclosures((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const createEquipment = useCallback(async (form) => {
    if (!user) throw new Error("You must be signed in to create equipment.");

    const payload = {
      user_id: user.id,
      enclosure_id: normalizeOptionalId(form.enclosure_id),
      pet_id: normalizeOptionalId(form.pet_id),
      name: form.name?.trim() || "Equipment item",
      type: form.type || "Other",
      brand: form.brand || "",
      model: form.model || "",
      purchase_date: form.purchase_date || null,
      installed_at: form.installed_at || null,
      replace_interval_days: Number(form.replace_interval_days) || null,
      next_due_at: form.next_due_at || null,
      status: form.status || "Active",
      notes: form.notes || "",
    };

    const { data, error: insertError } = await supabase.from("equipment").insert(payload).select().single();
    if (insertError) throw insertError;
    setEquipment((previous) => [data, ...previous]);
    return data;
  }, [user]);

  const updateEquipment = useCallback(async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from("equipment")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;
    setEquipment((previous) => previous.map((item) => (item.id === id ? data : item)));
    return data;
  }, []);

  const deleteEquipment = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from("equipment").delete().eq("id", id);
    if (deleteError) throw deleteError;
    setEquipment((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const createReminder = useCallback(async (form) => {
    if (!user) throw new Error("You must be signed in to create reminders.");

    const payload = {
      user_id: user.id,
      pet_id: normalizeOptionalId(form.pet_id),
      enclosure_id: normalizeOptionalId(form.enclosure_id),
      equipment_id: normalizeOptionalId(form.equipment_id),
      title: form.title?.trim() || "Care reminder",
      type: form.type || "Custom",
      repeat_interval_days: Number(form.repeat_interval_days) || null,
      due_at: form.due_at || new Date().toISOString(),
      status: form.status || "upcoming",
      notes: form.notes || "",
    };

    const { data, error: insertError } = await supabase.from("care_reminders").insert(payload).select().single();
    if (insertError) throw insertError;
    setReminders((previous) => [...previous, data].sort((a, b) => new Date(a.due_at || 0) - new Date(b.due_at || 0)));
    return data;
  }, [user]);

  const updateReminder = useCallback(async (id, updates) => {
    const { data, error: updateError } = await supabase
      .from("care_reminders")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;
    setReminders((previous) => previous.map((item) => (item.id === id ? data : item)));
    return data;
  }, []);

  const completeReminder = useCallback(async (reminder) => {
    const nowIso = new Date().toISOString();
    const intervalDays = Number(reminder.repeat_interval_days) || 0;

    if (intervalDays > 0) {
      const base = reminder.due_at ? new Date(reminder.due_at) : new Date();
      base.setDate(base.getDate() + intervalDays);

      return updateReminder(reminder.id, {
        status: "upcoming",
        completed_at: nowIso,
        due_at: base.toISOString(),
      });
    }

    return updateReminder(reminder.id, {
      status: "completed",
      completed_at: nowIso,
    });
  }, [updateReminder]);

  const deleteReminder = useCallback(async (id) => {
    const { error: deleteError } = await supabase.from("care_reminders").delete().eq("id", id);
    if (deleteError) throw deleteError;
    setReminders((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const uploadPetFile = useCallback(async (form) => {
    if (!user) throw new Error("You must be signed in to upload files.");
    if (!form.file) throw new Error("Choose a file first.");

    const file = form.file;
    const safeName = safeFileName(file.name || "file");
    const petSegment = normalizeOptionalId(form.pet_id) || "general";
    const path = `${user.id}/${petSegment}/${createId("file")}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-files")
      .upload(path, file, { upsert: false, contentType: file.type || undefined });

    if (uploadError) throw uploadError;

    const payload = {
      user_id: user.id,
      pet_id: normalizeOptionalId(form.pet_id),
      enclosure_id: normalizeOptionalId(form.enclosure_id),
      bucket: "pet-files",
      storage_path: path,
      file_name: file.name || safeName,
      file_type: form.file_type || "Other",
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size || 0,
      is_public_passport: Boolean(form.is_public_passport),
      notes: form.notes || "",
    };

    const { data, error: insertError } = await supabase.from("pet_files").insert(payload).select().single();
    if (insertError) throw insertError;
    setFiles((previous) => [data, ...previous]);
    return data;
  }, [user]);

  const openFile = useCallback(async (file) => {
    const { data, error: signError } = await supabase.storage
      .from(file.bucket || "pet-files")
      .createSignedUrl(file.storage_path, 60 * 10);

    if (signError) throw signError;
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }, []);

  const deleteFile = useCallback(async (file) => {
    const { error: storageError } = await supabase.storage
      .from(file.bucket || "pet-files")
      .remove([file.storage_path]);

    if (storageError) throw storageError;

    const { error: deleteError } = await supabase.from("pet_files").delete().eq("id", file.id);
    if (deleteError) throw deleteError;
    setFiles((previous) => previous.filter((item) => item.id !== file.id));
  }, []);

  const createAccessInvite = useCallback(async (form) => {
    if (!user) throw new Error("You must be signed in to create an access invite.");

    const petId = normalizeOptionalId(form.pet_id);
    if (!petId) throw new Error("Choose an animal for this access invite.");

    const pet = petsById.get(String(petId));
    const token = createTransportToken();
    const now = Date.now();
    const expiresDays = Number(form.expires_in_days) || 0;
    const expiresAt = expiresDays > 0 ? new Date(now + expiresDays * 24 * 60 * 60 * 1000).toISOString() : null;

    const payload = {
      owner_id: user.id,
      pet_id: petId,
      recipient_email: form.recipient_email?.trim() || "",
      access_level: form.access_level || "view_only",
      status: "pending",
      token,
      public_snapshot: pet ? buildPublicPassportSnapshot(pet, "access") : {},
      expires_at: expiresAt,
      notes: form.notes || "",
    };

    const { data, error: insertError } = await supabase.from("access_permissions").insert(payload).select().single();
    if (insertError) throw insertError;
    setPermissions((previous) => [data, ...previous]);
    return { ...data, inviteUrl: buildAccessUrl(token) };
  }, [user, petsById]);

  const revokeAccessInvite = useCallback(async (id) => {
    const { data, error: updateError } = await supabase
      .from("access_permissions")
      .update({ status: "revoked", revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;
    setPermissions((previous) => previous.map((item) => (item.id === id ? data : item)));
    return data;
  }, []);

  return {
    user,
    loading,
    error,
    enclosures,
    equipment,
    reminders,
    files,
    permissions,
    refresh,
    createEnclosure,
    updateEnclosure,
    deleteEnclosure,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    createReminder,
    updateReminder,
    completeReminder,
    deleteReminder,
    uploadPetFile,
    openFile,
    deleteFile,
    createAccessInvite,
    revokeAccessInvite,
  };
}
