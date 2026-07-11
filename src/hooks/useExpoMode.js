import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  buildExpoEventUrl,
  buildExpoListingSnapshot,
  buildExpoListingUrl,
  createExpoSlug,
  createExpoToken,
  createListingCode,
  normalizePublicExpoPayload,
} from "../data/expoMode";

function uniqueById(items = []) {
  const map = new Map();
  items.forEach((item) => item?.id != null && map.set(String(item.id), item));
  return Array.from(map.values());
}

function numericId(value) {
  if (value == null || value === "" || value === "none") return null;
  return /^\d+$/.test(String(value)) ? Number(value) : null;
}

const EXPO_CACHE_TTL_MS = 2 * 60 * 1000;
const DISCOVERY_CACHE_TTL_MS = 60 * 1000;
const expoSessionCache = new Map();
let discoveryCache = null;

function cacheIsFresh(entry, ttl) {
  return Boolean(entry && Date.now() - entry.savedAt < ttl);
}

export function useExpoDiscovery() {
  const cachedEvents = cacheIsFresh(discoveryCache, DISCOVERY_CACHE_TTL_MS)
    ? discoveryCache.events
    : [];
  const [events, setEvents] = useState(cachedEvents);
  const [loading, setLoading] = useState(!cachedEvents.length);
  const [error, setError] = useState(null);
  const requestRef = useRef(null);
  const hasDataRef = useRef(Boolean(cachedEvents.length));

  const refresh = useCallback(async ({ silent = false, force = false } = {}) => {
    if (requestRef.current && !force) return requestRef.current;

    const request = (async () => {
      if (!silent && !hasDataRef.current) setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc("get_public_expo_events");
      if (rpcError) {
        setError(rpcError);
        if (!hasDataRef.current) setEvents([]);
      } else {
        const normalized = normalizePublicExpoPayload(data);
        const nextEvents = Array.isArray(normalized) ? normalized : [];
        discoveryCache = { events: nextEvents, savedAt: Date.now() };
        hasDataRef.current = true;
        setEvents(nextEvents);
      }

      setLoading(false);
    })();

    requestRef.current = request;
    try {
      await request;
    } finally {
      if (requestRef.current === request) requestRef.current = null;
    }
  }, []);

  useEffect(() => {
    refresh({ silent: hasDataRef.current });
  }, [refresh]);

  return { events, loading, error, refresh };
}

