import { useEffect, useState } from "react";
import Auth from "../components/Auth";
import { Button, Card, CardHeader, Icon, PageHeader } from "../components/ui";
import { supabase } from "../services/supabaseClient";
import { getAccessLevelLabel } from "../data/careInfrastructure";

export default function AccessInviteView({ token, session }) {
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInvite() {
      setLoading(true);
      setError("");

      const { data, error: inviteError } = await supabase.rpc("get_access_invite_by_token", {
        access_token: token,
      });

      if (!active) return;

      if (inviteError || !data) {
        setInvite(null);
        setError("This access invite is invalid, expired, or unavailable.");
      } else {
        setInvite(data);
      }

      setLoading(false);
    }

    loadInvite();

    return () => {
      active = false;
    };
  }, [token]);

  const acceptInvite = async () => {
    if (!session) return;

    setAccepting(true);
    setError("");

    const { error: acceptError } = await supabase.rpc("accept_access_invite", {
      access_token: token,
    });

    if (acceptError) {
      setError(acceptError.message || "AnyPetOS could not accept this access invite.");
    } else {
      setAccepted(true);
    }

    setAccepting(false);
  };

  if (loading) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>Loading access invite...</h2>
          <p>Opening the temporary AnyPetOS access link.</p>
        </div>
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>Access unavailable</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const passport = invite?.public_snapshot?.passport || {};
  const care = invite?.public_snapshot?.care || {};

  return (
    <main className="pageContent publicPassportPage accessInvitePage">
      <PageHeader
        eyebrow="Temporary AnyPetOS access"
        title={`${getAccessLevelLabel(invite?.access_level)} for ${passport.name || "this animal"}`}
        description="This link lets a trusted person preview the Passport and accept the temporary access invite into their account."
        icon={<Icon name="users" size={22} />}
      />

      {error && (
        <Card>
          <CardHeader icon={<Icon name="alert" size={18} />} title="Access notice" />
          <p>{error}</p>
        </Card>
      )}

      {accepted && (
        <Card>
          <CardHeader icon={<Icon name="check" size={18} />} title="Access accepted" />
          <p>
            This invite has been accepted. In this beta, the access record is tracked in the owner's Access Center. Full shared-workspace editing will be added in the next permissions phase.
          </p>
          <Button onClick={() => (window.location.href = "/")}>Open AnyPetOS</Button>
        </Card>
      )}

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
          <div className="profileStat"><p>Access level</p><strong>{getAccessLevelLabel(invite?.access_level)}</strong></div>
          <div className="profileStat"><p>Status</p><strong>{invite?.status || "pending"}</strong></div>
          <div className="profileStat"><p>Expires</p><strong>{invite?.expires_at ? new Date(invite.expires_at).toLocaleString() : "No expiration"}</strong></div>
          <div className="profileStat"><p>Foods</p><strong>{care.foodList?.length ? care.foodList.join(", ") : care.diet || "Not set"}</strong></div>
        </div>
      </Card>

      {!session && (
        <Card>
          <CardHeader icon={<Icon name="user" size={18} />} title="Sign in to accept access" />
          <Auth />
        </Card>
      )}

      {session && !accepted && (
        <Card>
          <CardHeader icon={<Icon name="shield" size={18} />} title="Accept invite" />
          <p>Accepting records this temporary access permission in AnyPetOS.</p>
          <Button loading={accepting} onClick={acceptInvite}>Accept access invite</Button>
        </Card>
      )}
    </main>
  );
}
