import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, CardHeader, Icon, Input, PageHeader, Select, Textarea, useToast } from "../components/ui";
import { FoundingBadgeGallery } from "../components/founding";
import { useFoundingBadges } from "../context/FoundingBadgeContextCore";
import { useExpoDiscovery } from "../hooks/useExpoMode";
import { buildExpoListingUrl, formatExpoDate, formatExpoMoney } from "../data/expoMode";
import { supabase } from "../services/supabaseClient";
import "../styles/expo.css";

const FOLLOW_KEY = "petpassport-expo-follows";

function getInitialProfile(profile) {
  try {
    return JSON.parse(localStorage.getItem("petpassport-public-profile") || "null") || {
      displayName: profile?.display_name || "AnyPetOS Keeper",
      handle: profile?.username || "petpassport",
      bio: "Building a better way to preserve every animal's story.",
      pageType: "Keeper / Rescue / Breeder",
    };
  } catch {
    return { displayName: "AnyPetOS Keeper", handle: "petpassport", bio: "", pageType: "Keeper" };
  }
}

function getStoredFollows() {
  try {
    return new Set((JSON.parse(localStorage.getItem(FOLLOW_KEY) || "[]") || []).map(String));
  } catch {
    return new Set();
  }
}

function eventModeLabel(mode) {
  return ({ breeder: "Breeder Expo", rescue: "Adoption Event", education: "Education Event", retail: "Retail Show", mixed: "Mixed Expo" })[mode] || "Expo";
}

function ExpoPreviewPhoto({ animal }) {
  const photo = animal?.photo || animal?.public_snapshot?.passport?.photo;
  if (photo) return <img src={photo} alt={animal.display_name || "Expo animal"} />;
  return <div><Icon name="paw" size={20} /><span>{animal.species || "Animal"}</span></div>;
}

