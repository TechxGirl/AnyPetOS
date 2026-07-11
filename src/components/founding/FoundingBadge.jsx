import { Icon } from "../ui";
import { USER_ROLES } from "../../constants/roles";
import { getWorkspaceConfig, normalizeWorkspaceId } from "../../data/workspaces";
import "../../styles/founding.css";

function getRole(roleId) {
  const normalized = normalizeWorkspaceId(roleId);
  return (
    USER_ROLES.find((role) => role.id === normalized) || {
      id: normalized,
      label: "Community Member",
      icon: "star",
    }
  );
}

export default function FoundingBadge({
  role,
  number,
  awardedAt,
  compact = false,
  className = "",
}) {
  const roleInfo = getRole(role);
  const workspace = getWorkspaceConfig(roleInfo.id);
  const numberLabel = String(number || 0).padStart(3, "0");
  const joinedLabel = awardedAt
    ? new Date(awardedAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "Private beta";

  return (
    <div
      className={[
        "founding-badge",
        compact ? "founding-badge--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--founding-accent": workspace.accent }}
      title={`Founding ${roleInfo.label} Beta Tester #${numberLabel} of 150`}
    >
      <span className="founding-badge__seal" aria-hidden="true">
        <Icon name={roleInfo.icon || "star"} size={compact ? 15 : 20} />
      </span>
      <span className="founding-badge__copy">
        <small>Founding {roleInfo.label}</small>
        <strong>Beta Tester #{numberLabel}</strong>
        {!compact && <em>First 150 • {joinedLabel}</em>}
      </span>
    </div>
  );
}
