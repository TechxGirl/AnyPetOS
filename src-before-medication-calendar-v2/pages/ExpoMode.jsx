import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Icon,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from "../components/ui";
import useAsyncAction from "../hooks/useAsyncAction";
import useExpoMode from "../hooks/useExpoMode";
import { supabase } from "../services/supabaseClient";
import {
  EXPO_CARE_LEVELS,
  EXPO_EVENT_MODES,
  EXPO_EVENT_STATUSES,
  EXPO_LEAD_STATUSES,
  EXPO_LISTING_STATUSES,
  EXPO_VENDOR_TYPES,
  buildExpoEventUrl,
  buildExpoKioskUrl,
  buildExpoListingUrl,
  expoAvailabilityVariant,
  formatExpoDate,
  formatExpoMoney,
} from "../data/expoMode";
import { buildTransferUrl, copyTextToClipboard } from "../utils/passportTransport";
import "../styles/expo.css";

const TABS = [
  { id: "overview", label: "Overview", icon: "dashboard" },
  { id: "animals", label: "Animals", icon: "paw" },
  { id: "exhibitors", label: "Exhibitors", icon: "store" },
  { id: "leads", label: "Leads & holds", icon: "users" },
  { id: "print", label: "Kiosk & print", icon: "scan" },
  { id: "settings", label: "Settings", icon: "settings" },
];

const EVENT_FORM_DEFAULTS = {
  name: "",
  mode: "breeder",
  status: "Published",
  venue: "",
  city: "",
  region: "",
  booth_number: "",
  starts_at: "",
  ends_at: "",
  public_hours: "",
  description: "",
  business_name: "",
  vendor_type: "Breeder",
  vendor_bio: "",
  contact_email: "",
  contact_phone: "",
  website_url: "",
  social_handle: "",
  logo_url: "",
  banner_url: "",
  public_expires_at: "",
  is_public: true,
  publish_inventory_at: "",
  show_prices: true,
  allow_interest: true,
  allow_hold_requests: true,
  kiosk_enabled: true,
  kiosk_pin: "",
  show_vendor_contacts: false,
  featured_message: "",
};

const LISTING_FORM_DEFAULTS = {
  pet_id: "none",
  event_id: "",
  display_name: "",
  species: "",
  morph: "",
  sex: "Unknown",
  hatch_birth_date: "",
  status: "Available",
  price: "",
  currency: "USD",
  price_label: "",
  deposit_amount: "",
  negotiable: false,
  featured: false,
  show_in_catalog: true,
  booth_location: "",
  public_temperament: "",
  feeding_status: "",
  last_fed_text: "",
  weight_text: "",
  care_level: "Intermediate",
  genetics: "",
  parent_information: "",
  included_supplies: "",
  pickup_requirements: "",
  expo_notes: "",
};

const VENDOR_FORM_DEFAULTS = {
  expo_slug: "",
  vendor_type: "Breeder",
  display_name: "",
  booth_number: "",
  bio: "",
  contact_email: "",
  contact_phone: "",
  website_url: "",
  social_handle: "",
  show_contact: false,
};

function petPhoto(listing) {
  return listing?.public_snapshot?.passport?.photo || null;
}

