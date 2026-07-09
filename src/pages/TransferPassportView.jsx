import { useEffect, useState } from "react";
import Auth from "../components/Auth";
import { supabase } from "../services/supabaseClient";
import { Button, Card, CardHeader, Icon, PageHeader } from "../components/ui";

// =====================================================
// 🟢 TransferPassportView.jsx
//
// Lets a recipient preview a Passport transfer invite.
// Accepting ownership requires sign-in so ownership can attach
// to a real Supabase user account.
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

export default function TransferPassportView({ token, session }) {
  // =====================================================
  // 🟢 State
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  // =====================================================
  // 🟢 Load Transfer Invite
  // =====================================================

  useEffect(() => {
    let active = true;

    const loadTransfer = async () => {
      setLoading(true);
      setError("");

      const { data, error: transferError } = await supabase.rpc(
        "get_transfer_passport_by_token",
        {
          transfer_token: token,
        }
      );

      if (!active) return;

      if (transferError || !data) {
        setSnapshot(null);
        setError("This transfer invite is invalid, expired, or unavailable.");
      } else {
        setSnapshot(data.public_snapshot || data);
        setStatus(data.status || "pending");
      }

      setLoading(false);
    };

    loadTransfer();

    return () => {
      active = false;
    };
  }, [token]);

  // =====================================================
  // 🟢 Accept Transfer
  // =====================================================

  const acceptTransfer = async () => {
    if (!session) return;

    setAccepting(true);
    setError("");

    const { error: acceptError } = await supabase.rpc(
      "accept_passport_transfer",
      {
        transfer_token: token,
      }
    );

    if (acceptError) {
      setError(
        acceptError.message ||
          "PetPassport could not accept this transfer invite."
      );
    } else {
      setAccepted(true);
      setStatus("accepted");
    }

    setAccepting(false);
  };

  // =====================================================
  // 🟢 Loading / Error States
  // =====================================================

  if (loading) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>Loading transfer invite...</h2>
          <p>Opening the secure Passport handoff.</p>
        </div>
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="loginScreen">
        <div className="card onboardingCard">
          <h2>Transfer unavailable</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const passport = snapshot?.passport || {};
  const care = snapshot?.care || {};

  // =====================================================
  // 🟢 Sign-In Required
  // =====================================================

  if (!session) {
    return (
      <main className="pageContent publicPassportPage">
        <PageHeader
          eyebrow="PetPassport transfer"
          title={`Accept ${passport.name || "this animal"}'s Passport`}
          description="You can preview the Passport now. Sign in or create an account to accept ownership."
          icon={<Icon name="share" size={22} />}
        />

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
            <div className="profileStat">
              <p>Name</p>
              <strong>{passport.name || "Unnamed animal"}</strong>
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
              <p>Status</p>
              <strong>{passport.status || "Healthy"}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader icon={<Icon name="user" size={18} />} title="Sign in to accept" />
          <Auth />
        </Card>
      </main>
    );
  }

  // =====================================================
  // 🟢 Render
  // =====================================================

  return (
    <main className="pageContent publicPassportPage">
      <PageHeader
        eyebrow="PetPassport transfer"
        title={`Accept ${passport.name || "this animal"}'s Passport`}
        description="Review the animal record, then accept ownership into your PetPassport account."
        icon={<Icon name="share" size={22} />}
      />

      {accepted && (
        <Card>
          <CardHeader icon={<Icon name="check" size={18} />} title="Transfer accepted" />
          <p>
            This Passport now belongs to your account. Open your dashboard to continue tracking care.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Open my dashboard
          </Button>
        </Card>
      )}

      {!accepted && (
        <>
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
              <div className="profileStat">
                <p>Name</p>
                <strong>{passport.name || "Unnamed animal"}</strong>
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
                <p>Foods</p>
                <strong>
                  {care.foodList?.length
                    ? care.foodList.join(", ")
                    : care.diet || "Not set"}
                </strong>
              </div>

              <div className="profileStat">
                <p>Last fed</p>
                <strong>{formatDate(care.lastFed)}</strong>
              </div>
            </div>
          </Card>

          {status !== "pending" ? (
            <Card>
              <CardHeader icon={<Icon name="alert" size={18} />} title="Invite not pending" />
              <p>This invite is currently marked as {status}.</p>
            </Card>
          ) : (
            <Card>
              <CardHeader icon={<Icon name="shield" size={18} />} title="Accept ownership" />
              <p>
                Accepting this transfer moves the Passport into your account. The care history stays with the animal.
              </p>

              {error && <p className="helperText">{error}</p>}

              <Button
                loading={accepting}
                leftIcon={<Icon name="check" size={16} />}
                onClick={acceptTransfer}
              >
                Accept transfer
              </Button>
            </Card>
          )}
        </>
      )}
    </main>
  );
}
