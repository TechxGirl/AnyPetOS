import { useMemo, useState } from "react";
import { Badge, Button, Card, CardHeader, Icon, Input, PageHeader, Textarea } from "../components/ui";

function getInitialProfile(profile) {
  try {
    return JSON.parse(localStorage.getItem("petpassport-public-profile") || "null") || {
      displayName: profile?.display_name || "PetPassport Keeper",
      handle: profile?.username || "petpassport",
      bio: "Building a better way to preserve every animal's story.",
      pageType: "Keeper / Rescue / Breeder",
    };
  } catch {
    return { displayName: "PetPassport Keeper", handle: "petpassport", bio: "", pageType: "Keeper" };
  }
}

export default function Community({ pets, profile }) {
  const [publicProfile, setPublicProfile] = useState(() => getInitialProfile(profile));
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

  const saveProfile = () => {
    localStorage.setItem("petpassport-public-profile", JSON.stringify(publicProfile));
  };

  return (
    <div className="page-shell roadmap-feature-page">
      <PageHeader
        eyebrow="Community foundation"
        title="Public Presence"
        description="Set up the pieces for public profiles, breeder pages, rescue pages, verification, achievements, and reputation."
        icon={<Icon name="user" size={22} />}
        actions={<Badge variant="primary">Phase 6 foundation</Badge>}
      />

      <div className="feature-grid feature-grid--two">
        <Card>
          <CardHeader icon={<Icon name="edit" size={18} />} title="Public profile draft" description="Beta-safe local preview before public profiles are connected to cloud/community features." />
          <div className="formGrid twoCol">
            <label>Display name<Input value={publicProfile.displayName} onChange={(event) => setPublicProfile({ ...publicProfile, displayName: event.target.value })} /></label>
            <label>Handle<Input value={publicProfile.handle} onChange={(event) => setPublicProfile({ ...publicProfile, handle: event.target.value })} /></label>
            <label className="full">Page type<Input value={publicProfile.pageType} onChange={(event) => setPublicProfile({ ...publicProfile, pageType: event.target.value })} /></label>
            <label className="full">Bio<Textarea value={publicProfile.bio} onChange={(event) => setPublicProfile({ ...publicProfile, bio: event.target.value })} /></label>
          </div>
          <Button leftIcon={<Icon name="check" size={16} />} onClick={saveProfile}>Save local profile draft</Button>
        </Card>

        <Card className="public-profile-card">
          <CardHeader icon={<Icon name="scan" size={18} />} title="Preview page" description="How a public profile or organization page could begin to feel." />
          <div className="public-profile-preview">
            <div className="public-avatar"><Icon name="paw" size={28} /></div>
            <h2>{publicProfile.displayName}</h2>
            <p>@{publicProfile.handle}</p>
            <Badge variant="success">{publicProfile.pageType}</Badge>
            <p>{publicProfile.bio}</p>
            <div className="mini-stat-row"><span>{pets.length} passports</span><span>{achievements.filter((item) => item.unlocked).length} achievements</span><span>Verification ready</span></div>
          </div>
        </Card>
      </div>

      <div className="feature-grid feature-grid--three">
        <Card><CardHeader icon={<Icon name="shield" size={18} />} title="Rescue pages" description="Adoptable animals, intake stories, rehab updates, and organization verification." /><p className="helperText">Next: public adoptable profile links and application status.</p></Card>
        <Card><CardHeader icon={<Icon name="activity" size={18} />} title="Breeder pages" description="Available animals, buyer-ready Passports, hatchling updates, and reputation signals." /><p className="helperText">Next: sale status, holdbacks, transfer history, and buyer reviews.</p></Card>
        <Card><CardHeader icon={<Icon name="star" size={18} />} title="Achievements" description="Positive signals for complete records, safe transfers, care consistency, and community trust." /><div className="module-chip-grid">{achievements.map((item) => <span key={item.label} className={`achievement-pill ${item.unlocked ? "is-unlocked" : ""}`}><Icon name={item.unlocked ? "check" : "clock"} size={15} />{item.label}</span>)}</div></Card>
      </div>
    </div>
  );
}
