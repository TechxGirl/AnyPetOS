import { USER_ROLES } from "../../constants/roles";
import { useFoundingBadges } from "../../context/FoundingBadgeContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import { getWorkspaceConfig, normalizeWorkspaceId } from "../../data/workspaces";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Icon,
  useToast,
} from "../ui";
import FoundingBadge from "./FoundingBadge";
import "../../styles/founding.css";

export default function FoundingBadgePanel({ primaryRole }) {
  const {
    availability,
    badges,
    loading,
    error,
    claimingRole,
    claimBadge,
    refresh,
  } = useFoundingBadges();
  const { enabledWorkspaceIds, workspace } = useWorkspace();
  const { showToast } = useToast();
  const normalizedPrimaryRole = normalizeWorkspaceId(primaryRole);

  const handleClaim = async (role) => {
    const result = await claimBadge(role, "workspace_claim");

    if (result?.ok) {
      const number = String(result.badge_number || 0).padStart(3, "0");
      showToast({
        title: "Founding badge claimed",
        message: `You are Founding ${result.role_label || role} Beta Tester #${number}.`,
        variant: "success",
        duration: 6500,
      });
      return;
    }

    showToast({
      title: result?.sold_out ? "Founding places are full" : "Badge not claimed",
      message:
        result?.message ||
        result?.error?.message ||
        "Please try again after checking your connection.",
      variant: result?.sold_out ? "warning" : "error",
      duration: 6500,
    });
  };

  return (
    <Card className="founding-panel">
      <CardHeader
        icon={<Icon name="star" size={19} />}
        title="Founding 150"
        description="Permanent, numbered recognition for the first 150 beta members in each AnyPetOS role."
        action={
          <Badge variant={badges.length ? "success" : "primary"}>
            {badges.length} claimed
          </Badge>
        }
      />

      <div className="founding-panel__intro">
        <div>
          <strong>Your founding status stays on your profile permanently.</strong>
          <p>
            Your primary role is claimed automatically while space remains. You can
            claim an additional role after enabling that workspace and using it for
            your real animal-care work.
          </p>
        </div>
        <span>
          <Icon name="shield" size={17} /> Securely numbered by Supabase
        </span>
      </div>

      {error ? (
        <div className="founding-panel__error" role="alert">
          <Icon name="alert" size={19} />
          <div>
            <strong>Founding status could not load</strong>
            <p>{error.message || "Run the Founding 150 SQL update, then try again."}</p>
          </div>
          <Button size="sm" variant="outline" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : null}

      {badges.length > 0 && (
        <section className="founding-panel__awarded" aria-label="Your awarded badges">
          {badges.map((badge) => (
            <FoundingBadge
              key={badge.role}
              role={badge.role}
              number={badge.badgeNumber}
              awardedAt={badge.awardedAt}
            />
          ))}
        </section>
      )}

      <div className="founding-role-grid">
        {USER_ROLES.map((role) => {
          const status = availability.find((item) => item.role === role.id);
          const claimed = Boolean(status?.badgeNumber);
          const soldOut = !claimed && status?.remainingCount === 0;
          const enabled =
            role.id === normalizedPrimaryRole || enabledWorkspaceIds.includes(role.id);
          const roleWorkspace = getWorkspaceConfig(role.id);
          const isCurrent = workspace.id === role.id;

          return (
            <article
              className={[
                "founding-role-card",
                claimed ? "is-claimed" : "",
                isCurrent ? "is-current" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ "--founding-accent": roleWorkspace.accent }}
              key={role.id}
            >
              <header>
                <span aria-hidden="true">
                  <Icon name={role.icon} size={18} />
                </span>
                <div>
                  <strong>{role.label}</strong>
                  <small>
                    {loading
                      ? "Checking spaces…"
                      : `${status?.claimedCount || 0} of ${status?.capacity || 150} claimed`}
                  </small>
                </div>
                {isCurrent && <Badge variant="info">Current</Badge>}
              </header>

              <div className="founding-role-card__meter" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.min(
                      100,
                      ((status?.claimedCount || 0) / (status?.capacity || 150)) * 100
                    )}%`,
                  }}
                />
              </div>

              <footer>
                {claimed ? (
                  <Badge variant="success" icon={<Icon name="check" size={14} />}>
                    #{String(status.badgeNumber).padStart(3, "0")} secured
                  </Badge>
                ) : soldOut ? (
                  <Badge variant="warning">Founding 150 full</Badge>
                ) : enabled ? (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={claimingRole === role.id}
                    disabled={loading || Boolean(error)}
                    onClick={() => handleClaim(role.id)}
                  >
                    Claim founding spot
                  </Button>
                ) : (
                  <small>Enable this workspace first</small>
                )}
                {!claimed && !soldOut && (
                  <em>{status?.remainingCount ?? 150} remaining</em>
                )}
              </footer>
            </article>
          );
        })}
      </div>

      <p className="founding-panel__fine-print">
        Founding status is not professional verification. Verified breeder, rescue,
        veterinary, education, sitter, and retail credentials will be a separate trust
        layer.
      </p>
    </Card>
  );
}