export default function Community({ pets, profile }) {
  const { showToast } = useToast();
  const { badges: foundingBadges } = useFoundingBadges();
  const [user, setUser] = useState(null);
  const [publicProfile, setPublicProfile] = useState(() => getInitialProfile(profile));
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("All");
  const [followedIds, setFollowedIds] = useState(() => getStoredFollows());
  const discovery = useExpoDiscovery();

  useEffect(() => {
    let active = true;

    const loadCloudFollows = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData?.user || null;
      if (!active) return;
      setUser(currentUser);

      if (!currentUser) return;

      const { data, error } = await supabase
        .from("expo_event_follows")
        .select("event_id")
        .eq("user_id", currentUser.id);

      if (!active || error) return;
      setFollowedIds(new Set((data || []).map((item) => String(item.event_id))));
    };

    loadCloudFollows();
    return () => { active = false; };
  }, []);

  const achievements = useMemo(() => {
    const logs = pets.flatMap((pet) => pet.logs || []);
    return [
      { label: "First Passport", unlocked: pets.length > 0 },
      { label: "Collection Builder", unlocked: pets.length >= 5 },
      { label: "Care Logger", unlocked: logs.length >= 10 },
      { label: "Health Historian", unlocked: pets.some((pet) => (pet.meds || []).length || (pet.weightLogs || []).length) },
      { label: "Transport Ready", unlocked: pets.some((pet) => pet.share?.enabled || pet.transfer?.status) },
    ];
  }, [pets]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return discovery.events.filter((event) => {
      const searchMatch = !query || [event.name, event.venue, event.city, event.region, event.description]
        .some((value) => String(value || "").toLowerCase().includes(query));
      const modeMatch = mode === "All" || event.mode === mode;
      return searchMatch && modeMatch;
    });
  }, [discovery.events, mode, search]);

  const saveProfile = () => {
    localStorage.setItem("petpassport-public-profile", JSON.stringify(publicProfile));
  };

  const toggleFollow = async (eventId) => {
    const previous = new Set(followedIds);
    const next = new Set(previous);
    const key = String(eventId);
    const removing = next.has(key);
    if (removing) next.delete(key);
    else next.add(key);
    setFollowedIds(next);

    if (!user) {
      localStorage.setItem(FOLLOW_KEY, JSON.stringify(Array.from(next)));
      return;
    }

    const result = removing
      ? await supabase.from("expo_event_follows").delete().eq("event_id", eventId).eq("user_id", user.id)
      : await supabase.from("expo_event_follows").upsert({
          event_id: eventId,
          user_id: user.id,
          notifications_enabled: true,
          last_viewed_at: new Date().toISOString(),
        }, { onConflict: "event_id,user_id" });

    if (result.error) {
      setFollowedIds(previous);
      showToast({
        title: "Expo follow could not be updated",
        message: result.error.message,
        variant: "error",
      });
    }
  };

  return (
    <div className="page-shell community-expo-page">
      <PageHeader
        eyebrow="Community Expo Discovery"
        title="Follow the show before the doors open"
        description="See what AnyPetOS breeders, rescues, educators, and retailers plan to bring, compare prices, save animals, find booth numbers, and arrive with the exact listing code."
        icon={<Icon name="users" size={22} />}
        actions={<Badge variant="primary">Public pre-show inventory</Badge>}
      />

      <section className="community-expo-hero">
        <div>
          <p>Plan before show day</p>
          <h2>Build your expo wish list instead of wandering aisle by aisle.</h2>
          <span>Public listings can include real animal photos, species, morph or breed, sex, price, availability, care level, feeding status, exhibitor, booth, and a lookup code to show the vendor.</span>
        </div>
        <div className="community-expo-hero-stats">
          <div><strong>{discovery.events.length}</strong><span>Public expos</span></div>
          <div><strong>{discovery.events.reduce((sum, event) => sum + Number(event.listing_count || 0), 0)}</strong><span>Planned animals</span></div>
          <div><strong>{discovery.events.reduce((sum, event) => sum + Number(event.vendor_count || 0), 0)}</strong><span>Exhibitors</span></div>
          <div><strong>{followedIds.size}</strong><span>Followed here</span></div>
        </div>
      </section>

      <section className="community-expo-toolbar">
        <div><Icon name="search" size={18} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search expo, venue, city, or state" /></div>
        <Select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option>All</option>
          <option value="breeder">Breeder Expo</option>
          <option value="rescue">Adoption Event</option>
          <option value="education">Education Event</option>
          <option value="retail">Retail Show</option>
          <option value="mixed">Mixed Expo</option>
        </Select>
      </section>

      {discovery.loading ? (
        <Card className="community-expo-loading"><Icon name="scan" size={26} /><h3>Finding public AnyPetOS expos...</h3></Card>
      ) : discovery.error ? (
        <Card className="community-expo-loading"><Icon name="alert" size={26} /><h3>Expo Discovery is waiting for its database update</h3><p>{discovery.error.message}</p><Button onClick={discovery.refresh}>Try again</Button></Card>
      ) : filteredEvents.length ? (
        <section className="community-expo-grid">
          {filteredEvents.map((event) => {
            const followed = followedIds.has(String(event.id));
            const featured = event.featured_animals || [];
            return (
              <Card key={event.id} className="community-expo-card" padding="none" style={event.banner_url ? { backgroundImage: `linear-gradient(rgba(8, 15, 28, 0.78), rgba(8, 15, 28, 0.96)), url(${event.banner_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                <div className="community-expo-card-top">
                  <div>
                    <Badge variant={event.status === "Live" ? "success" : "primary"}>{event.status}</Badge>
                    <span>{eventModeLabel(event.mode)}</span>
                  </div>
                  <button type="button" className={followed ? "is-followed" : ""} onClick={() => toggleFollow(event.id)}><Icon name="star" size={17} />{followed ? "Following" : "Follow"}</button>
                </div>
                <div className="community-expo-copy">
                  <p>{formatExpoDate(event.starts_at)} {event.public_hours ? `â€¢ ${event.public_hours}` : ""}</p>
                  <h2>{event.name}</h2>
                  <span><Icon name="map" size={15} />{[event.venue, event.city, event.region].filter(Boolean).join(" â€¢ ") || "Location coming soon"}</span>
                  <p>{event.description || "Browse the public pre-show inventory from AnyPetOS exhibitors."}</p>
                </div>
                <div className="community-featured-animals">
                  {featured.length ? featured.slice(0, 4).map((animal) => (
                    <button
                      type="button"
                      className="community-featured-animal"
                      key={animal.id || animal.listing_code}
                      onClick={() => window.open(
                        animal.listing_token
                          ? buildExpoListingUrl(event.slug, animal.listing_token)
                          : `/expo/${encodeURIComponent(event.slug)}`,
                        "_blank",
                        "noopener,noreferrer"
                      )}
                    >
                      <ExpoPreviewPhoto animal={animal} />
                      <section>
                        <strong>{animal.display_name}</strong>
                        <span>{animal.species}{animal.morph ? ` â€¢ ${animal.morph}` : ""}</span>
                        <b>{event.show_prices === false ? "Ask at booth" : formatExpoMoney(animal.price, animal.currency, animal.price_label || "Ask")}</b>
                        <small>{animal.vendor_name || "Exhibitor"}{(animal.booth_location || animal.vendor_booth) ? ` â€¢ Booth ${animal.booth_location || animal.vendor_booth}` : " â€¢ Booth TBD"}</small>
                        {animal.listing_code && <em>Code {animal.listing_code}</em>}
                      </section>
                    </button>
                  )) : <p className="helperText">Exhibitors have not published featured inventory yet. Follow the expo and check back.</p>}
                </div>
                <div className="community-expo-card-footer">
                  <div><span>{event.vendor_count || 0} exhibitors</span><span>{event.listing_count || 0} animals</span><span>{event.available_count || 0} available</span></div>
                  <Button onClick={() => window.open(`/expo/${encodeURIComponent(event.slug)}`, "_blank", "noopener,noreferrer")}>Explore expo</Button>
                </div>
              </Card>
            );
          })}
        </section>
      ) : (
        <Card className="community-expo-loading"><Icon name="search" size={26} /><h3>No public expos match yet</h3><p>Try another city, event type, or search term. Organizers can publish events from Expo Mode.</p></Card>
      )}

      <section className="community-expo-how">
        <Card><CardHeader icon={<Icon name="store" size={18} />} title="Exhibitors publish plans" description="Approved breeders, rescues, educators, and retailers upload the animals they expect to bring, including prices and booth locations." /></Card>
        <Card><CardHeader icon={<Icon name="star" size={18} />} title="Visitors follow and save" description="Visitors browse before event day, save favorites, compare options, estimate budget, and plan which booths to visit first." /></Card>
        <Card><CardHeader icon={<Icon name="scan" size={18} />} title="Show the lookup card" description="Every public animal has a large listing code visitors can screenshot and show at the booth for fast retrieval." /></Card>
        <Card><CardHeader icon={<Icon name="share" size={18} />} title="Finish with the Passport" description="After a sale or adoption, the exhibitor can generate the private ownership transfer link from the expo pipeline." /></Card>
      </section>

      <PageHeader
        eyebrow="Public identity foundation"
        title="Your Community Presence"
        description="Keep developing your public keeper, breeder, rescue, educator, or retailer profile alongside Expo Discovery."
        icon={<Icon name="user" size={22} />}
        actions={<Badge variant="neutral">Profile preview</Badge>}
      />

      <div className="feature-grid feature-grid--two">
        <Card>
          <CardHeader icon={<Icon name="edit" size={18} />} title="Public profile draft" description="Beta-safe local preview before complete public organization profiles are cloud connected." />
          <div className="formGrid twoCol">
            <label>Display name<Input value={publicProfile.displayName} onChange={(event) => setPublicProfile({ ...publicProfile, displayName: event.target.value })} /></label>
            <label>Handle<Input value={publicProfile.handle} onChange={(event) => setPublicProfile({ ...publicProfile, handle: event.target.value })} /></label>
            <label className="full">Page type<Input value={publicProfile.pageType} onChange={(event) => setPublicProfile({ ...publicProfile, pageType: event.target.value })} /></label>
            <label className="full">Bio<Textarea value={publicProfile.bio} onChange={(event) => setPublicProfile({ ...publicProfile, bio: event.target.value })} /></label>
          </div>
          <Button leftIcon={<Icon name="check" size={16} />} onClick={saveProfile}>Save local profile draft</Button>
        </Card>

        <Card className="public-profile-card">
          <CardHeader icon={<Icon name="scan" size={18} />} title="Preview page" description="How a public keeper or organization page could begin to feel." />
          <div className="public-profile-preview">
            <div className="public-avatar"><Icon name="paw" size={28} /></div>
            <h2>{publicProfile.displayName}</h2>
            <p>@{publicProfile.handle}</p>
            <Badge variant="success">{publicProfile.pageType}</Badge>
            <FoundingBadgeGallery compact />
            <p>{publicProfile.bio}</p>
            <div className="mini-stat-row"><span>{pets.length} passports</span><span>{achievements.filter((item) => item.unlocked).length} achievements</span><span>{foundingBadges.length ? `${foundingBadges.length} founding badge${foundingBadges.length === 1 ? "" : "s"}` : "Expo ready"}</span></div>
          </div>
        </Card>
      </div>

      <div className="feature-grid feature-grid--three">
        <Card><CardHeader icon={<Icon name="shield" size={18} />} title="Rescue pages" description="Adoptable animals, intake stories, rehab updates, organization verification, and adoption event inventory." /><p className="helperText">Expo Mode supports public adoption fees, interest forms, holds, and adoption transfer.</p></Card>
        <Card><CardHeader icon={<Icon name="activity" size={18} />} title="Breeder pages" description="Available animals, pre-show inventory, hatchling updates, buyer-ready Passports, and reputation signals." /><p className="helperText">Expo Mode connects planned animals, booth lookup, deposits, and buyer transfer.</p></Card>
        <Card><CardHeader icon={<Icon name="star" size={18} />} title="Achievements" description="Positive signals for complete records, safe transfers, care consistency, and community trust." /><div className="module-chip-grid">{achievements.map((item) => <span key={item.label} className={`achievement-pill ${item.unlocked ? "is-unlocked" : ""}`}><Icon name={item.unlocked ? "check" : "clock"} size={15} />{item.label}</span>)}</div></Card>
      </div>
    </div>
  );
}
