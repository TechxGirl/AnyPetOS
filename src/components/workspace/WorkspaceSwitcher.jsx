import { useWorkspace } from "../../context/WorkspaceContextCore";
import { Badge, Button, Card, Icon } from "../ui";

export default function WorkspaceSwitcher({ compact = false, onSelect }) {
  const {
    activeWorkspaceId,
    enabledWorkspaceIds,
    setActiveWorkspace,
    toggleEnabledWorkspace,
    workspaces,
  } = useWorkspace();

  const handleSwitch = (workspaceId) => {
    setActiveWorkspace(workspaceId);
    onSelect?.(workspaceId);
  };

  return (
    <div className={compact ? "workspaceSwitcher workspaceSwitcherPremium compact" : "workspaceSwitcher workspaceSwitcherPremium"}>
      {!compact && (
        <div className="workspaceSwitcherHeader">
          <div>
            <p className="section-eyebrow">Role interfaces</p>
            <h2>Switch the whole app experience</h2>
            <p>
              Enable the roles you use, then switch between them anytime. The active workspace controls your dashboard, navigation, actions, and accent color.
            </p>
          </div>
        </div>
      )}

      <div className="workspaceGrid workspaceGridPremium">
        {workspaces.map((workspace) => {
          const active = workspace.id === activeWorkspaceId;
          const enabled = enabledWorkspaceIds.includes(workspace.id);

          return (
            <Card
              key={workspace.id}
              className={`workspaceCard workspaceCardPremium ${active ? "activeWorkspaceCard activeWorkspaceCardPremium" : ""}`}
              interactive
              style={{ "--workspace-card-accent": workspace.accent }}
            >
              <div className="workspaceCardPremium__statusLine" aria-hidden="true" />

              <div className="workspaceCardPremium__top">
                <span className="workspaceIcon workspaceIconPremium" aria-hidden="true">
                  <Icon name={workspace.icon} size={22} />
                </span>
                <div className="workspaceCardPremium__titleGroup">
                  <h3>{workspace.label}</h3>
                  <p>{workspace.subtitle}</p>
                </div>
                {active && <Badge variant="success">Active</Badge>}
              </div>

              <p className="workspaceCardDescription workspaceCardDescriptionPremium">{workspace.description}</p>

              <div className="workspaceCardPremium__meta">
                <span>{workspace.modules.length} modules</span>
                <span>{enabled ? "Enabled" : "Optional"}</span>
              </div>

              <p className="workspaceBestFor workspaceBestForPremium">
                <strong>Best for</strong>
                <span>{workspace.bestFor}</span>
              </p>

              <div className="workspaceCardActions workspaceCardActionsPremium">
                <Button
                  type="button"
                  size="sm"
                  variant={active ? "secondary" : "primary"}
                  fullWidth
                  leftIcon={<Icon name={active ? "check" : "briefcase"} size={16} />}
                  onClick={() => handleSwitch(workspace.id)}
                >
                  {active ? "Current workspace" : "Switch workspace"}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  fullWidth
                  leftIcon={<Icon name={enabled ? "check" : "plus"} size={16} />}
                  onClick={() => toggleEnabledWorkspace(workspace.id)}
                >
                  {enabled ? "Enabled" : "Enable"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