export default function useExpoMode(pets = []) {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [listings, setListings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [holds, setHolds] = useState([]);
  const [follows, setFollows] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [scans, setScans] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const petsById = useMemo(() => {
    const map = new Map();
    pets.forEach((pet) => {
      map.set(String(pet.id), pet);
      if (pet.cloudId != null) map.set(String(pet.cloudId), pet);
    });
    return map;
  }, [pets]);

  const hasLoadedRef = useRef(false);
  const refreshRequestRef = useRef(null);

  const applySnapshot = useCallback((snapshot) => {
    setEvents(snapshot.events || []);
    setVendors(snapshot.vendors || []);
    setListings(snapshot.listings || []);
    setLeads(snapshot.leads || []);
    setHolds(snapshot.holds || []);
    setFollows(snapshot.follows || []);
    setFavorites(snapshot.favorites || []);
    setScans(snapshot.scans || []);
    setUpdates(snapshot.updates || []);
  }, []);

  const refresh = useCallback(async ({ force = false } = {}) => {
    if (refreshRequestRef.current && !force) return refreshRequestRef.current;

    const request = (async () => {
      const shouldBlockPage = !hasLoadedRef.current;
      if (shouldBlockPage) setLoading(true);
      setError(null);

      const { data: sessionData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        setError(authError);
        setLoading(false);
        return;
      }

      const currentUser = sessionData?.session?.user || null;
      setUser(currentUser);

      if (!currentUser) {
        const emptySnapshot = {
          events: [], vendors: [], listings: [], leads: [], holds: [],
          follows: [], favorites: [], scans: [], updates: [],
        };
        applySnapshot(emptySnapshot);
        hasLoadedRef.current = true;
        setLoading(false);
        return;
      }

      const cached = expoSessionCache.get(currentUser.id);
      if (!hasLoadedRef.current && cacheIsFresh(cached, EXPO_CACHE_TTL_MS)) {
        applySnapshot(cached.snapshot);
        hasLoadedRef.current = true;
        setLoading(false);
      }

      try {
        const [ownedResult, membershipsResult, followsResult, favoritesResult] = await Promise.all([
          supabase.from("expo_events").select("*").eq("owner_id", currentUser.id).order("starts_at", { ascending: true }),
          supabase.from("expo_event_vendors").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
          supabase.from("expo_event_follows").select("id,event_id,user_id,notifications_enabled,last_viewed_at,created_at").eq("user_id", currentUser.id),
          supabase.from("expo_listing_favorites").select("id,event_id,listing_id,user_id,created_at").eq("user_id", currentUser.id),
        ]);

        [ownedResult, membershipsResult, followsResult, favoritesResult].forEach((result) => {
          if (result.error) throw result.error;
        });

        const membershipEventIds = (membershipsResult.data || []).map((item) => item.event_id);
        let joinedEvents = [];

        if (membershipEventIds.length) {
          const joinedResult = await supabase
            .from("expo_events")
            .select("*")
            .in("id", membershipEventIds);

          if (joinedResult.error) throw joinedResult.error;
          joinedEvents = joinedResult.data || [];
        }

        const mergedEvents = uniqueById([...(ownedResult.data || []), ...joinedEvents]);
        const eventIds = mergedEvents.map((event) => event.id);

        let vendorRows = membershipsResult.data || [];
        let listingRows = [];
        let leadRows = [];
        let holdRows = [];
        let scanRows = [];
        let updateRows = [];

        if (eventIds.length) {
          // Hold cleanup is useful, but it should not delay the visible dashboard.
          Promise.allSettled(
            eventIds.map((eventId) =>
              supabase.rpc("release_expired_expo_holds", { p_event_id: eventId })
            )
          ).catch(() => {});

          const [vendorsResult, listingsResult, leadsResult, holdsResult, scansResult, updatesResult] = await Promise.all([
            supabase.from("expo_event_vendors").select("*").in("event_id", eventIds).order("display_name"),
            supabase.from("expo_event_animals").select("*").in("event_id", eventIds).order("featured", { ascending: false }).order("sort_order").order("created_at"),
            supabase.from("expo_leads").select("*").in("event_id", eventIds).order("created_at", { ascending: false }),
            supabase.from("expo_holds").select("*").in("event_id", eventIds).order("created_at", { ascending: false }),
            supabase.from("expo_scans").select("id,event_id,listing_id,scan_type,created_at").in("event_id", eventIds).order("created_at", { ascending: false }).limit(500),
            supabase.from("expo_updates").select("*").in("event_id", eventIds).order("created_at", { ascending: false }).limit(500),
          ]);

          [vendorsResult, listingsResult, leadsResult, holdsResult, scansResult, updatesResult].forEach((result) => {
            if (result.error) throw result.error;
          });

          vendorRows = vendorsResult.data || [];
          listingRows = listingsResult.data || [];
          leadRows = leadsResult.data || [];
          holdRows = holdsResult.data || [];
          scanRows = scansResult.data || [];
          updateRows = updatesResult.data || [];
        }

        const snapshot = {
          events: mergedEvents,
          vendors: vendorRows,
          listings: listingRows,
          leads: leadRows,
          holds: holdRows,
          follows: followsResult.data || [],
          favorites: favoritesResult.data || [],
          scans: scanRows,
          updates: updateRows,
        };

        applySnapshot(snapshot);
        expoSessionCache.set(currentUser.id, { snapshot, savedAt: Date.now() });
        hasLoadedRef.current = true;
      } catch (loadError) {
        console.error("Unable to load Expo Mode:", loadError);
        if (!hasLoadedRef.current) setError(loadError);
      } finally {
        setLoading(false);
      }
    })();

    refreshRequestRef.current = request;
    try {
      await request;
    } finally {
      if (refreshRequestRef.current === request) refreshRequestRef.current = null;
    }
  }, [applySnapshot]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEvent = useCallback(
    async (form) => {
      if (!user) throw new Error("You must be signed in to create an expo.");

      const payload = {
        owner_id: user.id,
        name: form.name?.trim() || "New Expo",
        slug: createExpoSlug(form.name),
        mode: form.mode || "mixed",
        status: form.status || "Draft",
        venue: form.venue?.trim() || "",
        city: form.city?.trim() || "",
        region: form.region?.trim() || "",
        booth_number: form.booth_number?.trim() || "",
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        public_hours: form.public_hours?.trim() || "",
        description: form.description?.trim() || "",
        contact_email: form.contact_email?.trim().toLowerCase() || "",
        contact_phone: form.contact_phone?.trim() || "",
        website_url: form.website_url?.trim() || "",
        social_handle: form.social_handle?.trim() || "",
        logo_url: form.logo_url?.trim() || "",
        banner_url: form.banner_url?.trim() || "",
        public_expires_at: form.public_expires_at || null,
        is_public: Boolean(form.is_public),
        publish_inventory_at: form.publish_inventory_at || null,
        show_prices: form.show_prices !== false,
        allow_interest: form.allow_interest !== false,
        allow_hold_requests: form.allow_hold_requests !== false,
        kiosk_enabled: form.kiosk_enabled !== false,
        kiosk_pin_required: Boolean(form.kiosk_pin),
        public_settings: {
          showVendorContacts: Boolean(form.show_vendor_contacts),
          featuredMessage: form.featured_message || "",
        },
      };

      const { data: event, error: eventError } = await supabase
        .from("expo_events")
        .insert(payload)
        .select()
        .single();

      if (eventError) throw eventError;

      const { data: vendor, error: vendorError } = await supabase
        .from("expo_event_vendors")
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: "approved",
          vendor_type: form.vendor_type || "Breeder",
          display_name: form.business_name?.trim() || form.organizer_name?.trim() || "Event organizer",
          booth_number: form.booth_number?.trim() || "",
          bio: form.vendor_bio?.trim() || "",
          contact_email: form.contact_email?.trim().toLowerCase() || "",
          contact_phone: form.contact_phone?.trim() || "",
          website_url: form.website_url?.trim() || "",
          social_handle: form.social_handle?.trim() || "",
          show_contact: Boolean(form.show_vendor_contacts),
          approved_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (vendorError) throw vendorError;

      if (form.kiosk_pin) {
        const { error: pinError } = await supabase.rpc("set_expo_kiosk_pin", {
          p_event_id: event.id,
          p_pin: String(form.kiosk_pin),
        });
        if (pinError) throw pinError;
      }

      await refresh();
      return { event, vendor, publicUrl: buildExpoEventUrl(event.slug) };
    },
    [user, refresh]
  );

  const updateEvent = useCallback(
    async (eventId, updatesToSave) => {
      const payload = { ...updatesToSave, updated_at: new Date().toISOString() };
      const kioskPin = payload.kiosk_pin;
      delete payload.kiosk_pin;

      const { data, error: updateError } = await supabase
        .from("expo_events")
        .update(payload)
        .eq("id", eventId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (kioskPin) {
        const { error: pinError } = await supabase.rpc("set_expo_kiosk_pin", {
          p_event_id: eventId,
          p_pin: String(kioskPin),
        });
        if (pinError) throw pinError;
      }

      await refresh();
      return data;
    },
    [refresh]
  );

  const regenerateEventLink = useCallback(
    async (eventId, eventName) => {
      const { data, error: updateError } = await supabase
        .from("expo_events")
        .update({ slug: createExpoSlug(eventName), updated_at: new Date().toISOString() })
        .eq("id", eventId)
        .select()
        .single();

      if (updateError) throw updateError;
      await refresh();
      return { ...data, publicUrl: buildExpoEventUrl(data.slug) };
    },
    [refresh]
  );

  const regenerateListingLink = useCallback(
    async (listingId) => {
      const { data, error: updateError } = await supabase
        .from("expo_event_animals")
        .update({ listing_token: createExpoToken("listing"), updated_at: new Date().toISOString() })
        .eq("id", listingId)
        .select()
        .single();

      if (updateError) throw updateError;
      await refresh();
      const event = events.find((item) => item.id === data.event_id);
      return { ...data, publicUrl: event ? buildExpoListingUrl(event.slug, data.listing_token) : "" };
    },
    [events, refresh]
  );

  const requestVendorAccess = useCallback(
    async (eventId, form) => {
      if (!user) throw new Error("Sign in before joining an expo.");

      const { data, error: insertError } = await supabase
        .from("expo_event_vendors")
        .upsert(
          {
            event_id: Number(eventId),
            user_id: user.id,
            status: "pending",
            vendor_type: form.vendor_type || "Breeder",
            display_name: form.display_name?.trim() || "PetPassport exhibitor",
            booth_number: form.booth_number?.trim() || "",
            bio: form.bio?.trim() || "",
            contact_email: form.contact_email?.trim().toLowerCase() || "",
            contact_phone: form.contact_phone?.trim() || "",
            website_url: form.website_url?.trim() || "",
            social_handle: form.social_handle?.trim() || "",
            show_contact: Boolean(form.show_contact),
          },
          { onConflict: "event_id,user_id" }
        )
        .select()
        .single();

      if (insertError) throw insertError;
      await refresh();
      return data;
    },
    [user, refresh]
  );

  const updateVendor = useCallback(
    async (vendorId, updatesToSave) => {
      const { data, error: updateError } = await supabase
        .from("expo_event_vendors")
        .update({ ...updatesToSave, updated_at: new Date().toISOString() })
        .eq("id", vendorId)
        .select()
        .single();

      if (updateError) throw updateError;
      await refresh();
      return data;
    },
    [refresh]
  );

  const createListing = useCallback(
    async (form) => {
      if (!user) throw new Error("You must be signed in to add expo inventory.");

      const pet = petsById.get(String(form.pet_id));
      if (!pet) throw new Error("Choose an animal from your PetPassport collection.");

      const petId = numericId(pet.cloudId || pet.id);
      if (!petId) throw new Error("This animal has not finished cloud syncing yet.");

      const vendor = vendors.find(
        (item) =>
          item.event_id === Number(form.event_id) &&
          item.user_id === user.id &&
          item.status === "approved"
      );

      if (!vendor) throw new Error("Your exhibitor profile must be approved before adding inventory.");

      const latestWeight = pet.weightLogs?.[0];
      const payload = {
        event_id: Number(form.event_id),
        vendor_id: vendor.id,
        owner_id: user.id,
        pet_id: petId,
        listing_token: createExpoToken("listing"),
        listing_code: createListingCode(pet),
        public_snapshot: buildExpoListingSnapshot(pet),
        display_name: form.display_name?.trim() || pet.name || "Unnamed animal",
        species: form.species?.trim() || pet.species || "",
        morph: form.morph?.trim() || pet.morph || "",
        sex: form.sex || pet.sex || "Unknown",
        hatch_birth_date: form.hatch_birth_date || pet.dob || null,
        status: form.status || "Available",
        price: form.price === "" || form.price == null ? null : Number(form.price),
        currency: form.currency || "USD",
        price_label: form.price_label?.trim() || "",
        deposit_amount:
          form.deposit_amount === "" || form.deposit_amount == null
            ? null
            : Number(form.deposit_amount),
        negotiable: Boolean(form.negotiable),
        featured: Boolean(form.featured),
        show_in_catalog: form.show_in_catalog !== false,
        booth_location: form.booth_location?.trim() || vendor.booth_number || "",
        public_temperament: form.public_temperament?.trim() || pet.temperament || "",
        feeding_status:
          form.feeding_status?.trim() || (pet.diet ? `Eating ${pet.diet}` : ""),
        last_fed_text:
          form.last_fed_text?.trim() ||
          (pet.lastFed ? new Date(pet.lastFed).toLocaleDateString() : ""),
        weight_text:
          form.weight_text?.trim() ||
          (latestWeight ? `${latestWeight.weight} ${latestWeight.unit || "g"}` : ""),
        care_level: form.care_level || "Intermediate",
        genetics: form.genetics?.trim() || "",
        parent_information: form.parent_information?.trim() || "",
        included_supplies: form.included_supplies?.trim() || "",
        pickup_requirements: form.pickup_requirements?.trim() || "",
        expo_notes: form.expo_notes?.trim() || "",
        published_at: form.show_in_catalog === false ? null : new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from("expo_event_animals")
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from("expo_updates").insert({
        event_id: data.event_id,
        vendor_id: data.vendor_id,
        created_by: user.id,
        listing_id: data.id,
        kind: "inventory",
        title: `${data.display_name} added`,
        message: `${data.species}${data.morph ? ` • ${data.morph}` : ""} is planned for the expo.`,
        is_public: true,
      });

      await refresh();
      const event = events.find((item) => item.id === data.event_id);
      return {
        ...data,
        publicUrl: event ? buildExpoListingUrl(event.slug, data.listing_token) : "",
      };
    },
    [user, petsById, vendors, events, refresh]
  );

  const updateListing = useCallback(
    async (listingId, updatesToSave, publicUpdate = true) => {
      const payload = { ...updatesToSave, updated_at: new Date().toISOString() };
      delete payload.id;
      delete payload.created_at;
      delete payload.owner_id;
      delete payload.vendor_id;
      delete payload.listing_token;
      delete payload.listing_code;
      delete payload.public_snapshot;

      const { data, error: updateError } = await supabase
        .from("expo_event_animals")
        .update(payload)
        .eq("id", listingId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (publicUpdate && user) {
        await supabase.from("expo_updates").insert({
          event_id: data.event_id,
          vendor_id: data.vendor_id,
          created_by: user.id,
          listing_id: data.id,
          kind: "status",
          title: `${data.display_name}: ${data.status}`,
          message: `${data.display_name}'s expo status changed to ${data.status}.`,
          is_public: true,
        });
      }

      await refresh();
      return data;
    },
    [user, refresh]
  );

  const deleteListing = useCallback(
    async (listingId) => {
      const { error: deleteError } = await supabase
        .from("expo_event_animals")
        .delete()
        .eq("id", listingId);

      if (deleteError) throw deleteError;
      await refresh();
    },
    [refresh]
  );

  const updateLead = useCallback(
    async (leadId, updatesToSave) => {
      const { data, error: updateError } = await supabase
        .from("expo_leads")
        .update({ ...updatesToSave, updated_at: new Date().toISOString() })
        .eq("id", leadId)
        .select()
        .single();

      if (updateError) throw updateError;
      await refresh();
      return data;
    },
    [refresh]
  );

  const createHold = useCallback(
    async (lead, form = {}) => {
      if (!user) throw new Error("You must be signed in to create a hold.");

      const listing = listings.find((item) => item.id === lead.listing_id);
      if (!listing) throw new Error("The animal listing could not be found.");

      const hours = Number(form.hours || 2);
      const { data, error: insertError } = await supabase
        .from("expo_holds")
        .insert({
          event_id: lead.event_id,
          listing_id: lead.listing_id,
          vendor_id: lead.vendor_id,
          lead_id: lead.id,
          created_by: user.id,
          visitor_name: lead.name || "Expo visitor",
          visitor_email: lead.email || "",
          expires_at: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
          deposit_amount:
            form.deposit_amount === "" || form.deposit_amount == null
              ? listing.deposit_amount
              : Number(form.deposit_amount),
          payment_status: form.payment_status || "Not paid",
          status: "active",
          notes: form.notes || "",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase
        .from("expo_event_animals")
        .update({ status: "On hold", updated_at: new Date().toISOString() })
        .eq("id", listing.id);

      await supabase
        .from("expo_leads")
        .update({ status: "Hold requested", updated_at: new Date().toISOString() })
        .eq("id", lead.id);

      await refresh();
      return data;
    },
    [user, listings, refresh]
  );

  const updateHold = useCallback(
    async (holdId, updatesToSave) => {
      const { data, error: updateError } = await supabase
        .from("expo_holds")
        .update({ ...updatesToSave, updated_at: new Date().toISOString() })
        .eq("id", holdId)
        .select()
        .single();

      if (updateError) throw updateError;
      await refresh();
      return data;
    },
    [refresh]
  );

  const releaseHold = useCallback(
    async (hold) => {
      await supabase
        .from("expo_holds")
        .update({
          status: "released",
          released_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", hold.id);

      await supabase
        .from("expo_event_animals")
        .update({ status: "Available", updated_at: new Date().toISOString() })
        .eq("id", hold.listing_id);

      await refresh();
    },
    [refresh]
  );

  const completeHold = useCallback(
    async (hold, finalStatus = "Sold") => {
      await supabase
        .from("expo_holds")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          payment_status: "Paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", hold.id);

      await supabase
        .from("expo_event_animals")
        .update({ status: finalStatus, updated_at: new Date().toISOString() })
        .eq("id", hold.listing_id);

      if (hold.lead_id) {
        await supabase
          .from("expo_leads")
          .update({ status: "Completed", updated_at: new Date().toISOString() })
          .eq("id", hold.lead_id);
      }

      await refresh();
    },
    [refresh]
  );

  const postUpdate = useCallback(
    async (eventId, form) => {
      if (!user) throw new Error("Sign in to post an expo update.");

      const vendor = vendors.find(
        (item) => item.event_id === Number(eventId) && item.user_id === user.id
      );

      const { data, error: insertError } = await supabase
        .from("expo_updates")
        .insert({
          event_id: Number(eventId),
          vendor_id: vendor?.id || null,
          created_by: user.id,
          title: form.title?.trim() || "Expo update",
          message: form.message?.trim() || "",
          kind: form.kind || "announcement",
          is_public: form.is_public !== false,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      await refresh();
      return data;
    },
    [user, vendors, refresh]
  );

  const toggleFollow = useCallback(
    async (eventId, notificationsEnabled = true) => {
      if (!user) throw new Error("Sign in to follow an expo.");

      const existing = follows.find((item) => item.event_id === Number(eventId));
      if (existing) {
        const { error: deleteError } = await supabase
          .from("expo_event_follows")
          .delete()
          .eq("id", existing.id);
        if (deleteError) throw deleteError;
        await refresh();
        return false;
      }

      const { error: insertError } = await supabase
        .from("expo_event_follows")
        .insert({
          event_id: Number(eventId),
          user_id: user.id,
          notifications_enabled: notificationsEnabled,
          last_viewed_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
      await refresh();
      return true;
    },
    [user, follows, refresh]
  );

  const toggleFavorite = useCallback(
    async (listingId) => {
      if (!user) throw new Error("Sign in to save expo animals.");

      const existing = favorites.find(
        (item) => item.listing_id === Number(listingId)
      );

      if (existing) {
        const { error: deleteError } = await supabase
          .from("expo_listing_favorites")
          .delete()
          .eq("id", existing.id);
        if (deleteError) throw deleteError;
        await refresh();
        return false;
      }

      const listing = listings.find((item) => item.id === Number(listingId));
      const { error: insertError } = await supabase
        .from("expo_listing_favorites")
        .insert({
          event_id: listing?.event_id,
          listing_id: Number(listingId),
          user_id: user.id,
        });

      if (insertError) throw insertError;
      await refresh();
      return true;
    },
    [user, favorites, listings, refresh]
  );

  return {
    user,
    loading,
    error,
    events,
    vendors,
    listings,
    leads,
    holds,
    follows,
    favorites,
    scans,
    updates,
    refresh,
    createEvent,
    updateEvent,
    regenerateEventLink,
    regenerateListingLink,
    requestVendorAccess,
    updateVendor,
    createListing,
    updateListing,
    deleteListing,
    updateLead,
    createHold,
    updateHold,
    releaseHold,
    completeHold,
    postUpdate,
    toggleFollow,
    toggleFavorite,
  };
}
