import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  Input,
  Modal,
  Select,
  Textarea,
  useToast,
} from "../components/ui";
import {
  buildExpoListingUrl,
  expoAvailabilityVariant,
  formatExpoDate,
  formatExpoMoney,
  normalizePublicExpoPayload,
} from "../data/expoMode";
import "../styles/expo.css";

const ANONYMOUS_FAVORITES_KEY = "petpassport-expo-favorites";
const ANONYMOUS_FOLLOWS_KEY = "petpassport-expo-follows";
const KIOSK_RESET_MS = 90_000;

function createInterestForm(email = "") {
  return {
    name: "",
    email,
    phone: "",
    preferred_contact: "Email",
    interest_level: "Very interested",
    timeframe: "At this expo",
    hold_requested: false,
    message: "",
    consent_to_follow_up: true,
  };
}

function readStoredIds(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

function saveStoredIds(key, values) {
  localStorage.setItem(key, JSON.stringify(Array.from(values)));
}

function getSnapshotPhoto(listing) {
  return listing?.public_snapshot?.passport?.photo || null;
}

function getSnapshotCare(listing) {
  return listing?.public_snapshot?.care || {};
}

function initials(value) {
  return String(value || "PP")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function statusIsPubliclyAvailable(status) {
  return !["Not attending"].includes(status);
}

function PublicListingImage({ listing, className = "" }) {
  const photo = getSnapshotPhoto(listing);
  if (photo) {
    return <img className={className} src={photo} alt={`${listing.display_name} at the expo`} />;
  }

  return (
    <div className={`${className} expo-photo-placeholder`} aria-label="No photo uploaded">
      <span>{initials(listing.display_name)}</span>
      <small>{listing.species || "Animal"}</small>
    </div>
  );
}

function PublicListingCard({ listing, event, favorite, comparing, onFavorite, onCompare, onOpen, onLookup }) {
  return (
    <article className="expo-public-animal-card">
      <button
        type="button"
        className="expo-public-animal-main"
        onClick={() => onOpen(listing)}
        aria-label={`View ${listing.display_name}`}
      >
        <div className="expo-public-photo-wrap">
          <PublicListingImage listing={listing} className="expo-public-photo" />
          {listing.featured && <span className="expo-featured-ribbon">Featured</span>}
          <span className={`expo-status-dot status-${String(listing.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
            {listing.status}
          </span>
        </div>

        <div className="expo-public-card-copy">
          <div className="expo-public-card-heading">
            <div>
              <p>{listing.vendor_name || "PetPassport exhibitor"}</p>
              <h3>{listing.display_name}</h3>
            </div>
            <strong>{event.show_prices === false ? "Ask at booth" : formatExpoMoney(listing.price, listing.currency, listing.price_label || "Ask for price")}</strong>
          </div>

          <p className="expo-animal-line">
            {[listing.species, listing.morph, listing.sex].filter(Boolean).join(" • ") || "Animal details coming soon"}
          </p>

          <div className="expo-card-tags">
            {listing.care_level && <span>{listing.care_level} care</span>}
            {listing.booth_location && <span>Booth {listing.booth_location}</span>}
            {listing.feeding_status && <span>{listing.feeding_status}</span>}
          </div>
        </div>
      </button>

      <div className="expo-public-card-actions">
        <button
          type="button"
          className={favorite ? "is-saved" : ""}
          onClick={() => onFavorite(listing)}
        >
          <Icon name="star" size={17} />
          {favorite ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          className={comparing ? "is-saved" : ""}
          onClick={() => onCompare(listing)}
        >
          <Icon name="chart" size={17} />
          {comparing ? "Comparing" : "Compare"}
        </button>
        <button type="button" onClick={() => onLookup(listing)}>
          <Icon name="scan" size={17} />
          Show at booth
        </button>
      </div>
    </article>
  );
}

export default function PublicExpoView({ slug, listingToken = "", kiosk = false, session }) {
  const { showToast } = useToast();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [selectedListing, setSelectedListing] = useState(null);
  const [lookupListing, setLookupListing] = useState(null);
  const [interestListing, setInterestListing] = useState(null);
  const [interestForm, setInterestForm] = useState(() => createInterestForm(session?.user?.email || ""));
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(readStoredIds(ANONYMOUS_FAVORITES_KEY)));
  const [following, setFollowing] = useState(false);
  const [showFilters, setShowFilters] = useState(!kiosk);
  const [compareIds, setCompareIds] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [exitPin, setExitPin] = useState("");
  const [checkingPin, setCheckingPin] = useState(false);
  const idleTimer = useRef(null);

  const event = payload?.event || null;
  const vendors = payload?.vendors || [];
  const listings = payload?.listings || [];
  const updates = payload?.updates || [];

  const loadExpo = async (silent = false) => {
    if (!silent) setLoading(true);
    if (!silent) setError(null);

    const { data, error: rpcError } = await supabase.rpc("get_public_expo_event", {
      p_slug: slug,
    });

    if (rpcError) {
      if (!silent) {
        setError(rpcError);
        setPayload(null);
        setLoading(false);
      }
      return;
    }

    const normalized = normalizePublicExpoPayload(data);
    if (!normalized?.event) {
      if (!silent) {
        setError(new Error("This expo is not published or could not be found."));
        setPayload(null);
        setLoading(false);
      }
      return;
    }

    setPayload(normalized);

    if (listingToken) {
      const match = (normalized.listings || []).find((listing) => listing.listing_token === listingToken);
      if (match) setSelectedListing(match);
    }

    if (!silent) setLoading(false);
  };

  useEffect(() => {
    loadExpo();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const interval = window.setInterval(() => loadExpo(true), kiosk ? 15_000 : 30_000);
    return () => window.clearInterval(interval);
  }, [kiosk, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!event?.id) return;

    supabase.rpc("record_expo_scan", {
      p_slug: slug,
      p_listing_token: listingToken || null,
      p_scan_type: listingToken ? "animal" : kiosk ? "kiosk" : "event",
      p_referrer: document.referrer || null,
    }).then(({ error: scanError }) => {
      if (scanError) console.warn("Expo scan could not be recorded:", scanError);
    });
  }, [event?.id, kiosk, listingToken, slug]);

  useEffect(() => {
    if (!event?.id) return;
    const requestedVendor = new URLSearchParams(window.location.search).get("vendor");
    if (requestedVendor && vendors.some((vendor) => String(vendor.id) === String(requestedVendor))) {
      setVendorFilter(String(requestedVendor));
      setShowFilters(true);
    }
  }, [event?.id, vendors]);

  useEffect(() => {
    if (!event?.id || !session?.user) {
      const storedFollows = new Set(readStoredIds(ANONYMOUS_FOLLOWS_KEY));
      setFollowing(storedFollows.has(String(event?.id)));
      return;
    }

    Promise.all([
      supabase.from("expo_event_follows").select("id,event_id").eq("user_id", session.user.id).eq("event_id", event.id).maybeSingle(),
      supabase.from("expo_listing_favorites").select("listing_id").eq("user_id", session.user.id).eq("event_id", event.id),
    ]).then(([followResult, favoriteResult]) => {
      if (!followResult.error) setFollowing(Boolean(followResult.data));
      if (!favoriteResult.error) setFavoriteIds(new Set((favoriteResult.data || []).map((item) => String(item.listing_id))));
    });
  }, [event?.id, session?.user]);

  useEffect(() => {
    if (!kiosk) return undefined;

    const resetKiosk = () => {
      setSearch("");
      setSpecies("All");
      setAvailability("All");
      setVendorFilter("All");
      setPriceRange("All");
      setSelectedListing(null);
      setLookupListing(null);
      setInterestListing(null);
      setInterestForm(createInterestForm(""));
      setCompareIds([]);
      setCompareModalOpen(false);
    };

    const resetTimer = () => {
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(resetKiosk, KIOSK_RESET_MS);
    };

    const events = ["pointerdown", "keydown", "touchstart", "scroll"];
    events.forEach((name) => window.addEventListener(name, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      window.clearTimeout(idleTimer.current);
      events.forEach((name) => window.removeEventListener(name, resetTimer));
    };
  }, [kiosk]);

  const speciesOptions = useMemo(
    () => ["All", ...Array.from(new Set(listings.map((listing) => listing.species).filter(Boolean))).sort()],
    [listings]
  );

  const vendorOptions = useMemo(
    () => ["All", ...vendors.map((vendor) => String(vendor.id))],
    [vendors]
  );

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return listings
      .filter((listing) => listing.show_in_catalog !== false && statusIsPubliclyAvailable(listing.status))
      .filter((listing) => {
        if (!query) return true;
        return [
          listing.display_name,
          listing.species,
          listing.morph,
          listing.sex,
          listing.listing_code,
          listing.vendor_name,
          listing.booth_location,
        ].some((value) => String(value || "").toLowerCase().includes(query));
      })
      .filter((listing) => species === "All" || listing.species === species)
      .filter((listing) => availability === "All" || listing.status === availability)
      .filter((listing) => vendorFilter === "All" || String(listing.vendor_id) === vendorFilter)
      .filter((listing) => {
        const price = Number(listing.price);
        if (priceRange === "All") return true;
        if (priceRange === "Ask") return !Number.isFinite(price);
        if (!Number.isFinite(price)) return false;
        if (priceRange === "Under 100") return price < 100;
        if (priceRange === "100-250") return price >= 100 && price <= 250;
        if (priceRange === "250-500") return price > 250 && price <= 500;
        if (priceRange === "500+") return price > 500;
        return true;
      });
  }, [listings, search, species, availability, vendorFilter, priceRange]);

  const toggleCompare = (listing) => {
    setCompareIds((current) => {
      if (current.includes(listing.id)) return current.filter((id) => id !== listing.id);
      if (current.length >= 3) {
        showToast({
          title: "Compare up to three animals",
          message: "Remove one selection before adding another.",
          variant: "warning",
        });
        return current;
      }
      return [...current, listing.id];
    });
  };

  const compareListings = listings.filter((listing) => compareIds.includes(listing.id));
  const savedListings = useMemo(
    () => listings
      .filter((listing) => favoriteIds.has(String(listing.id)))
      .sort((a, b) => String(a.booth_location || a.vendor_booth || "ZZZ").localeCompare(
        String(b.booth_location || b.vendor_booth || "ZZZ"),
        undefined,
        { numeric: true, sensitivity: "base" }
      )),
    [favoriteIds, listings]
  );
  const currentEventFavoriteCount = savedListings.length;
  const savedBudget = savedListings.reduce((total, listing) => {
    const price = Number(listing.price);
    return total + (Number.isFinite(price) ? price : 0);
  }, 0);

  const toggleFavorite = async (listing) => {
    const listingId = String(listing.id);
    const previous = new Set(favoriteIds);
    const next = new Set(previous);
    const removing = next.has(listingId);
    if (removing) next.delete(listingId);
    else next.add(listingId);
    setFavoriteIds(next);

    if (!session?.user) {
      saveStoredIds(ANONYMOUS_FAVORITES_KEY, next);
      showToast({
        title: removing ? "Removed from saved animals" : "Animal saved",
        message: "Saved on this device for your expo visit.",
        variant: "success",
      });
      return;
    }

    const result = removing
      ? await supabase.from("expo_listing_favorites").delete().eq("user_id", session.user.id).eq("listing_id", listing.id)
      : await supabase.from("expo_listing_favorites").insert({
          event_id: event.id,
          listing_id: listing.id,
          user_id: session.user.id,
        });

    if (result.error) {
      setFavoriteIds(previous);
      showToast({
        title: "Saved animal could not be updated",
        message: result.error.message,
        variant: "error",
      });
    }
  };

  const toggleFollow = async () => {
    const previous = following;
    const next = !previous;
    setFollowing(next);

    if (!session?.user) {
      const stored = new Set(readStoredIds(ANONYMOUS_FOLLOWS_KEY));
      if (next) stored.add(String(event.id));
      else stored.delete(String(event.id));
      saveStoredIds(ANONYMOUS_FOLLOWS_KEY, stored);
      showToast({
        title: next ? "Expo followed" : "Expo unfollowed",
        message: next ? "This event is saved on this device." : "This event was removed from saved expos.",
        variant: "success",
      });
      return;
    }

    const result = next
      ? await supabase.from("expo_event_follows").upsert({
          event_id: event.id,
          user_id: session.user.id,
          notifications_enabled: true,
          last_viewed_at: new Date().toISOString(),
        }, { onConflict: "event_id,user_id" })
      : await supabase.from("expo_event_follows").delete().eq("event_id", event.id).eq("user_id", session.user.id);

    if (result.error) {
      setFollowing(previous);
      showToast({
        title: "Expo follow could not be updated",
        message: result.error.message,
        variant: "error",
      });
    }
  };

  const submitInterest = async (submitEvent) => {
    submitEvent.preventDefault();
    if (!interestListing) return;
    setSubmittingInterest(true);

    const { error: submitError } = await supabase.rpc("submit_expo_interest", {
      p_slug: slug,
      p_listing_token: interestListing.listing_token,
      p_name: interestForm.name,
      p_email: interestForm.email,
      p_phone: interestForm.phone,
      p_preferred_contact: interestForm.preferred_contact,
      p_interest_level: interestForm.interest_level,
      p_timeframe: interestForm.timeframe,
      p_hold_requested: Boolean(interestForm.hold_requested),
      p_message: interestForm.message,
      p_consent_to_follow_up: Boolean(interestForm.consent_to_follow_up),
    });

    setSubmittingInterest(false);

    if (submitError) {
      showToast({
        title: "Interest form could not be sent",
        message: submitError.message,
        variant: "error",
      });
      return;
    }

    showToast({
      title: "The exhibitor has your request",
      message: `Use listing code ${interestListing.listing_code} when you visit the booth.`,
      variant: "success",
    });
    setLookupListing(interestListing);
    setInterestListing(null);
    setInterestForm(createInterestForm(session?.user?.email || ""));
  };

  const verifyExitPin = async () => {
    if (!event?.kiosk_pin_required) {
      window.location.href = `/expo/${encodeURIComponent(slug)}`;
      return;
    }

    setCheckingPin(true);
    const { data, error: pinError } = await supabase.rpc("verify_expo_kiosk_pin", {
      p_slug: slug,
      p_pin: exitPin,
    });
    setCheckingPin(false);

    if (pinError || !data) {
      showToast({ title: "Incorrect kiosk PIN", message: "The kiosk remains locked.", variant: "error" });
      return;
    }

    window.location.href = `/expo/${encodeURIComponent(slug)}`;
  };

  if (loading) {
    return (
      <main className={`expo-public-shell ${kiosk ? "is-kiosk" : ""}`}>
        <div className="expo-public-loading">
          <Icon name="scan" size={34} />
          <h1>Loading the expo catalog...</h1>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="expo-public-shell">
        <EmptyState
          icon={<Icon name="alert" size={28} />}
          title="This expo is unavailable"
          description={error?.message || "The event may still be private, archived, or unpublished."}
          action={<Button onClick={() => window.location.assign("/")}>Open PetPassport</Button>}
        />
      </main>
    );
  }

  return (
    <main className={`expo-public-shell ${kiosk ? "is-kiosk" : ""}`}>
      <header
        className="expo-public-hero"
        style={event.banner_url ? { backgroundImage: `linear-gradient(rgba(3, 9, 19, 0.72), rgba(3, 9, 19, 0.90)), url(${event.banner_url})` } : undefined}
      >
        <div className="expo-public-brand">
          <div className="expo-brand-mark">{event.logo_url ? <img src={event.logo_url} alt="" /> : <Icon name="paw" size={24} />}</div>
          <div><strong>PetPassport</strong><span>Expo Discovery</span></div>
        </div>

        <div className="expo-public-hero-copy">
          <div className="expo-public-kicker">
            <span>{event.mode_label || event.mode}</span>
            <span>{event.status}</span>
            {event.is_inventory_live && <span>Inventory live</span>}
          </div>
          <h1>{event.name}</h1>
          <p>{event.description || "See what PetPassport exhibitors are planning to bring before the doors open."}</p>
          <div className="expo-public-meta">
            <span><Icon name="calendar" size={16} />{formatExpoDate(event.starts_at)}{event.ends_at ? ` to ${formatExpoDate(event.ends_at)}` : ""}</span>
            <span><Icon name="map" size={16} />{[event.venue, event.city, event.region].filter(Boolean).join(" • ") || "Location coming soon"}</span>
            {event.public_hours && <span><Icon name="clock" size={16} />{event.public_hours}</span>}
          </div>
        </div>

        <div className="expo-public-hero-actions">
          <Button variant={following ? "primary" : "outline"} onClick={toggleFollow} leftIcon={<Icon name="star" size={17} />}>
            {following ? "Following" : "Follow expo"}
          </Button>
          {kiosk ? (
            <Button variant="ghost" onClick={() => setExitModalOpen(true)}>Exit kiosk</Button>
          ) : event.kiosk_enabled ? (
            <Button variant="outline" onClick={() => window.location.assign(`/expo/${encodeURIComponent(slug)}/kiosk`)} leftIcon={<Icon name="scan" size={17} />}>
              Kiosk view
            </Button>
          ) : null}
        </div>
      </header>

      {event.public_settings?.featuredMessage && (
        <section className="expo-public-announcement">
          <Icon name="sparkles" size={18} />
          <span>{event.public_settings.featuredMessage}</span>
        </section>
      )}

      <section className="expo-public-stats">
        <div><strong>{listings.length}</strong><span>Planned animals</span></div>
        <div><strong>{vendors.length}</strong><span>PetPassport exhibitors</span></div>
        <div><strong>{listings.filter((listing) => listing.status === "Available").length}</strong><span>Available now</span></div>
        <div><strong>{currentEventFavoriteCount}</strong><span>Your saved picks</span></div>
      </section>

      {savedListings.length > 0 && (
        <section className="expo-booth-plan">
          <div className="expo-booth-plan-heading">
            <div>
              <p>My Expo Plan</p>
              <h2>Your saved booth route</h2>
              <span>Sorted by booth so you can move quickly when the doors open.</span>
            </div>
            <div>
              <strong>{savedListings.length} saved</strong>
              {event.show_prices !== false && savedBudget > 0 && (
                <span>Estimated budget {formatExpoMoney(savedBudget, savedListings[0]?.currency || "USD", "")}</span>
              )}
            </div>
          </div>

          <div className="expo-booth-plan-list">
            {savedListings.map((listing, index) => (
              <button type="button" key={listing.id} onClick={() => setLookupListing(listing)}>
                <span>{index + 1}</span>
                <div>
                  <strong>{listing.display_name}</strong>
                  <small>{listing.vendor_name || "Exhibitor"}</small>
                </div>
                <div>
                  <b>{(listing.booth_location || listing.vendor_booth) ? `Booth ${listing.booth_location || listing.vendor_booth}` : "Booth TBD"}</b>
                  <em>{listing.listing_code}</em>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="expo-public-toolbar">
        <div className="expo-search-field">
          <Icon name="search" size={18} />
          <Input
            value={search}
            onChange={(changeEvent) => setSearch(changeEvent.target.value)}
            placeholder="Search animal, species, morph, booth, exhibitor, or listing code"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((current) => !current)}>
          {showFilters ? "Hide filters" : "Show filters"}
        </Button>
      </section>

      {showFilters && (
        <section className="expo-public-filters">
          <label>Species<Select value={species} onChange={(changeEvent) => setSpecies(changeEvent.target.value)}>{speciesOptions.map((option) => <option key={option}>{option}</option>)}</Select></label>
          <label>Availability<Select value={availability} onChange={(changeEvent) => setAvailability(changeEvent.target.value)}>{["All", "Available", "Interested", "On hold", "Deposit received", "Sold", "Adopted", "Display only"].map((option) => <option key={option}>{option}</option>)}</Select></label>
          <label>Exhibitor<Select value={vendorFilter} onChange={(changeEvent) => setVendorFilter(changeEvent.target.value)}>{vendorOptions.map((option) => <option key={option} value={option}>{option === "All" ? "All exhibitors" : vendors.find((vendor) => String(vendor.id) === option)?.display_name || "Exhibitor"}</option>)}</Select></label>
          <label>Price<Select value={priceRange} onChange={(changeEvent) => setPriceRange(changeEvent.target.value)}>{["All", "Under 100", "100-250", "250-500", "500+", "Ask"].map((option) => <option key={option}>{option}</option>)}</Select></label>
        </section>
      )}

      <section className="expo-public-content">
        <div className="expo-public-section-heading">
          <div>
            <p>What exhibitors are bringing</p>
            <h2>{filteredListings.length} matches</h2>
          </div>
          <span>Plan your booth route, save your favorites, and bring the listing code with you.</span>
        </div>

        {filteredListings.length ? (
          <div className="expo-public-animal-grid">
            {filteredListings.map((listing) => (
              <PublicListingCard
                key={listing.id}
                listing={listing}
                event={event}
                favorite={favoriteIds.has(String(listing.id))}
                comparing={compareIds.includes(listing.id)}
                onFavorite={toggleFavorite}
                onCompare={toggleCompare}
                onOpen={setSelectedListing}
                onLookup={setLookupListing}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Icon name="search" size={28} />}
            title="No expo animals match those filters"
            description="Try another species, price range, booth, exhibitor, or listing code."
          />
        )}
      </section>

      {compareIds.length > 0 && (
        <aside className="expo-compare-tray">
          <div>
            <Icon name="chart" size={18} />
            <strong>{compareIds.length} selected</strong>
            <span>Compare price, booth, care level, feeding, sex, and availability.</span>
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => setCompareIds([])}>Clear</Button>
            <Button size="sm" onClick={() => setCompareModalOpen(true)} disabled={compareIds.length < 2}>Compare animals</Button>
          </div>
        </aside>
      )}

      {vendors.length > 0 && (
        <section className="expo-public-vendors">
          <div className="expo-public-section-heading">
            <div><p>Find the booth</p><h2>PetPassport exhibitors</h2></div>
            <span>Vendor plans can change, so check the public updates before event day.</span>
          </div>
          <div className="expo-vendor-public-grid">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="expo-vendor-public-card">
                <div className="expo-vendor-avatar">{initials(vendor.display_name)}</div>
                <div>
                  <Badge variant="primary">{vendor.vendor_type}</Badge>
                  <h3>{vendor.display_name}</h3>
                  <p>{vendor.bio || "Animal care exhibitor using PetPassport."}</p>
                  <strong>{vendor.booth_number ? `Booth ${vendor.booth_number}` : "Booth number coming soon"}</strong>
                  {vendor.show_contact && (
                    <small>{[vendor.contact_email, vendor.contact_phone, vendor.social_handle].filter(Boolean).join(" • ")}</small>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {updates.length > 0 && (
        <section className="expo-public-updates">
          <div className="expo-public-section-heading">
            <div><p>Public event log</p><h2>What changed</h2></div>
            <span>Follow inventory additions, holds, status changes, and exhibitor announcements.</span>
          </div>
          <div className="expo-update-list">
            {updates.slice(0, 20).map((update) => (
              <article key={update.id}>
                <div><Icon name={update.kind === "inventory" ? "paw" : "info"} size={17} /></div>
                <section><strong>{update.title}</strong><p>{update.message}</p><span>{formatExpoDate(update.created_at, { hour: "numeric", minute: "2-digit" })}</span></section>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="expo-public-footer">
        <div><Icon name="paw" size={20} /><strong>PetPassport Expo Discovery</strong></div>
        <p>Inventory, pricing, booth assignments, and availability can change before or during an event. Confirm final details directly with the exhibitor.</p>
      </footer>

      <Modal
        open={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        title={selectedListing?.display_name}
        description={[selectedListing?.species, selectedListing?.morph, selectedListing?.sex].filter(Boolean).join(" • ")}
        size="lg"
        footer={selectedListing && (
          <>
            <Button variant="outline" onClick={() => setLookupListing(selectedListing)} leftIcon={<Icon name="scan" size={16} />}>Show at booth</Button>
            {event.allow_interest && !["Sold", "Adopted", "Not attending"].includes(selectedListing.status) && (
              <Button onClick={() => { setInterestListing(selectedListing); setSelectedListing(null); }} leftIcon={<Icon name="users" size={16} />}>I’m interested</Button>
            )}
          </>
        )}
      >
        {selectedListing && (
          <div className="expo-listing-detail">
            <PublicListingImage listing={selectedListing} className="expo-listing-detail-photo" />
            <div className="expo-listing-detail-grid">
              <div><span>Status</span><Badge variant={expoAvailabilityVariant(selectedListing.status)}>{selectedListing.status}</Badge></div>
              <div><span>Price</span><strong>{event.show_prices === false ? "Ask at booth" : formatExpoMoney(selectedListing.price, selectedListing.currency, selectedListing.price_label || "Ask for price")}</strong></div>
              <div><span>Booth</span><strong>{selectedListing.booth_location || selectedListing.vendor_booth || "Coming soon"}</strong></div>
              <div><span>Listing code</span><strong>{selectedListing.listing_code}</strong></div>
              <div><span>Care level</span><strong>{selectedListing.care_level || "Ask exhibitor"}</strong></div>
              <div><span>Feeding</span><strong>{selectedListing.feeding_status || "Ask exhibitor"}</strong></div>
              <div><span>Last fed</span><strong>{(selectedListing.last_fed_text || getSnapshotCare(selectedListing).lastFed) ? (selectedListing.last_fed_text || formatExpoDate(getSnapshotCare(selectedListing).lastFed)) : "Not listed"}</strong></div>
              <div><span>Weight</span><strong>{selectedListing.weight_text || "Not listed"}</strong></div>
            </div>
            {selectedListing.public_temperament && <section><h4>Temperament</h4><p>{selectedListing.public_temperament}</p></section>}
            {selectedListing.genetics && <section><h4>Genetics / lineage</h4><p>{selectedListing.genetics}</p></section>}
            {selectedListing.parent_information && <section><h4>Parents</h4><p>{selectedListing.parent_information}</p></section>}
            {selectedListing.included_supplies && <section><h4>Included supplies</h4><p>{selectedListing.included_supplies}</p></section>}
            {selectedListing.pickup_requirements && <section><h4>Pickup requirements</h4><p>{selectedListing.pickup_requirements}</p></section>}
            {selectedListing.expo_notes && <section><h4>Expo notes</h4><p>{selectedListing.expo_notes}</p></section>}
            <p className="expo-detail-disclaimer">Confirm care, genetics, health, payment, and transfer details directly with the exhibitor before completing a purchase or adoption.</p>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(lookupListing)}
        onClose={() => setLookupListing(null)}
        title="Show this at the booth"
        description="The exhibitor can use this code to find the exact animal quickly."
        size="md"
        footer={<Button onClick={() => setLookupListing(null)}>Done</Button>}
      >
        {lookupListing && (
          <div className="expo-booth-lookup-card">
            <p>{event.name}</p>
            <h2>{lookupListing.listing_code}</h2>
            <strong>{lookupListing.display_name}</strong>
            <span>{[lookupListing.species, lookupListing.morph, lookupListing.sex].filter(Boolean).join(" • ")}</span>
            <div><Icon name="map" size={20} /><b>{lookupListing.vendor_name || "Exhibitor"}</b><em>{lookupListing.booth_location || lookupListing.vendor_booth ? `Booth ${lookupListing.booth_location || lookupListing.vendor_booth}` : "Ask event staff for the booth"}</em></div>
            <small>Screenshot this card or keep it open when you reach the booth.</small>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(interestListing)}
        onClose={() => setInterestListing(null)}
        title={`Interested in ${interestListing?.display_name || "this animal"}?`}
        description="Send a lead to the exhibitor and keep the listing code for the booth."
        size="lg"
        footer={(
          <>
            <Button variant="outline" onClick={() => setInterestListing(null)}>Cancel</Button>
            <Button type="submit" form="expo-interest-form" loading={submittingInterest}>Send interest</Button>
          </>
        )}
      >
        <form id="expo-interest-form" className="expo-form-grid" onSubmit={submitInterest}>
          <label>Name<Input required value={interestForm.name} onChange={(changeEvent) => setInterestForm({ ...interestForm, name: changeEvent.target.value })} /></label>
          <label>Email<Input type="email" value={interestForm.email} onChange={(changeEvent) => setInterestForm({ ...interestForm, email: changeEvent.target.value })} /></label>
          <label>Phone, optional<Input value={interestForm.phone} onChange={(changeEvent) => setInterestForm({ ...interestForm, phone: changeEvent.target.value })} /></label>
          <label>Preferred contact<Select value={interestForm.preferred_contact} onChange={(changeEvent) => setInterestForm({ ...interestForm, preferred_contact: changeEvent.target.value })}><option>Email</option><option>Text</option><option>Phone</option><option>PetPassport</option></Select></label>
          <label>Interest level<Select value={interestForm.interest_level} onChange={(changeEvent) => setInterestForm({ ...interestForm, interest_level: changeEvent.target.value })}><option>Very interested</option><option>Considering</option><option>Need more information</option><option>Ready to purchase/adopt</option></Select></label>
          <label>Timeframe<Select value={interestForm.timeframe} onChange={(changeEvent) => setInterestForm({ ...interestForm, timeframe: changeEvent.target.value })}><option>At this expo</option><option>Before the expo</option><option>After the expo</option><option>Just researching</option></Select></label>
          <label className="expo-form-full">Questions or message<Textarea rows={4} value={interestForm.message} onChange={(changeEvent) => setInterestForm({ ...interestForm, message: changeEvent.target.value })} /></label>
          {event.allow_hold_requests && <label className="expo-check-row"><input type="checkbox" checked={interestForm.hold_requested} onChange={(changeEvent) => setInterestForm({ ...interestForm, hold_requested: changeEvent.target.checked })} />I would like to ask about a temporary hold or deposit.</label>}
          <label className="expo-check-row"><input type="checkbox" required checked={interestForm.consent_to_follow_up} onChange={(changeEvent) => setInterestForm({ ...interestForm, consent_to_follow_up: changeEvent.target.checked })} />I agree that the exhibitor may contact me about this animal.</label>
        </form>
      </Modal>

      <Modal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        title="Compare expo animals"
        description="A side-by-side planning view. Confirm final care, health, genetics, and terms directly with each exhibitor."
        size="xl"
        footer={<Button onClick={() => setCompareModalOpen(false)}>Done comparing</Button>}
      >
        <div className="expo-compare-table-wrap">
          <table className="expo-compare-table">
            <thead>
              <tr>
                <th>Detail</th>
                {compareListings.map((listing) => <th key={listing.id}>{listing.display_name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr><th>Photo</th>{compareListings.map((listing) => <td key={listing.id}><PublicListingImage listing={listing} className="expo-compare-photo" /></td>)}</tr>
              <tr><th>Species</th>{compareListings.map((listing) => <td key={listing.id}>{listing.species || "Not listed"}</td>)}</tr>
              <tr><th>Morph / breed</th>{compareListings.map((listing) => <td key={listing.id}>{listing.morph || "Not listed"}</td>)}</tr>
              <tr><th>Sex</th>{compareListings.map((listing) => <td key={listing.id}>{listing.sex || "Unknown"}</td>)}</tr>
              <tr><th>Price</th>{compareListings.map((listing) => <td key={listing.id}>{event.show_prices === false ? "Ask at booth" : formatExpoMoney(listing.price, listing.currency, listing.price_label || "Ask")}</td>)}</tr>
              <tr><th>Status</th>{compareListings.map((listing) => <td key={listing.id}>{listing.status}</td>)}</tr>
              <tr><th>Care level</th>{compareListings.map((listing) => <td key={listing.id}>{listing.care_level || "Ask"}</td>)}</tr>
              <tr><th>Feeding</th>{compareListings.map((listing) => <td key={listing.id}>{listing.feeding_status || "Ask"}</td>)}</tr>
              <tr><th>Exhibitor</th>{compareListings.map((listing) => <td key={listing.id}>{listing.vendor_name || "Exhibitor"}</td>)}</tr>
              <tr><th>Booth</th>{compareListings.map((listing) => <td key={listing.id}>{listing.booth_location || listing.vendor_booth || "TBD"}</td>)}</tr>
              <tr><th>Lookup code</th>{compareListings.map((listing) => <td key={listing.id}><strong>{listing.listing_code}</strong></td>)}</tr>
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal
        open={exitModalOpen}
        onClose={() => setExitModalOpen(false)}
        title="Exit kiosk mode"
        description={event.kiosk_pin_required ? "Enter the organizer PIN to return to the standard catalog." : "Return to the standard public catalog?"}
        footer={(
          <>
            <Button variant="outline" onClick={() => setExitModalOpen(false)}>Stay in kiosk</Button>
            <Button onClick={verifyExitPin} loading={checkingPin}>Exit kiosk</Button>
          </>
        )}
      >
        {event.kiosk_pin_required && <label>Organizer PIN<Input type="password" inputMode="numeric" value={exitPin} onChange={(changeEvent) => setExitPin(changeEvent.target.value)} /></label>}
      </Modal>
    </main>
  );
}