function initials(value) {
  return String(value || "PP")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

let qrModulePromise = null;

async function createExpoQr(value, options = {}) {
  qrModulePromise ||= import("qrcode");
  const module = await qrModulePromise;
  const QRCode = module.default || module;
  return QRCode.toDataURL(value, options);
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function leadColumnId(status) {
  return `expo-lead-${String(status || "stage").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function formDateTimeValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function Field({ label, children, full = false, hint = "" }) {
  return (
    <label className={full ? "expo-field expo-field-full" : "expo-field"}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

function CheckField({ label, checked, onChange, description = "" }) {
  return (
    <label className="expo-check-card">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span><strong>{label}</strong>{description && <small>{description}</small>}</span>
    </label>
  );
}

function ExpoAnimalThumb({ listing }) {
  const photo = petPhoto(listing);
  if (photo) return <img src={photo} alt={listing.display_name} />;
  return <div className="expo-animal-thumb-placeholder"><b>{initials(listing.display_name)}</b><small>{listing.species || "Animal"}</small></div>;
}

function ExpoLeadCard({ lead, listing, hasActiveHold, onOpen, onCreateHold, onStatusChange }) {
  const primaryContact = lead.email || lead.phone || "No contact listed";
  const contactHref = lead.email
    ? `mailto:${lead.email}`
    : lead.phone
      ? `tel:${lead.phone}`
      : "";

  return (
    <article className="expo-lead-card">
      <div className="expo-lead-card-head">
        <div>
          <strong>{lead.name || "Expo visitor"}</strong>
          <span>{lead.preferred_contact ? `Prefers ${lead.preferred_contact}` : "Contact preference not set"}</span>
        </div>
        <Badge variant="neutral">{lead.interest_level || "Interested"}</Badge>
      </div>

      <div className="expo-lead-animal">
        {listing && <ExpoAnimalThumb listing={listing} />}
        <div>
          <strong>{listing?.display_name || "Event inquiry"}</strong>
          <span>{listing?.listing_code || "No listing code"}</span>
        </div>
      </div>

      {contactHref ? (
        <a className="expo-lead-contact" href={contactHref} title={primaryContact}>
          <Icon name={lead.email ? "mail" : "phone"} size={15} />
          <span>{primaryContact}</span>
        </a>
      ) : (
        <div className="expo-lead-contact is-muted">
          <Icon name="info" size={15} />
          <span>{primaryContact}</span>
        </div>
      )}

      <div className="expo-lead-card-actions">
        <Button size="sm" variant="outline" onClick={onOpen}>Open details</Button>
        {!hasActiveHold && listing && (
          <Button size="sm" onClick={onCreateHold}>Create hold</Button>
        )}
      </div>

      <label className="expo-lead-stage-select">
        <span>Pipeline stage</span>
        <Select value={lead.status} onChange={(event) => onStatusChange(event.target.value)}>
          {EXPO_LEAD_STATUSES.map((item) => <option key={item}>{item}</option>)}
        </Select>
      </label>
    </article>
  );
}

export default function ExpoMode({ pets, profile, createPassportTransfer }) {
  const expo = useExpoMode(pets);
  const { runAction, isPending } = useAsyncAction();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeEventId, setActiveEventId] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [leadModal, setLeadModal] = useState(null);
  const [holdModal, setHoldModal] = useState(null);
  const [eventForm, setEventForm] = useState(EVENT_FORM_DEFAULTS);
  const [listingForm, setListingForm] = useState(LISTING_FORM_DEFAULTS);
  const [vendorForm, setVendorForm] = useState(VENDOR_FORM_DEFAULTS);
  const [updateForm, setUpdateForm] = useState({ title: "", message: "", kind: "announcement", is_public: true });
  const [eventQr, setEventQr] = useState("");
  const [listingQrs, setListingQrs] = useState({});
  const [vendorQrs, setVendorQrs] = useState({});
  const [qrLoading, setQrLoading] = useState(false);
  const [analytics, setAnalytics] = useState({ views: 0, followers: 0, favorites: 0, leads: 0, holds: 0, completed: 0, listing_views: [], listing_favorites: [] });
  const [transferModal, setTransferModal] = useState(null);
  const [printMode, setPrintMode] = useState("cage-cards");
  const [printListingIds, setPrintListingIds] = useState([]);
  const [settingsForm, setSettingsForm] = useState(null);

  const resolvedEventId = activeEventId ?? expo.events[0]?.id ?? null;
  const sameExpoId = (left, right) =>
    left != null && right != null && String(left) === String(right);

  useEffect(() => {
    if (!expo.events.length) {
      if (activeEventId !== null) setActiveEventId(null);
      return;
    }

    const activeEventStillExists = expo.events.some((event) =>
      sameExpoId(event.id, activeEventId)
    );

    if (!activeEventId || !activeEventStillExists) {
      setActiveEventId(expo.events[0].id);
    }
  }, [activeEventId, expo.events]);

  const activeEvent = useMemo(
    () =>
      expo.events.find((event) => sameExpoId(event.id, resolvedEventId)) ||
      expo.events[0] ||
      null,
    [resolvedEventId, expo.events]
  );
  const activeVendors = useMemo(
    () => expo.vendors.filter((vendor) => sameExpoId(vendor.event_id, resolvedEventId)),
    [resolvedEventId, expo.vendors]
  );
  const activeListings = useMemo(
    () => expo.listings.filter((listing) => sameExpoId(listing.event_id, resolvedEventId)),
    [resolvedEventId, expo.listings]
  );
  const activeLeads = useMemo(
    () => expo.leads.filter((lead) => sameExpoId(lead.event_id, resolvedEventId)),
    [resolvedEventId, expo.leads]
  );
  const activeHolds = useMemo(
    () => expo.holds.filter((hold) => sameExpoId(hold.event_id, resolvedEventId)),
    [resolvedEventId, expo.holds]
  );
  const activeScans = useMemo(
    () => expo.scans.filter((scan) => sameExpoId(scan.event_id, resolvedEventId)),
    [resolvedEventId, expo.scans]
  );
  const activeUpdates = useMemo(
    () => expo.updates.filter((update) => sameExpoId(update.event_id, resolvedEventId)),
    [resolvedEventId, expo.updates]
  );
  const currentVendor = useMemo(
    () => activeVendors.find((vendor) => vendor.user_id === expo.user?.id) || null,
    [activeVendors, expo.user?.id]
  );
  const isOrganizer = activeEvent?.owner_id === expo.user?.id;

  const stats = useMemo(() => ({
    animals: activeListings.length,
    available: activeListings.filter((item) => item.status === "Available").length,
    scans: activeScans.length,
    leads: activeLeads.length,
    holds: activeHolds.filter((item) => item.status === "active").length,
    completed: activeListings.filter((item) => ["Sold", "Adopted"].includes(item.status)).length,
  }), [activeListings, activeScans, activeLeads, activeHolds]);

  useEffect(() => {
    if (!activeEvent) {
      setSettingsForm(null);
      return;
    }

    setSettingsForm({
      name: activeEvent.name || "",
      mode: activeEvent.mode || "mixed",
      status: activeEvent.status || "Draft",
      venue: activeEvent.venue || "",
      city: activeEvent.city || "",
      region: activeEvent.region || "",
      booth_number: activeEvent.booth_number || "",
      starts_at: formDateTimeValue(activeEvent.starts_at),
      ends_at: formDateTimeValue(activeEvent.ends_at),
      public_hours: activeEvent.public_hours || "",
      description: activeEvent.description || "",
      contact_email: activeEvent.contact_email || "",
      contact_phone: activeEvent.contact_phone || "",
      website_url: activeEvent.website_url || "",
      social_handle: activeEvent.social_handle || "",
      logo_url: activeEvent.logo_url || "",
      banner_url: activeEvent.banner_url || "",
      public_expires_at: formDateTimeValue(activeEvent.public_expires_at),
      is_public: Boolean(activeEvent.is_public),
      publish_inventory_at: formDateTimeValue(activeEvent.publish_inventory_at),
      show_prices: activeEvent.show_prices !== false,
      allow_interest: activeEvent.allow_interest !== false,
      allow_hold_requests: activeEvent.allow_hold_requests !== false,
      kiosk_enabled: activeEvent.kiosk_enabled !== false,
      kiosk_pin: "",
      featured_message: activeEvent.public_settings?.featuredMessage || "",
      show_vendor_contacts: Boolean(activeEvent.public_settings?.showVendorContacts),
    });
  }, [activeEvent]);

  useEffect(() => {
    if (!activeEvent) {
      setEventQr("");
      setListingQrs({});
      setVendorQrs({});
      setQrLoading(false);
      return undefined;
    }

    // QR generation is deliberately deferred until the Print Center is opened.
    // This keeps normal Expo dashboard loads light and avoids generating dozens
    // of large data URLs when the user only needs leads, inventory, or settings.
    if (activeTab !== "print") return undefined;

    let cancelled = false;
    setQrLoading(true);

    const createQrs = async () => {
      const eventUrl = buildExpoEventUrl(activeEvent.slug);
      const eventDataUrl = await createExpoQr(eventUrl, {
        width: 480,
        margin: 2,
        errorCorrectionLevel: "H",
      });

      const entries = await Promise.all(activeListings.map(async (listing) => {
        const listingUrl = buildExpoListingUrl(activeEvent.slug, listing.listing_token);
        const dataUrl = await createExpoQr(listingUrl, {
          width: 420,
          margin: 2,
          errorCorrectionLevel: "H",
        });
        return [listing.id, dataUrl];
      }));

      const vendorEntries = await Promise.all(activeVendors
        .filter((vendor) => vendor.status === "approved")
        .map(async (vendor) => {
          const vendorUrl = `${buildExpoEventUrl(activeEvent.slug)}?vendor=${encodeURIComponent(vendor.id)}`;
          const dataUrl = await createExpoQr(vendorUrl, {
            width: 420,
            margin: 2,
            errorCorrectionLevel: "H",
          });
          return [vendor.id, dataUrl];
        }));

      if (cancelled) return;
      setEventQr(eventDataUrl);
      setListingQrs(Object.fromEntries(entries));
      setVendorQrs(Object.fromEntries(vendorEntries));
    };

    createQrs()
      .catch((error) => console.warn("Expo QR codes could not be generated:", error))
      .finally(() => {
        if (!cancelled) setQrLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, activeEvent, activeListings, activeVendors]);

  useEffect(() => {
    if (!resolvedEventId) {
      setAnalytics({ views: 0, followers: 0, favorites: 0, leads: 0, holds: 0, completed: 0, listing_views: [], listing_favorites: [] });
      return;
    }

    supabase.rpc("get_expo_event_analytics", { p_event_id: resolvedEventId }).then(({ data, error }) => {
      if (error) {
        console.warn("Expo analytics could not be loaded:", error);
        return;
      }

      if (!data) return;

      const normalized = typeof data === "string"
        ? JSON.parse(data)
        : data;

      setAnalytics({
        views: Number(normalized?.views || 0),
        followers: Number(normalized?.followers || 0),
        favorites: Number(normalized?.favorites || 0),
        leads: Number(normalized?.leads || 0),
        holds: Number(normalized?.holds || 0),
        completed: Number(normalized?.completed || 0),
        listing_views: Array.isArray(normalized?.listing_views) ? normalized.listing_views : [],
        listing_favorites: Array.isArray(normalized?.listing_favorites) ? normalized.listing_favorites : [],
      });
    }).catch((error) => {
      console.warn("Expo analytics response could not be processed:", error);
    });
  }, [resolvedEventId, activeListings, activeLeads, activeHolds, activeScans]);

  const openCreateEvent = () => {
    setEventForm({
      ...EVENT_FORM_DEFAULTS,
      business_name: profile?.display_name || "",
      contact_email: expo.user?.email || "",
    });
    setEventModalOpen(true);
  };

  const submitEvent = async (event) => {
    event.preventDefault();
    const result = await runAction({
      key: "expo-create-event",
      action: () => expo.createEvent(eventForm),
      successTitle: "Expo command center created",
      successMessage: "The event, organizer booth, public catalog, and kiosk foundation are ready.",
      errorMessage: "The expo could not be created.",
    });

    if (result.ok) {
      setEventModalOpen(false);
      setActiveEventId(result.data.event.id);
    }
  };

  const submitJoinExpo = async (event) => {
    event.preventDefault();
    const result = await runAction({
      key: "expo-join-event",
      action: async () => {
        const slug = vendorForm.expo_slug.trim().replace(/^.*\/expo\//, "").split(/[/?#]/)[0];
        const { data, error } = await supabase.rpc("get_public_expo_event", { p_slug: slug });
        if (error) throw error;
        const payload = typeof data === "string" ? JSON.parse(data) : data;
        if (!payload?.event?.id) throw new Error("That published expo could not be found.");
        return expo.requestVendorAccess(payload.event.id, vendorForm);
      },
      successTitle: "Exhibitor request sent",
      successMessage: "The organizer can now approve your booth. After approval, you can publish planned animals and prices.",
      errorMessage: "The exhibitor request could not be sent.",
    });

    if (result.ok) setJoinModalOpen(false);
  };

  const openListingModal = (listing = null) => {
    if (!activeEvent) return;
    setEditingListing(listing);

    if (listing) {
      setListingForm({
        ...LISTING_FORM_DEFAULTS,
        ...listing,
        pet_id: String(listing.pet_id || "none"),
        event_id: String(activeEvent.id),
        hatch_birth_date: listing.hatch_birth_date || "",
        price: listing.price ?? "",
        deposit_amount: listing.deposit_amount ?? "",
      });
    } else {
      const firstPet = pets[0];
      setListingForm({
        ...LISTING_FORM_DEFAULTS,
        pet_id: firstPet ? String(firstPet.cloudId || firstPet.id) : "none",
        event_id: String(activeEvent.id),
        booth_location: currentVendor?.booth_number || activeEvent.booth_number || "",
      });
    }

    setListingModalOpen(true);
  };

  const chooseListingPet = (petId) => {
    const pet = pets.find((item) => String(item.cloudId || item.id) === String(petId));
    setListingForm((current) => ({
      ...current,
      pet_id: petId,
      display_name: pet?.name || current.display_name,
      species: pet?.species || current.species,
      morph: pet?.morph || current.morph,
      sex: pet?.sex || current.sex,
      hatch_birth_date: pet?.dob || current.hatch_birth_date,
      public_temperament: pet?.temperament || current.public_temperament,
      feeding_status: pet?.diet ? `Eating ${pet.diet}` : current.feeding_status,
    }));
  };

  const submitListing = async (event) => {
    event.preventDefault();
    const isEdit = Boolean(editingListing);
    const result = await runAction({
      key: isEdit ? `expo-edit-listing-${editingListing.id}` : "expo-create-listing",
      action: () => isEdit
        ? expo.updateListing(editingListing.id, {
            display_name: listingForm.display_name,
            species: listingForm.species,
            morph: listingForm.morph,
            sex: listingForm.sex,
            hatch_birth_date: listingForm.hatch_birth_date || null,
            status: listingForm.status,
            price: listingForm.price === "" ? null : Number(listingForm.price),
            currency: listingForm.currency,
            price_label: listingForm.price_label,
            deposit_amount: listingForm.deposit_amount === "" ? null : Number(listingForm.deposit_amount),
            negotiable: listingForm.negotiable,
            featured: listingForm.featured,
            show_in_catalog: listingForm.show_in_catalog,
            booth_location: listingForm.booth_location,
            public_temperament: listingForm.public_temperament,
            feeding_status: listingForm.feeding_status,
            last_fed_text: listingForm.last_fed_text,
            weight_text: listingForm.weight_text,
            care_level: listingForm.care_level,
            genetics: listingForm.genetics,
            parent_information: listingForm.parent_information,
            included_supplies: listingForm.included_supplies,
            pickup_requirements: listingForm.pickup_requirements,
            expo_notes: listingForm.expo_notes,
          })
        : expo.createListing(listingForm),
      successTitle: isEdit ? "Expo listing updated" : "Animal added to the public expo plan",
      successMessage: isEdit
        ? "Public availability, price, booth, and animal details were updated."
        : "Visitors following the expo can now find this planned animal before event day.",
      errorMessage: "The expo animal could not be saved.",
    });

    if (result.ok) {
      setListingModalOpen(false);
      setEditingListing(null);
    }
  };

  const changeListingStatus = async (listing, status) => {
    await runAction({
      key: `expo-status-${listing.id}-${status}`,
      action: () => expo.updateListing(listing.id, { status }, true),
      successTitle: `${listing.display_name} is now ${status}`,
      successMessage: "The public expo catalog and update log were refreshed.",
    });
  };

  const submitUpdate = async (event) => {
    event.preventDefault();
    const result = await runAction({
      key: "expo-post-update",
      action: () => expo.postUpdate(activeEvent.id, updateForm),
      successTitle: "Expo update published",
      successMessage: "Followers can now see this update in the public event log.",
    });
    if (result.ok) setUpdateForm({ title: "", message: "", kind: "announcement", is_public: true });
  };

  const approveVendor = async (vendor, status) => {
    await runAction({
      key: `expo-vendor-${vendor.id}-${status}`,
      action: () => expo.updateVendor(vendor.id, {
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      }),
      successTitle: status === "approved" ? "Exhibitor approved" : "Exhibitor status updated",
      successMessage: status === "approved"
        ? `${vendor.display_name} can now publish planned animals and prices.`
        : `${vendor.display_name} was marked ${status}.`,
    });
  };

  const updateLeadStatus = async (lead, status) => {
    await runAction({
      key: `expo-lead-${lead.id}-${status}`,
      action: () => expo.updateLead(lead.id, { status }),
      successTitle: "Lead updated",
      successMessage: `${lead.name || "Visitor"} moved to ${status}.`,
    });
  };

  const createHold = async (event) => {
    event.preventDefault();
    const result = await runAction({
      key: `expo-create-hold-${holdModal?.lead?.id}`,
      action: () => expo.createHold(holdModal.lead, holdModal.form),
      successTitle: "Temporary hold created",
      successMessage: "The public listing now shows On hold until the hold is released or completed.",
    });
    if (result.ok) setHoldModal(null);
  };

  const startTransfer = async (listing) => {
    if (!createPassportTransfer) return;
    const result = await createPassportTransfer(listing.pet_id);
    const token = result?.data?.transfer?.token;
    if (result?.ok && token) {
      const transferUrl = buildTransferUrl(token);
      const transferQr = await createExpoQr(transferUrl, { width: 480, margin: 2, errorCorrectionLevel: "H" });
      await copyTextToClipboard(transferUrl);
      setTransferModal({ listing, transferUrl, transferQr });
    }
  };

  const regenerateEventLink = async () => {
    const result = await runAction({
      key: `expo-regenerate-event-${activeEvent.id}`,
      action: () => expo.regenerateEventLink(activeEvent.id, activeEvent.name),
      successTitle: "New public event link created",
      successMessage: "The old event and kiosk links no longer point to this expo. Replace printed QR codes before show day.",
    });
    if (result.ok && result.data.publicUrl) await copyTextToClipboard(result.data.publicUrl);
  };

  const regenerateListingLink = async (listing) => {
    const result = await runAction({
      key: `expo-regenerate-listing-${listing.id}`,
      action: () => expo.regenerateListingLink(listing.id),
      successTitle: "New animal QR link created",
      successMessage: "The previous public animal link is no longer valid. Reprint that cage card or QR label.",
    });
    if (result.ok && result.data.publicUrl) await copyTextToClipboard(result.data.publicUrl);
  };

  const markDepositPaid = async (hold) => {
    await runAction({
      key: `expo-deposit-${hold.id}`,
      action: async () => {
        await expo.updateHold(hold.id, { payment_status: "Paid" });
        await expo.updateListing(hold.listing_id, { status: "Deposit received" }, true);
        if (hold.lead_id) await expo.updateLead(hold.lead_id, { status: "Deposit received" });
      },
      successTitle: "Deposit marked paid",
      successMessage: "The hold, lead, and public animal status were updated.",
    });
  };

  const scrollToLeadStage = (status) => {
    document.getElementById(leadColumnId(status))?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  const exportLeadsCsv = () => {
    const headers = ["Created", "Animal", "Listing code", "Name", "Email", "Phone", "Preferred contact", "Interest", "Timeframe", "Hold requested", "Status", "Message"];
    const rows = activeLeads.map((lead) => {
      const listing = activeListings.find((item) => item.id === lead.listing_id);
      return [
        lead.created_at,
        listing?.display_name || "Event inquiry",
        listing?.listing_code || "",
        lead.name || "",
        lead.email || "",
        lead.phone || "",
        lead.preferred_contact || "",
        lead.interest_level || "",
        lead.timeframe || "",
        lead.hold_requested ? "Yes" : "No",
        lead.status || "",
        lead.message || "",
      ];
    });
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeEvent.slug}-expo-leads.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const duplicateEvent = async () => {
    const result = await runAction({
      key: `expo-duplicate-${activeEvent.id}`,
      action: () => expo.createEvent({
        ...EVENT_FORM_DEFAULTS,
        name: `${activeEvent.name} Copy`,
        mode: activeEvent.mode,
        status: "Draft",
        venue: activeEvent.venue,
        city: activeEvent.city,
        region: activeEvent.region,
        booth_number: currentVendor?.booth_number || activeEvent.booth_number,
        public_hours: activeEvent.public_hours,
        description: activeEvent.description,
        business_name: currentVendor?.display_name || profile?.display_name || "Event organizer",
        vendor_type: currentVendor?.vendor_type || "Breeder",
        vendor_bio: currentVendor?.bio || "",
        contact_email: activeEvent.contact_email || expo.user?.email || "",
        contact_phone: activeEvent.contact_phone,
        website_url: activeEvent.website_url,
        social_handle: activeEvent.social_handle,
        logo_url: activeEvent.logo_url,
        banner_url: activeEvent.banner_url,
        public_expires_at: "",
        is_public: false,
        show_prices: activeEvent.show_prices,
        allow_interest: activeEvent.allow_interest,
        allow_hold_requests: activeEvent.allow_hold_requests,
        kiosk_enabled: activeEvent.kiosk_enabled,
        featured_message: activeEvent.public_settings?.featuredMessage || "",
      }),
      successTitle: "Event duplicated",
      successMessage: "A private draft was created with the event setup. Add the new dates and choose which animals will attend.",
    });
    if (result.ok) {
      setActiveEventId(result.data.event.id);
      setActiveTab("settings");
    }
  };

  const archiveEvent = async () => {
    await runAction({
      key: `expo-archive-${activeEvent.id}`,
      action: () => expo.updateEvent(activeEvent.id, { status: "Archived", is_public: false }),
      successTitle: "Expo archived",
      successMessage: "The event was removed from public discovery while its records remain available to you.",
    });
  };

  const downloadCareQr = async (listing) => {
    const url = `${buildExpoListingUrl(activeEvent.slug, listing.listing_token)}?view=care`;
    const qr = await createExpoQr(url, { width: 420, margin: 2, errorCorrectionLevel: "H" });
    downloadDataUrl(qr, `${listing.listing_code}-care-guide-qr.png`);
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    const payload = {
      name: settingsForm.name,
      mode: settingsForm.mode,
      status: settingsForm.status,
      venue: settingsForm.venue,
      city: settingsForm.city,
      region: settingsForm.region,
      booth_number: settingsForm.booth_number,
      starts_at: settingsForm.starts_at || null,
      ends_at: settingsForm.ends_at || null,
      public_hours: settingsForm.public_hours,
      description: settingsForm.description,
      contact_email: settingsForm.contact_email,
      contact_phone: settingsForm.contact_phone,
      website_url: settingsForm.website_url,
      social_handle: settingsForm.social_handle,
      logo_url: settingsForm.logo_url,
      banner_url: settingsForm.banner_url,
      public_expires_at: settingsForm.public_expires_at || null,
      is_public: settingsForm.is_public,
      publish_inventory_at: settingsForm.publish_inventory_at || null,
      show_prices: settingsForm.show_prices,
      allow_interest: settingsForm.allow_interest,
      allow_hold_requests: settingsForm.allow_hold_requests,
      kiosk_enabled: settingsForm.kiosk_enabled,
      kiosk_pin_required: Boolean(settingsForm.kiosk_pin) || activeEvent.kiosk_pin_required,
      kiosk_pin: settingsForm.kiosk_pin,
      public_settings: {
        ...(activeEvent.public_settings || {}),
        featuredMessage: settingsForm.featured_message,
        showVendorContacts: settingsForm.show_vendor_contacts,
      },
    };

    await runAction({
      key: `expo-save-settings-${activeEvent.id}`,
      action: () => expo.updateEvent(activeEvent.id, payload),
      successTitle: "Expo settings saved",
      successMessage: "The public catalog, publishing controls, kiosk, and event details were updated.",
    });
  };

  const togglePrintListing = (listingId) => {
    setPrintListingIds((current) => current.includes(listingId)
      ? current.filter((id) => id !== listingId)
      : [...current, listingId]);
  };

  const selectedPrintListings = activeListings.filter((listing) => !printListingIds.length || printListingIds.includes(listing.id));

  const printExpo = () => {
    document.body.dataset.expoPrintMode = printMode;
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => delete document.body.dataset.expoPrintMode, 250);
    }, 100);
  };

  if (expo.loading) {
    return <div className="page-shell expo-command-page"><EmptyState icon={<Icon name="scan" size={30} />} title="Opening Expo Command Center" description="Loading events, exhibitors, planned animals, leads, holds, and analytics." /></div>;
  }

  if (expo.error) {
    return <div className="page-shell expo-command-page"><EmptyState icon={<Icon name="alert" size={30} />} title="Expo Mode needs its database foundation" description={`${expo.error.message} Run PETPASSPORT_EXPO_COMMAND_CENTER_V1.sql in Supabase, then refresh.`} action={<Button onClick={expo.refresh}>Try again</Button>} /></div>;
  }

  if (expo.events.length > 0 && !activeEvent) {
    return (
      <div className="page-shell expo-command-page">
        <EmptyState
          icon={<Icon name="scan" size={30} />}
          title="Opening your expo"
          description="AnyPetOS is connecting the newly created event to its command center."
        />
      </div>
    );
  }

  return (
    <div className="page-shell expo-command-page">
      <PageHeader
        eyebrow="Pre-show discovery + live event operations"
        title="Expo Command Center"
        description="Publish what you are bringing before the event, help visitors plan their booth route, run kiosk and QR displays, manage interest and holds, then complete the Passport transfer."
        icon={<Icon name="scan" size={22} />}
        actions={(
          <div className="expo-header-actions">
            <Button variant="outline" onClick={() => setJoinModalOpen(true)} leftIcon={<Icon name="users" size={16} />}>Join an expo</Button>
            <Button onClick={openCreateEvent} leftIcon={<Icon name="plus" size={16} />}>Create event</Button>
          </div>
        )}
      />

      {!expo.events.length ? (
        <section className="expo-empty-launch">
          <div className="expo-empty-orbit"><Icon name="scan" size={48} /></div>
          <p>One event can connect organizers, breeders, rescues, educators, retailers, visitors, public inventory, booth lookup codes, leads, holds, printing, and transfer.</p>
          <h2>Build the public “what’s coming” page before the doors open.</h2>
          <div>
            <Button onClick={openCreateEvent}>Create your first event</Button>
            <Button variant="outline" onClick={() => setJoinModalOpen(true)}>Join an organizer’s expo</Button>
          </div>
        </section>
      ) : (
        <>
          <section className="expo-event-switcher">
            <div>
              <label>Active event</label>
              <Select value={resolvedEventId || ""} onChange={(event) => setActiveEventId(Number(event.target.value))}>
                {expo.events.map((event) => <option key={event.id} value={event.id}>{event.name} • {event.status}</option>)}
              </Select>
            </div>
            {activeEvent && (
              <div className="expo-event-switcher-copy">
                <Badge variant={activeEvent.status === "Live" ? "success" : activeEvent.status === "Published" ? "primary" : "neutral"}>{activeEvent.status}</Badge>
                <span>{formatExpoDate(activeEvent.starts_at)}</span>
                <span>{[activeEvent.venue, activeEvent.city].filter(Boolean).join(" • ") || "Location not set"}</span>
                <span>{isOrganizer ? "Organizer" : currentVendor?.status === "approved" ? "Approved exhibitor" : currentVendor?.status || "Member"}</span>
              </div>
            )}
            <div className="expo-event-switcher-actions">
              <Button variant="outline" size="sm" onClick={() => window.open(buildExpoEventUrl(activeEvent.slug), "_blank", "noopener,noreferrer")} leftIcon={<Icon name="share" size={15} />}>Public catalog</Button>
              {activeEvent.kiosk_enabled && <Button variant="outline" size="sm" onClick={() => window.open(buildExpoKioskUrl(activeEvent.slug), "_blank", "noopener,noreferrer")} leftIcon={<Icon name="scan" size={15} />}>Kiosk</Button>}
            </div>
          </section>

          <nav className="expo-command-tabs" aria-label="Expo command center sections">
            {TABS.map((tab) => (
              <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
                <Icon name={tab.icon} size={17} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {activeTab === "overview" && (
            <section className="expo-tab-panel">
              <div className="expo-stat-grid">
                <div><Icon name="paw" size={19} /><strong>{stats.animals}</strong><span>Planned animals</span></div>
                <div><Icon name="check" size={19} /><strong>{stats.available}</strong><span>Available</span></div>
                <div><Icon name="scan" size={19} /><strong>{stats.scans}</strong><span>QR/catalog views</span></div>
                <div><Icon name="users" size={19} /><strong>{stats.leads}</strong><span>Visitor leads</span></div>
                <div><Icon name="clock" size={19} /><strong>{stats.holds}</strong><span>Active holds</span></div>
                <div><Icon name="share" size={19} /><strong>{stats.completed}</strong><span>Sold/adopted</span></div>
              </div>

              <div className="expo-overview-grid">
                <Card className="expo-public-launch-card">
                  <CardHeader icon={<Icon name="sparkles" size={18} />} title="Community Expo Discovery" description="The public pre-show feed lets visitors follow the expo and see exactly what AnyPetOS exhibitors plan to bring." />
                  <div className="expo-public-link-box"><span>Public event catalog</span><code>{buildExpoEventUrl(activeEvent.slug)}</code></div>
                  <div className="expo-action-row">
                    <Button onClick={() => window.open(buildExpoEventUrl(activeEvent.slug), "_blank", "noopener,noreferrer")}>Preview discovery page</Button>
                    <Button variant="outline" onClick={() => copyTextToClipboard(buildExpoEventUrl(activeEvent.slug))}>Copy event link</Button>
                    {isOrganizer && <Button variant="outline" onClick={regenerateEventLink}>Regenerate link</Button>}
                    {isOrganizer && activeEvent.is_public && <Button variant="outline" onClick={() => expo.updateEvent(activeEvent.id, { is_public: false })}>Revoke public access</Button>}
                  </div>
                  <div className="expo-feature-checklist">
                    <span><Icon name="check" size={15} />Visitors can follow the event</span>
                    <span><Icon name="check" size={15} />Browse planned animals and listed prices</span>
                    <span><Icon name="check" size={15} />Filter by species, booth, vendor, price, and status</span>
                    <span><Icon name="check" size={15} />Show a listing lookup code at the booth</span>
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Icon name="activity" size={18} />} title="Public update log" description="Post booth changes, inventory additions, arrival notes, sell-outs, or event-day announcements." />
                  <form className="expo-update-form" onSubmit={submitUpdate}>
                    <Input required placeholder="Update title" value={updateForm.title} onChange={(event) => setUpdateForm({ ...updateForm, title: event.target.value })} />
                    <Textarea required rows={3} placeholder="What should expo followers know?" value={updateForm.message} onChange={(event) => setUpdateForm({ ...updateForm, message: event.target.value })} />
                    <div><Select value={updateForm.kind} onChange={(event) => setUpdateForm({ ...updateForm, kind: event.target.value })}><option value="announcement">Announcement</option><option value="inventory">Inventory</option><option value="status">Availability</option><option value="booth">Booth update</option><option value="schedule">Schedule</option></Select><Button type="submit" loading={isPending("expo-post-update")}>Publish update</Button></div>
                  </form>
                </Card>
              </div>

              <div className="expo-overview-grid">
                <Card>
                  <CardHeader icon={<Icon name="history" size={18} />} title="Recent public changes" description="Inventory and status changes automatically become a public event log when enabled." />
                  {activeUpdates.length ? <div className="expo-private-update-list">{activeUpdates.slice(0, 10).map((update) => <article key={update.id}><span><Icon name={update.kind === "inventory" ? "paw" : "info"} size={16} /></span><div><strong>{update.title}</strong><p>{update.message}</p><small>{formatExpoDate(update.created_at, { hour: "numeric", minute: "2-digit" })}</small></div></article>)}</div> : <p className="helperText">No updates yet. Adding an animal automatically creates the first inventory update.</p>}
                </Card>

                <Card>
                  <CardHeader icon={<Icon name="chart" size={18} />} title="Event readiness" description="A quick pre-show checklist for the organizer or exhibitor." />
                  <div className="expo-readiness-list">
                    <span className={activeEvent.is_public ? "ready" : ""}><Icon name={activeEvent.is_public ? "check" : "clock"} size={16} />Public catalog enabled</span>
                    <span className={activeVendors.some((vendor) => vendor.status === "approved") ? "ready" : ""}><Icon name={activeVendors.some((vendor) => vendor.status === "approved") ? "check" : "clock"} size={16} />Approved exhibitors</span>
                    <span className={activeListings.length ? "ready" : ""}><Icon name={activeListings.length ? "check" : "clock"} size={16} />Planned inventory uploaded</span>
                    <span className={activeListings.every((listing) => listing.booth_location) && activeListings.length ? "ready" : ""}><Icon name={activeListings.every((listing) => listing.booth_location) && activeListings.length ? "check" : "clock"} size={16} />Booth lookup details assigned</span>
                    <span className={activeEvent.kiosk_enabled ? "ready" : ""}><Icon name={activeEvent.kiosk_enabled ? "check" : "clock"} size={16} />Kiosk mode ready</span>
                  </div>
                </Card>
              </div>

              <Card className="expo-after-event-card">
                <CardHeader icon={<Icon name="chart" size={18} />} title="After-event report and follow-up" description="See what drew attention, export visitors, archive the event, or duplicate the setup for the next show." />
                <div className="expo-after-event-stats">
                  <div><strong>{analytics.views || 0}</strong><span>Total views</span></div>
                  <div><strong>{analytics.followers || 0}</strong><span>Followers</span></div>
                  <div><strong>{analytics.favorites || 0}</strong><span>Animal saves</span></div>
                  <div><strong>{analytics.leads || 0}</strong><span>Leads</span></div>
                  <div><strong>{analytics.holds || 0}</strong><span>Holds</span></div>
                  <div><strong>{analytics.completed || 0}</strong><span>Completed</span></div>
                </div>
                <div className="expo-popular-grid">
                  <section><h4>Most viewed</h4>{(analytics.listing_views || []).slice(0, 5).map((item) => <p key={item.listing_id}><span>{item.display_name} • {item.listing_code}</span><b>{item.count}</b></p>)}</section>
                  <section><h4>Most saved</h4>{(analytics.listing_favorites || []).slice(0, 5).map((item) => <p key={item.listing_id}><span>{item.display_name} • {item.listing_code}</span><b>{item.count}</b></p>)}</section>
                </div>
                <div className="expo-action-row">
                  <Button variant="outline" onClick={exportLeadsCsv} disabled={!activeLeads.length} leftIcon={<Icon name="download" size={16} />}>Export leads CSV</Button>
                  {isOrganizer && <Button variant="outline" onClick={duplicateEvent}>Duplicate event</Button>}
                  {isOrganizer && <Button variant="outline" onClick={archiveEvent} disabled={activeEvent.status === "Archived"}>Archive event</Button>}
                </div>
              </Card>
            </section>
          )}

          {activeTab === "animals" && (
            <section className="expo-tab-panel">
              <div className="expo-panel-heading">
                <div><p>Pre-show inventory</p><h2>What you are bringing</h2><span>Publish exact animals, prices, booth location, care level, feeding details, genetics, and a large lookup code visitors can show at the booth.</span></div>
                <Button onClick={() => openListingModal()} disabled={!currentVendor || currentVendor.status !== "approved" || !pets.length} leftIcon={<Icon name="plus" size={16} />}>Add planned animal</Button>
              </div>

              {currentVendor?.status === "pending" && <div className="expo-inline-notice"><Icon name="clock" size={18} /><span>Your exhibitor request is pending organizer approval. Inventory publishing unlocks after approval.</span></div>}
              {!pets.length && <div className="expo-inline-notice"><Icon name="paw" size={18} /><span>Add animals to your AnyPetOS collection before publishing expo inventory.</span></div>}

              {activeListings.length ? (
                <div className="expo-manager-animal-grid">
                  {activeListings.map((listing) => {
                    const ownedByCurrentUser = listing.owner_id === expo.user?.id;
                    return (
                      <Card key={listing.id} className="expo-manager-animal-card" padding="none">
                        <div className="expo-manager-photo"><ExpoAnimalThumb listing={listing} />{listing.featured && <span>Featured</span>}</div>
                        <div className="expo-manager-copy">
                          <div className="expo-manager-heading"><div><p>{listing.vendor_name || activeVendors.find((vendor) => vendor.id === listing.vendor_id)?.display_name}</p><h3>{listing.display_name}</h3></div><Badge variant={expoAvailabilityVariant(listing.status)}>{listing.status}</Badge></div>
                          <p>{[listing.species, listing.morph, listing.sex].filter(Boolean).join(" • ")}</p>
                          <div className="expo-manager-metrics"><span><b>{formatExpoMoney(listing.price, listing.currency, listing.price_label || "Ask")}</b>Price</span><span><b>{listing.booth_location || "Unset"}</b>Booth</span><span><b>{listing.listing_code}</b>Lookup code</span><span><b>{listing.care_level}</b>Care</span></div>
                          <div className="expo-manager-actions">
                            <Select value={listing.status} onChange={(event) => changeListingStatus(listing, event.target.value)} disabled={!ownedByCurrentUser && !isOrganizer}>{EXPO_LISTING_STATUSES.map((status) => <option key={status}>{status}</option>)}</Select>
                            {ownedByCurrentUser && <Button size="sm" variant="outline" onClick={() => openListingModal(listing)}>Edit</Button>}
                            <Button size="sm" variant="outline" onClick={() => window.open(buildExpoListingUrl(activeEvent.slug, listing.listing_token), "_blank", "noopener,noreferrer")}>Preview</Button>
                            <Button size="sm" variant="outline" onClick={() => copyTextToClipboard(buildExpoListingUrl(activeEvent.slug, listing.listing_token))}>Copy link</Button>
                            {ownedByCurrentUser && <Button size="sm" variant="outline" onClick={() => regenerateListingLink(listing)}>New QR link</Button>}
                            {ownedByCurrentUser && <Button size="sm" variant="outline" onClick={() => expo.updateListing(listing.id, { show_in_catalog: !listing.show_in_catalog }, false)}>{listing.show_in_catalog ? "Hide" : "Publish"}</Button>}
                            {["Sold", "Adopted"].includes(listing.status) && ownedByCurrentUser && <Button size="sm" onClick={() => startTransfer(listing)}>Transfer Passport</Button>}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState icon={<Icon name="paw" size={28} />} title="No planned animals yet" description="Add animals before the event so visitors can budget, save favorites, plan their booth route, and arrive with the exact lookup code." action={<Button onClick={() => openListingModal()} disabled={!currentVendor || currentVendor.status !== "approved"}>Add the first animal</Button>} />
              )}
            </section>
          )}

          {activeTab === "exhibitors" && (
            <section className="expo-tab-panel">
              <div className="expo-panel-heading"><div><p>Multi-exhibitor event</p><h2>Breeders, rescues, educators, and retailers</h2><span>Approved exhibitors can publish their own planned animals under the same public event discovery page.</span></div><Button variant="outline" onClick={() => copyTextToClipboard(buildExpoEventUrl(activeEvent.slug))}>Copy public/join link</Button></div>
              <div className="expo-vendor-manager-grid">
                {activeVendors.map((vendor) => (
                  <Card key={vendor.id} className="expo-vendor-manager-card">
                    <div className="expo-vendor-manager-head"><div className="expo-vendor-avatar">{initials(vendor.display_name)}</div><div><Badge variant={vendor.status === "approved" ? "success" : vendor.status === "pending" ? "warning" : "neutral"}>{vendor.status}</Badge><h3>{vendor.display_name}</h3><p>{vendor.vendor_type} {vendor.booth_number ? `• Booth ${vendor.booth_number}` : ""}</p></div></div>
                    <p>{vendor.bio || "No exhibitor bio yet."}</p>
                    <div className="expo-vendor-counts"><span>{activeListings.filter((listing) => listing.vendor_id === vendor.id).length} listings</span><span>{activeLeads.filter((lead) => lead.vendor_id === vendor.id).length} leads</span></div>
                    {isOrganizer && vendor.user_id !== expo.user?.id && <div className="expo-action-row"><Button size="sm" onClick={() => approveVendor(vendor, "approved")} disabled={vendor.status === "approved"}>Approve</Button><Button size="sm" variant="outline" onClick={() => approveVendor(vendor, "declined")}>Decline</Button></div>}
                  </Card>
                ))}
              </div>
              <Card className="expo-organizer-explainer">
                <CardHeader icon={<Icon name="users" size={18} />} title="How exhibitors join" description="Share the public expo link. In Expo Mode, the exhibitor chooses Join an expo, pastes the link or slug, submits their booth profile, then waits for organizer approval." />
                <div className="expo-feature-checklist"><span><Icon name="check" size={15} />Each approved exhibitor publishes only their own AnyPetOS animals</span><span><Icon name="check" size={15} />The organizer sees everyone’s inventory and leads</span><span><Icon name="check" size={15} />Visitors see one searchable event catalog grouped by exhibitor and booth</span><span><Icon name="check" size={15} />Public updates show additions and status changes before and during the event</span></div>
              </Card>
            </section>
          )}

          {activeTab === "leads" && (
            <section className="expo-tab-panel">
              <div className="expo-panel-heading">
                <div>
                  <p>Visitor pipeline</p>
                  <h2>Interest, holds, deposits, and completion</h2>
                  <span>Move visitors from public interest to booth conversation, temporary hold, deposit, and completed Passport transfer.</span>
                </div>
                <Badge variant="primary">{pluralize(activeLeads.length, "lead")}</Badge>
              </div>

              <nav className="expo-lead-stage-nav" aria-label="Lead pipeline stages">
                {EXPO_LEAD_STATUSES.map((status) => {
                  const count = activeLeads.filter((lead) => lead.status === status).length;
                  return (
                    <button key={status} type="button" onClick={() => scrollToLeadStage(status)}>
                      <span>{status}</span>
                      <b>{count}</b>
                    </button>
                  );
                })}
              </nav>

              <div className="expo-lead-board" aria-label="Visitor lead pipeline">
                {EXPO_LEAD_STATUSES.map((status) => {
                  const statusLeads = activeLeads.filter((lead) => lead.status === status);
                  return (
                    <section key={status} id={leadColumnId(status)} className={`expo-lead-column ${statusLeads.length ? "has-leads" : "is-empty"}`}>
                      <header><span>{status}</span><b>{statusLeads.length}</b></header>
                      <div>
                        {statusLeads.map((lead) => {
                          const listing = activeListings.find((item) => item.id === lead.listing_id);
                          const hasActiveHold = activeHolds.some((hold) => hold.lead_id === lead.id && hold.status === "active");
                          return (
                            <ExpoLeadCard
                              key={lead.id}
                              lead={lead}
                              listing={listing}
                              hasActiveHold={hasActiveHold}
                              onOpen={() => setLeadModal({ ...lead, listing })}
                              onCreateHold={() => setHoldModal({
                                lead,
                                form: {
                                  hours: "2",
                                  deposit_amount: listing?.deposit_amount ?? "",
                                  payment_status: "Not paid",
                                  notes: "",
                                },
                              })}
                              onStatusChange={(nextStatus) => updateLeadStatus(lead, nextStatus)}
                            />
                          );
                        })}
                        {!statusLeads.length && <p className="expo-empty-column">No leads in this stage</p>}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="expo-panel-heading expo-hold-heading"><div><p>Reservations</p><h2>Active and completed holds</h2></div></div>
              {activeHolds.length ? <div className="expo-hold-grid">{activeHolds.map((hold) => { const listing = activeListings.find((item) => item.id === hold.listing_id); const expired = hold.status === "active" && hold.expires_at && new Date(hold.expires_at) < new Date(); return <Card key={hold.id} className={expired ? "expo-hold-card is-expired" : "expo-hold-card"}><div><Badge variant={hold.status === "active" && !expired ? "warning" : hold.status === "completed" ? "success" : "neutral"}>{expired ? "Expired" : hold.status}</Badge><h3>{listing?.display_name || "Animal hold"}</h3><p>{hold.visitor_name || "Expo visitor"}</p></div><dl><div><dt>Expires</dt><dd>{formatExpoDate(hold.expires_at, { hour: "numeric", minute: "2-digit" })}</dd></div><div><dt>Deposit</dt><dd>{formatExpoMoney(hold.deposit_amount, listing?.currency, "Not set")}</dd></div><div><dt>Payment</dt><dd>{hold.payment_status}</dd></div></dl>{hold.status === "active" && <div className="expo-action-row"><Button size="sm" variant="outline" onClick={() => expo.releaseHold(hold)}>Release</Button>{hold.payment_status !== "Paid" && <Button size="sm" variant="outline" onClick={() => markDepositPaid(hold)}>Deposit paid</Button>}<Button size="sm" onClick={() => expo.completeHold(hold, activeEvent.mode === "rescue" ? "Adopted" : "Sold")}>Complete</Button></div>}</Card>; })}</div> : <p className="helperText">No holds yet. Create one from a visitor lead.</p>}
            </section>
          )}

          {activeTab === "print" && (
            <section className="expo-tab-panel">
              <div className="expo-print-layout">
                <Card>
                  <CardHeader icon={<Icon name="scan" size={18} />} title="Event QR + kiosk" description="Place the event QR at the entrance or booth so visitors can open the full catalog. Kiosk mode is touch-friendly and resets after inactivity." />
                  {qrLoading && (
                    <div className="expo-qr-loading" role="status">
                      <Icon name="loader" size={18} />
                      <span>Preparing print-quality QR codes...</span>
                    </div>
                  )}
                  {eventQr && <img className="expo-event-qr" src={eventQr} alt="Event QR code" />}
                  <strong>{activeEvent.name}</strong>
                  <code className="expo-url-code">{buildExpoEventUrl(activeEvent.slug)}</code>
                  <p className="helperText">{analytics.views || 0} recorded event and animal views</p>
                  <div className="expo-action-row"><Button onClick={() => downloadDataUrl(eventQr, `${activeEvent.slug}-event-qr.png`)}>Download QR</Button><Button variant="outline" onClick={() => copyTextToClipboard(buildExpoEventUrl(activeEvent.slug))}>Copy link</Button><Button variant="outline" onClick={() => window.open(buildExpoKioskUrl(activeEvent.slug), "_blank", "noopener,noreferrer")}>Open kiosk</Button>{isOrganizer && <Button variant="outline" onClick={regenerateEventLink}>Regenerate</Button>}</div>
                </Card>

                <Card>
                  <CardHeader icon={<Icon name="file" size={18} />} title="Print Center" description="Generate cage cards, compact QR labels, an event catalog, care cards, or a staff checklist from current inventory." />
                  <Field label="Print format"><Select value={printMode} onChange={(event) => setPrintMode(event.target.value)}><option value="cage-cards">Cage cards</option><option value="qr-labels">Small QR labels</option><option value="catalog">Event catalog</option><option value="care-cards">Care cards</option><option value="staff-checklist">Staff checklist</option></Select></Field>
                  <p className="helperText">No animals selected means print all visible event animals.</p>
                  <div className="expo-print-select-list">{activeListings.map((listing) => <label key={listing.id}><input type="checkbox" checked={printListingIds.includes(listing.id)} onChange={() => togglePrintListing(listing.id)} /><span>{listing.display_name}</span><small>{listing.listing_code}</small></label>)}</div>
                  <Button fullWidth onClick={printExpo} disabled={!activeListings.length} leftIcon={<Icon name="file" size={16} />}>Print / Save as PDF</Button>
                </Card>
              </div>

              <div className="expo-qr-label-manager">
                {activeListings.map((listing) => <Card key={listing.id} className="expo-qr-item"><ExpoAnimalThumb listing={listing} /><div><h3>{listing.display_name}</h3><p>{listing.listing_code} • {listing.booth_location ? `Booth ${listing.booth_location}` : "Booth unset"}</p><small>{(analytics.listing_views || []).find((item) => item.listing_id === listing.id)?.count || 0} views • {(analytics.listing_favorites || []).find((item) => item.listing_id === listing.id)?.count || 0} saves</small><div className="expo-action-row"><Button size="sm" variant="outline" onClick={() => downloadDataUrl(listingQrs[listing.id], `${listing.listing_code}-qr.png`)} disabled={!listingQrs[listing.id]}>Animal QR</Button><Button size="sm" variant="outline" onClick={() => downloadCareQr(listing)}>Care QR</Button><Button size="sm" variant="outline" onClick={() => copyTextToClipboard(buildExpoListingUrl(activeEvent.slug, listing.listing_token))}>Copy</Button><Button size="sm" variant="outline" onClick={() => window.open(buildExpoListingUrl(activeEvent.slug, listing.listing_token), "_blank", "noopener,noreferrer")}>Preview</Button>{listing.owner_id === expo.user?.id && <Button size="sm" variant="outline" onClick={() => regenerateListingLink(listing)}>Regenerate</Button>}</div></div>{listingQrs[listing.id] && <img src={listingQrs[listing.id]} alt={`${listing.display_name} QR code`} />}</Card>)}
              </div>

              <div className="expo-panel-heading"><div><p>Business QR</p><h2>Exhibitor booth discovery</h2><span>Each QR opens the public event catalog already filtered to that exhibitor.</span></div></div>
              <div className="expo-qr-label-manager">
                {activeVendors.filter((vendor) => vendor.status === "approved").map((vendor) => <Card key={vendor.id} className="expo-qr-item"><div className="expo-vendor-avatar">{initials(vendor.display_name)}</div><div><h3>{vendor.display_name}</h3><p>{vendor.vendor_type} • {vendor.booth_number ? `Booth ${vendor.booth_number}` : "Booth unset"}</p><Button size="sm" variant="outline" onClick={() => downloadDataUrl(vendorQrs[vendor.id], `${activeEvent.slug}-${vendor.display_name}-business-qr.png`)} disabled={!vendorQrs[vendor.id]}>Download business QR</Button></div>{vendorQrs[vendor.id] && <img src={vendorQrs[vendor.id]} alt={`${vendor.display_name} business QR code`} />}</Card>)}
              </div>
            </section>
          )}

          {activeTab === "settings" && settingsForm && (
            <section className="expo-tab-panel">
              <form className="expo-settings-form" onSubmit={saveSettings}>
                <Card>
                  <CardHeader icon={<Icon name="calendar" size={18} />} title="Event details" description="Public name, event mode, venue, city, dates, hours, and event description." />
                  <div className="expo-form-grid">
                    <Field label="Event name"><Input required value={settingsForm.name} onChange={(event) => setSettingsForm({ ...settingsForm, name: event.target.value })} /></Field>
                    <Field label="Mode"><Select value={settingsForm.mode} onChange={(event) => setSettingsForm({ ...settingsForm, mode: event.target.value })}>{EXPO_EVENT_MODES.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}</Select></Field>
                    <Field label="Status"><Select value={settingsForm.status} onChange={(event) => setSettingsForm({ ...settingsForm, status: event.target.value })}>{EXPO_EVENT_STATUSES.map((status) => <option key={status}>{status}</option>)}</Select></Field>
                    <Field label="Venue"><Input value={settingsForm.venue} onChange={(event) => setSettingsForm({ ...settingsForm, venue: event.target.value })} /></Field>
                    <Field label="City"><Input value={settingsForm.city} onChange={(event) => setSettingsForm({ ...settingsForm, city: event.target.value })} /></Field>
                    <Field label="State / region"><Input value={settingsForm.region} onChange={(event) => setSettingsForm({ ...settingsForm, region: event.target.value })} /></Field>
                    <Field label="Starts"><Input type="datetime-local" value={settingsForm.starts_at} onChange={(event) => setSettingsForm({ ...settingsForm, starts_at: event.target.value })} /></Field>
                    <Field label="Ends"><Input type="datetime-local" value={settingsForm.ends_at} onChange={(event) => setSettingsForm({ ...settingsForm, ends_at: event.target.value })} /></Field>
                    <Field label="Public hours"><Input value={settingsForm.public_hours} onChange={(event) => setSettingsForm({ ...settingsForm, public_hours: event.target.value })} placeholder="Saturday 10 AM to 5 PM" /></Field>
                    <Field label="Organizer booth"><Input value={settingsForm.booth_number} onChange={(event) => setSettingsForm({ ...settingsForm, booth_number: event.target.value })} /></Field>
                    <Field label="Description" full><Textarea rows={4} value={settingsForm.description} onChange={(event) => setSettingsForm({ ...settingsForm, description: event.target.value })} /></Field>
                    <Field label="Featured public message" full><Input value={settingsForm.featured_message} onChange={(event) => setSettingsForm({ ...settingsForm, featured_message: event.target.value })} placeholder="Inventory preview is live. Save favorites before event day." /></Field>
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Icon name="share" size={18} />} title="Publishing and visitor controls" description="Choose when planned inventory becomes public and what visitors may do." />
                  <div className="expo-check-grid">
                    <CheckField label="Public event" description="Show this expo in Community Expo Discovery." checked={settingsForm.is_public} onChange={(value) => setSettingsForm({ ...settingsForm, is_public: value })} />
                    <CheckField label="Show prices" description="Display listed price, fee, or custom price label." checked={settingsForm.show_prices} onChange={(value) => setSettingsForm({ ...settingsForm, show_prices: value })} />
                    <CheckField label="Allow interest forms" description="Visitors can send contact details and questions." checked={settingsForm.allow_interest} onChange={(value) => setSettingsForm({ ...settingsForm, allow_interest: value })} />
                    <CheckField label="Allow hold requests" description="Interest forms can include a temporary hold request." checked={settingsForm.allow_hold_requests} onChange={(value) => setSettingsForm({ ...settingsForm, allow_hold_requests: value })} />
                    <CheckField label="Kiosk enabled" description="Enable the full-screen public kiosk route." checked={settingsForm.kiosk_enabled} onChange={(value) => setSettingsForm({ ...settingsForm, kiosk_enabled: value })} />
                    <CheckField label="Show vendor contacts" description="Allow approved exhibitors to display contact information." checked={settingsForm.show_vendor_contacts} onChange={(value) => setSettingsForm({ ...settingsForm, show_vendor_contacts: value })} />
                  </div>
                  <div className="expo-form-grid expo-settings-extra">
                    <Field label="Publish inventory at" hint="Leave blank to publish immediately when the event is public."><Input type="datetime-local" value={settingsForm.publish_inventory_at} onChange={(event) => setSettingsForm({ ...settingsForm, publish_inventory_at: event.target.value })} /></Field>
                    <Field label="New kiosk exit PIN" hint="Leave blank to keep the current PIN."><Input type="password" inputMode="numeric" value={settingsForm.kiosk_pin} onChange={(event) => setSettingsForm({ ...settingsForm, kiosk_pin: event.target.value })} /></Field>
                  </div>
                </Card>

                <Card>
                  <CardHeader icon={<Icon name="store" size={18} />} title="Public contact information" description="Optional organizer contact details for the public catalog." />
                  <div className="expo-form-grid">
                    <Field label="Email"><Input type="email" value={settingsForm.contact_email} onChange={(event) => setSettingsForm({ ...settingsForm, contact_email: event.target.value })} /></Field>
                    <Field label="Phone"><Input value={settingsForm.contact_phone} onChange={(event) => setSettingsForm({ ...settingsForm, contact_phone: event.target.value })} /></Field>
                    <Field label="Website"><Input value={settingsForm.website_url} onChange={(event) => setSettingsForm({ ...settingsForm, website_url: event.target.value })} /></Field>
                    <Field label="Social handle"><Input value={settingsForm.social_handle} onChange={(event) => setSettingsForm({ ...settingsForm, social_handle: event.target.value })} /></Field>
                    <Field label="Logo image URL"><Input value={settingsForm.logo_url} onChange={(event) => setSettingsForm({ ...settingsForm, logo_url: event.target.value })} placeholder="https://..." /></Field>
                    <Field label="Banner image URL"><Input value={settingsForm.banner_url} onChange={(event) => setSettingsForm({ ...settingsForm, banner_url: event.target.value })} placeholder="https://..." /></Field>
                    <Field label="Public link expires"><Input type="datetime-local" value={settingsForm.public_expires_at} onChange={(event) => setSettingsForm({ ...settingsForm, public_expires_at: event.target.value })} /></Field>
                  </div>
                </Card>

                <div className="expo-sticky-save"><Button type="submit" loading={isPending(`expo-save-settings-${activeEvent.id}`)}>Save expo settings</Button></div>
              </form>
            </section>
          )}
        </>
      )}

      <Modal open={eventModalOpen} onClose={() => setEventModalOpen(false)} title="Create an Expo Command Center" description="Start the public discovery page, organizer profile, vendor system, inventory, kiosk, print center, leads, holds, and analytics." size="xl" footer={<><Button variant="outline" onClick={() => setEventModalOpen(false)}>Cancel</Button><Button type="submit" form="expo-event-form" loading={isPending("expo-create-event")}>Create event</Button></>}>
        <form id="expo-event-form" className="expo-form-grid" onSubmit={submitEvent}>
          <Field label="Event name"><Input required value={eventForm.name} onChange={(event) => setEventForm({ ...eventForm, name: event.target.value })} placeholder="Mid-Atlantic Reptile Expo" /></Field>
          <Field label="Event mode"><Select value={eventForm.mode} onChange={(event) => setEventForm({ ...eventForm, mode: event.target.value })}>{EXPO_EVENT_MODES.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}</Select></Field>
          <Field label="Venue"><Input value={eventForm.venue} onChange={(event) => setEventForm({ ...eventForm, venue: event.target.value })} /></Field>
          <Field label="City"><Input value={eventForm.city} onChange={(event) => setEventForm({ ...eventForm, city: event.target.value })} /></Field>
          <Field label="State / region"><Input value={eventForm.region} onChange={(event) => setEventForm({ ...eventForm, region: event.target.value })} /></Field>
          <Field label="Your booth number"><Input value={eventForm.booth_number} onChange={(event) => setEventForm({ ...eventForm, booth_number: event.target.value })} /></Field>
          <Field label="Starts"><Input type="datetime-local" value={eventForm.starts_at} onChange={(event) => setEventForm({ ...eventForm, starts_at: event.target.value })} /></Field>
          <Field label="Ends"><Input type="datetime-local" value={eventForm.ends_at} onChange={(event) => setEventForm({ ...eventForm, ends_at: event.target.value })} /></Field>
          <Field label="Public hours"><Input value={eventForm.public_hours} onChange={(event) => setEventForm({ ...eventForm, public_hours: event.target.value })} placeholder="Saturday 10 AM to 5 PM" /></Field>
          <Field label="Business / organization"><Input required value={eventForm.business_name} onChange={(event) => setEventForm({ ...eventForm, business_name: event.target.value })} /></Field>
          <Field label="Organization type"><Select value={eventForm.vendor_type} onChange={(event) => setEventForm({ ...eventForm, vendor_type: event.target.value })}>{EXPO_VENDOR_TYPES.map((type) => <option key={type}>{type}</option>)}</Select></Field>
          <Field label="Contact email"><Input type="email" value={eventForm.contact_email} onChange={(event) => setEventForm({ ...eventForm, contact_email: event.target.value })} /></Field>
          <Field label="Logo image URL"><Input value={eventForm.logo_url} onChange={(event) => setEventForm({ ...eventForm, logo_url: event.target.value })} placeholder="Optional https://..." /></Field>
          <Field label="Banner image URL"><Input value={eventForm.banner_url} onChange={(event) => setEventForm({ ...eventForm, banner_url: event.target.value })} placeholder="Optional https://..." /></Field>
          <Field label="Public link expires"><Input type="datetime-local" value={eventForm.public_expires_at} onChange={(event) => setEventForm({ ...eventForm, public_expires_at: event.target.value })} /></Field>
          <Field label="Description" full><Textarea rows={4} value={eventForm.description} onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })} placeholder="Tell visitors what the expo is, who it is for, and what to expect." /></Field>
          <Field label="Featured message" full><Input value={eventForm.featured_message} onChange={(event) => setEventForm({ ...eventForm, featured_message: event.target.value })} placeholder="Pre-show inventory is live. Follow the event and save animals before show day." /></Field>
          <div className="expo-check-grid expo-form-full">
            <CheckField label="Publish in Community" checked={eventForm.is_public} onChange={(value) => setEventForm({ ...eventForm, is_public: value })} />
            <CheckField label="Show listed prices" checked={eventForm.show_prices} onChange={(value) => setEventForm({ ...eventForm, show_prices: value })} />
            <CheckField label="Allow visitor interest" checked={eventForm.allow_interest} onChange={(value) => setEventForm({ ...eventForm, allow_interest: value })} />
            <CheckField label="Allow hold requests" checked={eventForm.allow_hold_requests} onChange={(value) => setEventForm({ ...eventForm, allow_hold_requests: value })} />
            <CheckField label="Enable kiosk" checked={eventForm.kiosk_enabled} onChange={(value) => setEventForm({ ...eventForm, kiosk_enabled: value })} />
          </div>
          <Field label="Optional kiosk exit PIN" full><Input type="password" inputMode="numeric" value={eventForm.kiosk_pin} onChange={(event) => setEventForm({ ...eventForm, kiosk_pin: event.target.value })} /></Field>
        </form>
      </Modal>

      <Modal open={joinModalOpen} onClose={() => setJoinModalOpen(false)} title="Join a public expo as an exhibitor" description="Paste the event link or slug. The organizer will approve your exhibitor profile before you upload planned inventory." size="lg" footer={<><Button variant="outline" onClick={() => setJoinModalOpen(false)}>Cancel</Button><Button type="submit" form="expo-join-form" loading={isPending("expo-join-event")}>Send request</Button></>}>
        <form id="expo-join-form" className="expo-form-grid" onSubmit={submitJoinExpo}>
          <Field label="Expo link or slug" full><Input required value={vendorForm.expo_slug} onChange={(event) => setVendorForm({ ...vendorForm, expo_slug: event.target.value })} placeholder="https://.../expo/event-name-abc123" /></Field>
          <Field label="Display name"><Input required value={vendorForm.display_name} onChange={(event) => setVendorForm({ ...vendorForm, display_name: event.target.value })} /></Field>
          <Field label="Exhibitor type"><Select value={vendorForm.vendor_type} onChange={(event) => setVendorForm({ ...vendorForm, vendor_type: event.target.value })}>{EXPO_VENDOR_TYPES.map((type) => <option key={type}>{type}</option>)}</Select></Field>
          <Field label="Assigned booth, if known"><Input value={vendorForm.booth_number} onChange={(event) => setVendorForm({ ...vendorForm, booth_number: event.target.value })} /></Field>
          <Field label="Contact email"><Input type="email" value={vendorForm.contact_email} onChange={(event) => setVendorForm({ ...vendorForm, contact_email: event.target.value })} /></Field>
          <Field label="Public bio" full><Textarea rows={3} value={vendorForm.bio} onChange={(event) => setVendorForm({ ...vendorForm, bio: event.target.value })} /></Field>
          <CheckField label="Show my contact information publicly" checked={vendorForm.show_contact} onChange={(value) => setVendorForm({ ...vendorForm, show_contact: value })} />
        </form>
      </Modal>

      <Modal open={listingModalOpen} onClose={() => setListingModalOpen(false)} title={editingListing ? "Edit expo animal" : "Add planned expo animal"} description="This creates the public pre-show listing visitors can save and show at your booth." size="xl" footer={<><Button variant="outline" onClick={() => setListingModalOpen(false)}>Cancel</Button><Button type="submit" form="expo-listing-form" loading={isPending(editingListing ? `expo-edit-listing-${editingListing.id}` : "expo-create-listing")}>Save expo listing</Button></>}>
        <form id="expo-listing-form" className="expo-form-grid" onSubmit={submitListing}>
          {!editingListing && <Field label="AnyPetOS animal" full><Select value={listingForm.pet_id} onChange={(event) => chooseListingPet(event.target.value)}><option value="none" disabled>Choose an animal</option>{pets.map((pet) => <option key={pet.id} value={String(pet.cloudId || pet.id)}>{pet.name} • {pet.species || pet.animalGroup || "Animal"}</option>)}</Select></Field>}
          <Field label="Public display name"><Input required value={listingForm.display_name} onChange={(event) => setListingForm({ ...listingForm, display_name: event.target.value })} /></Field>
          <Field label="Species"><Input required value={listingForm.species} onChange={(event) => setListingForm({ ...listingForm, species: event.target.value })} /></Field>
          <Field label="Morph / breed / variety"><Input value={listingForm.morph} onChange={(event) => setListingForm({ ...listingForm, morph: event.target.value })} /></Field>
          <Field label="Sex"><Select value={listingForm.sex} onChange={(event) => setListingForm({ ...listingForm, sex: event.target.value })}><option>Unknown</option><option>Female</option><option>Male</option><option>Unsexed</option><option>Pair</option><option>Colony</option></Select></Field>
          <Field label="Birth / hatch date"><Input type="date" value={listingForm.hatch_birth_date} onChange={(event) => setListingForm({ ...listingForm, hatch_birth_date: event.target.value })} /></Field>
          <Field label="Availability"><Select value={listingForm.status} onChange={(event) => setListingForm({ ...listingForm, status: event.target.value })}>{EXPO_LISTING_STATUSES.map((status) => <option key={status}>{status}</option>)}</Select></Field>
          <Field label="Price / adoption fee"><Input type="number" min="0" step="0.01" value={listingForm.price} onChange={(event) => setListingForm({ ...listingForm, price: event.target.value })} /></Field>
          <Field label="Custom price label"><Input value={listingForm.price_label} onChange={(event) => setListingForm({ ...listingForm, price_label: event.target.value })} placeholder="Ask, Pair price, Adoption fee" /></Field>
          <Field label="Deposit"><Input type="number" min="0" step="0.01" value={listingForm.deposit_amount} onChange={(event) => setListingForm({ ...listingForm, deposit_amount: event.target.value })} /></Field>
          <Field label="Booth / cage location"><Input value={listingForm.booth_location} onChange={(event) => setListingForm({ ...listingForm, booth_location: event.target.value })} placeholder="B12 • Rack 2 • Tub 14" /></Field>
          <Field label="Care level"><Select value={listingForm.care_level} onChange={(event) => setListingForm({ ...listingForm, care_level: event.target.value })}>{EXPO_CARE_LEVELS.map((level) => <option key={level}>{level}</option>)}</Select></Field>
          <Field label="Feeding status"><Input value={listingForm.feeding_status} onChange={(event) => setListingForm({ ...listingForm, feeding_status: event.target.value })} placeholder="Eating frozen/thawed small rats" /></Field>
          <Field label="Last fed"><Input value={listingForm.last_fed_text} onChange={(event) => setListingForm({ ...listingForm, last_fed_text: event.target.value })} /></Field>
          <Field label="Weight"><Input value={listingForm.weight_text} onChange={(event) => setListingForm({ ...listingForm, weight_text: event.target.value })} placeholder="645 g" /></Field>
          <Field label="Public temperament" full><Textarea rows={2} value={listingForm.public_temperament} onChange={(event) => setListingForm({ ...listingForm, public_temperament: event.target.value })} /></Field>
          <Field label="Genetics / lineage" full><Textarea rows={2} value={listingForm.genetics} onChange={(event) => setListingForm({ ...listingForm, genetics: event.target.value })} /></Field>
          <Field label="Parent information" full><Textarea rows={2} value={listingForm.parent_information} onChange={(event) => setListingForm({ ...listingForm, parent_information: event.target.value })} /></Field>
          <Field label="Included supplies" full><Textarea rows={2} value={listingForm.included_supplies} onChange={(event) => setListingForm({ ...listingForm, included_supplies: event.target.value })} /></Field>
          <Field label="Pickup requirements" full><Textarea rows={2} value={listingForm.pickup_requirements} onChange={(event) => setListingForm({ ...listingForm, pickup_requirements: event.target.value })} /></Field>
          <Field label="Expo notes" full><Textarea rows={3} value={listingForm.expo_notes} onChange={(event) => setListingForm({ ...listingForm, expo_notes: event.target.value })} /></Field>
          <div className="expo-check-grid expo-form-full">
            <CheckField label="Show in public catalog" checked={listingForm.show_in_catalog} onChange={(value) => setListingForm({ ...listingForm, show_in_catalog: value })} />
            <CheckField label="Featured animal" checked={listingForm.featured} onChange={(value) => setListingForm({ ...listingForm, featured: value })} />
            <CheckField label="Negotiable" checked={listingForm.negotiable} onChange={(value) => setListingForm({ ...listingForm, negotiable: value })} />
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(leadModal)}
        onClose={() => setLeadModal(null)}
        title={leadModal?.name || "Visitor lead"}
        description={leadModal?.listing ? `${leadModal.listing.display_name} • ${leadModal.listing.listing_code}` : "Expo inquiry"}
        size="md"
        footer={<Button onClick={() => setLeadModal(null)}>Close</Button>}
      >
        {leadModal && (
          <div className="expo-lead-detail">
            {leadModal.listing && (
              <div className="expo-lead-detail-animal">
                <ExpoAnimalThumb listing={leadModal.listing} />
                <div>
                  <strong>{leadModal.listing.display_name}</strong>
                  <span>{leadModal.listing.listing_code} • Booth {leadModal.listing.booth_location || "TBD"}</span>
                </div>
              </div>
            )}

            <div className="expo-lead-quick-actions">
              {leadModal.email && <Button variant="outline" onClick={() => window.location.href = `mailto:${leadModal.email}`}>Email visitor</Button>}
              {leadModal.phone && <Button variant="outline" onClick={() => window.location.href = `tel:${leadModal.phone}`}>Call visitor</Button>}
              {leadModal.listing && !activeHolds.some((hold) => hold.lead_id === leadModal.id && hold.status === "active") && (
                <Button onClick={() => {
                  setHoldModal({
                    lead: leadModal,
                    form: {
                      hours: "2",
                      deposit_amount: leadModal.listing.deposit_amount ?? "",
                      payment_status: "Not paid",
                      notes: "",
                    },
                  });
                  setLeadModal(null);
                }}>Create hold</Button>
              )}
            </div>

            <label className="expo-lead-detail-stage">
              <span>Pipeline stage</span>
              <Select value={leadModal.status} onChange={(event) => {
                updateLeadStatus(leadModal, event.target.value);
                setLeadModal((current) => current ? { ...current, status: event.target.value } : current);
              }}>
                {EXPO_LEAD_STATUSES.map((status) => <option key={status}>{status}</option>)}
              </Select>
            </label>

            <dl>
              <div><dt>Email</dt><dd>{leadModal.email || "Not provided"}</dd></div>
              <div><dt>Phone</dt><dd>{leadModal.phone || "Not provided"}</dd></div>
              <div><dt>Preferred contact</dt><dd>{leadModal.preferred_contact || "Not specified"}</dd></div>
              <div><dt>Interest</dt><dd>{leadModal.interest_level || "Interested"}</dd></div>
              <div><dt>Timeframe</dt><dd>{leadModal.timeframe || "Not specified"}</dd></div>
              <div><dt>Hold requested</dt><dd>{leadModal.hold_requested ? "Yes" : "No"}</dd></div>
            </dl>
            <section><h4>Visitor message</h4><p>{leadModal.message || "No message."}</p></section>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(holdModal)} onClose={() => setHoldModal(null)} title="Create temporary hold" description={holdModal ? `${holdModal.lead.name || "Visitor"} • ${activeListings.find((item) => item.id === holdModal.lead.listing_id)?.display_name || "Animal"}` : ""} footer={<><Button variant="outline" onClick={() => setHoldModal(null)}>Cancel</Button><Button type="submit" form="expo-hold-form" loading={isPending(`expo-create-hold-${holdModal?.lead?.id}`)}>Create hold</Button></>}>
        {holdModal && <form id="expo-hold-form" className="expo-form-grid" onSubmit={createHold}><Field label="Hold length, hours"><Input type="number" min="1" value={holdModal.form.hours} onChange={(event) => setHoldModal({ ...holdModal, form: { ...holdModal.form, hours: event.target.value } })} /></Field><Field label="Deposit amount"><Input type="number" min="0" step="0.01" value={holdModal.form.deposit_amount} onChange={(event) => setHoldModal({ ...holdModal, form: { ...holdModal.form, deposit_amount: event.target.value } })} /></Field><Field label="Payment status"><Select value={holdModal.form.payment_status} onChange={(event) => setHoldModal({ ...holdModal, form: { ...holdModal.form, payment_status: event.target.value } })}><option>Not paid</option><option>Pending</option><option>Paid</option></Select></Field><Field label="Internal notes" full><Textarea rows={3} value={holdModal.form.notes} onChange={(event) => setHoldModal({ ...holdModal, form: { ...holdModal.form, notes: event.target.value } })} /></Field></form>}
      </Modal>

      <Modal
        open={Boolean(transferModal)}
        onClose={() => setTransferModal(null)}
        title="Private Passport transfer"
        description="Give this private QR or link only to the buyer/adopter who should receive ownership."
        size="md"
        footer={<><Button variant="outline" onClick={() => transferModal && copyTextToClipboard(transferModal.transferUrl)}>Copy link</Button><Button onClick={() => setTransferModal(null)}>Done</Button></>}
      >
        {transferModal && <div className="expo-transfer-card"><img src={transferModal.transferQr} alt="Private Passport transfer QR code" /><h3>{transferModal.listing.display_name}</h3><p>{transferModal.listing.listing_code}</p><input value={transferModal.transferUrl} readOnly onFocus={(event) => event.currentTarget.select()} /><small>This QR transfers ownership. Do not place it on a public cage card.</small></div>}
      </Modal>

      {activeEvent && (
        <section className={`expo-print-sheet print-${printMode}`} aria-hidden="true">
          <header><h1>{activeEvent.name}</h1><p>{[activeEvent.venue, activeEvent.city, activeEvent.region].filter(Boolean).join(" • ")} • {formatExpoDate(activeEvent.starts_at)}</p></header>
          {printMode === "staff-checklist" ? (
            <div className="expo-staff-print-list">{selectedPrintListings.map((listing) => <article key={listing.id}><span>□</span><div><strong>{listing.display_name}</strong><p>{listing.listing_code} • {listing.species} • {listing.status}</p></div><span>□ Packed</span><span>□ Display</span><span>□ Paperwork</span><span>□ Return check</span></article>)}</div>
          ) : (
            <div className="expo-print-grid">{selectedPrintListings.map((listing) => <article key={listing.id} className="expo-print-card">{printMode !== "catalog" && listingQrs[listing.id] && <img src={listingQrs[listing.id]} alt="" />}<div><small>{activeVendors.find((vendor) => vendor.id === listing.vendor_id)?.display_name || "AnyPetOS exhibitor"}</small><h2>{listing.display_name}</h2><p>{[listing.species, listing.morph, listing.sex].filter(Boolean).join(" • ")}</p>{printMode !== "qr-labels" && <><strong>{formatExpoMoney(listing.price, listing.currency, listing.price_label || "Ask")}</strong><span>{listing.status} • Booth {listing.booth_location || "TBD"}</span><em>{listing.feeding_status}</em></>}<b>{listing.listing_code}</b>{printMode === "care-cards" && <p>{listing.care_level} care • {listing.public_temperament || "Ask exhibitor for care and temperament details."}</p>}</div></article>)}</div>
          )}
        </section>
      )}
    </div>
  );
}
