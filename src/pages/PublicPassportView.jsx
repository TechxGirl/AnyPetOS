import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { Card, CardHeader, Icon, PageHeader } from "../components/ui";

// =====================================================
// 🟢 PublicPassportView.jsx
//
// Read-only Passport view for people opening a share link.
// This page intentionally does not require sign-in.
//
// =====================================================

function formatDate(value) {
  if (!value) return "Not logged";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "Not logged";
  }
}

export default function PublicPassportView({ token }) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // 🟢 Load Shared Passport
  // =====================================================

  useEffect(() => {
    let active = true;

    const loadSharedPassport = async () => {
      setLoading(true);
      setError("");

      const { data, error: shareError } = await supabase.rpc(
        "get_public_passport_by_token",
        {
          share_token: token,
        }
      );

      if (!active) return;

      if (shareError || !data) {
        setSnapshot(null);
        setError(
          "This Passport link is invalid, expired, or has been revoked."
        );
      } else {
        setSnapshot(data);
      }

      setLoading(false);
    };

    loadSharedPassport();

    return () => {
      active = false;
    };
  }, [token]);

  // =====================================================
  // 🟢 Loading / Error States
  // =====================================================

  if (loading) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>Loading shared Passport...</h2>
          <p>Opening the secure read-only record.</p>
        </div>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>Passport unavailable</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const passport = snapshot.passport || {};
  const care = snapshot.care || {};
  const health = snapshot.health || {};
  const timeline = snapshot.timeline || [];

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <main className="pageContent publicPassportPage">
      <PageHeader
        eyebrow="Shared AnyPetOS"
        title={passport.name || "Animal Passport"}
        description="This is a read-only Passport shared by the current owner."
        icon={<Icon name="scan" size={22} />}
      />

      <Card className="publicPassportHeroCard">
        <div className="publicPassportHero">
          <div className="publicPassportPhoto">
            {passport.photo?.dataUrl ? (
              <img src={passport.photo.dataUrl} alt={passport.photo.alt || `${passport.name} profile`} />
            ) : (
              <div className="publicPassportPhotoFallback">
                <span>{(passport.name || passport.species || "PP").slice(0, 2).toUpperCase()}</span>
                <small>{passport.species || "Shared Passport"}</small>
              </div>
            )}
          </div>

          <div>
            <p className="passportId">Passport ID: {passport.passportId || "Not assigned"}</p>
            <h2>{passport.name || "Animal Passport"}</h2>
            <p>{passport.species || "Unknown species"}{passport.morph ? ` • ${passport.morph}` : ""}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Icon name="paw" size={18} />} title="Identity" />

        <div className="profileGrid">
          <div className="profileStat">
            <p>Passport ID</p>
            <strong>{passport.passportId || "Not assigned"}</strong>
          </div>

          <div className="profileStat">
            <p>Species</p>
            <strong>{passport.species || "Unknown"}</strong>
          </div>

          <div className="profileStat">
            <p>Morph / breed</p>
            <strong>{passport.morph || "Not set"}</strong>
          </div>

          <div className="profileStat">
            <p>Sex</p>
            <strong>{passport.sex || "Unknown"}</strong>
          </div>

          <div className="profileStat">
            <p>Status</p>
            <strong>{passport.status || "Healthy"}</strong>
          </div>

          <div className="profileStat">
            <p>Temperament</p>
            <strong>{passport.temperament || "Not set"}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Icon name="utensils" size={18} />} title="Care summary" />

        <div className="profileGrid">
          <div className="profileStat">
            <p>Foods</p>
            <strong>
              {care.foodList?.length
                ? care.foodList.join(", ")
                : care.diet || "Not set"}
            </strong>
          </div>

          <div className="profileStat">
            <p>Feeding schedule</p>
            <strong>
              {care.frequency ? `Every ${care.frequency} days` : "Not set"}
            </strong>
          </div>

          <div className="profileStat">
            <p>Last fed</p>
            <strong>{formatDate(care.lastFed)}</strong>
          </div>

          <div className="profileStat">
            <p>Next feed</p>
            <strong>{formatDate(care.nextFeed)}</strong>
          </div>

          <div className="profileStat">
            <p>Housing / substrate</p>
            <strong>{care.substrate || "Not set"}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader icon={<Icon name="pill" size={18} />} title="Health notes" />

        <p>{health.notes || "No public notes included."}</p>

        {health.medications?.length > 0 && (
          <div className="timelineList">
            {health.medications.map((med) => (
              <div className="timelineItem" key={med.id || med.name}>
                <strong>{med.name || "Medication"}</strong>
                <small>
                  {med.dose || "No dose"} • {med.route || "No route"}
                </small>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader icon={<Icon name="history" size={18} />} title="Recent timeline" />

        {timeline.length === 0 ? (
          <p>No timeline entries were shared.</p>
        ) : (
          <div className="timelineList">
            {timeline.slice(0, 12).map((entry) => (
              <div className="timelineItem" key={entry.id || `${entry.type}-${entry.time}`}>
                <strong>{entry.type}</strong>
                {entry.note && <small>{entry.note}</small>}
                <small>{formatDate(entry.time)}</small>
              </div>
            ))}
          </div>
        )}
      </Card>

      <p className="helperText">
        AnyPetOS is not veterinary advice. Always contact a licensed veterinarian for medical concerns.
      </p>
    </main>
  );
}
