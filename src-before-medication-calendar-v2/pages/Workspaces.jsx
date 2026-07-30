import { useWorkspace } from "../context/WorkspaceContext";
import { WorkspaceSwitcher } from "../components/workspace";
import { Button, Card, Icon, PageHeader } from "../components/ui";

const CHANGE_CARDS = [
  {
    title: "Navigation",
    description:
      "The sidebar becomes job-specific, so breeders see sales and pairings while rescues see intake, rehab, and adoptions.",
    icon: "dashboard",
  },
  {
    title: "Dashboard",
    description:
      "The home page focuses on the daily work that matters most for that role instead of one generic care screen.",
    icon: "calendar",
  },
  {
    title: "Language",
    description:
      "Animals can be pets, patients, ambassadors, inventory, fosters, or client animals depending on context.",
    icon: "notes",
  },
  {
    title: "Permissions",
    description:
      "This creates the foundation for sitter access, foster access, staff roles, clinic access, and organization accounts.",
    icon: "shield",
  },
];

export default function Workspaces({ pets = [], setPage }) {
  const { workspace, workspaces, enabledWorkspaceIds } = useWorkspace();

  return (
    <div className="feed workspacePage workspacePagePremium">
      <PageHeader
        eyebrow="Workspaces"
        title="Choose how AnyPetOS works for you"
        description="One account can shift between owner, breeder, rescue, veterinary, education, sitter, and retail interfaces. Each workspace changes the navigation, dashboard, actions, and language."
        icon={<Icon name="briefcase" size={22} />}
      />

      <section className="workspaceHero workspaceHeroPremium" style={{ "--workspace-card-accent": workspace.accent }}>
        <div className="workspaceHeroPremium__copy">
          <span className="workspaceHeroPremium__eyebrow">Current interface</span>
          <h1>{workspace.label}</h1>
          <p>{workspace.description}</p>
          <div className="workspaceHeroPremium__actions">
            <Button
              type="button"
              size="sm"
              leftIcon={<Icon name="dashboard" size={16} />}
              onClick={() => setPage("Dashboard")}
            >
              Open dashboard
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              leftIcon={<Icon name="settings" size={16} />}
              onClick={() => setPage("Settings")}
            >
              Workspace settings
            </Button>
          </div>
        </div>

        <div className="workspaceHeroStats workspaceHeroStatsPremium" aria-label="Workspace overview">
          <span>
            <strong>{pets.length}</strong>
            <small>Passports</small>
          </span>
          <span>
            <strong>{enabledWorkspaceIds.length}</strong>
            <small>Enabled</small>
          </span>
          <span>
            <strong>{workspace.modules.length}</strong>
            <small>Modules</small>
          </span>
        </div>
      </section>

      <Card className="workspacePanel workspacePanelSwitcher">
        <WorkspaceSwitcher />
      </Card>

      <Card className="workspacePanel workspaceChangePanel">
        <div className="workspacePanelHeader">
          <span className="workspacePanelIcon" aria-hidden="true">
            <Icon name="dashboard" size={20} />
          </span>
          <div>
            <p className="section-eyebrow">What changes when you switch?</p>
            <h2>Different jobs deserve different interfaces.</h2>
            <p>
              AnyPetOS keeps the same animal records underneath, but the workspace changes the way each role manages care, records, and transfers.
            </p>
          </div>
        </div>

        <div className="workspaceExplainerGrid workspaceExplainerGridPremium">
          {CHANGE_CARDS.map((item) => (
            <div className="workspaceExplainer workspaceExplainerPremium" key={item.title}>
              <span aria-hidden="true"><Icon name={item.icon} size={18} /></span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <section className="workspaceLibrary">
        <div className="workspaceLibraryHeader">
          <div>
            <p className="section-eyebrow">Workspace library</p>
            <h2>Preview every role interface</h2>
            <p>Jump into professional modules without changing accounts. Each card uses its own accent color and workflow language.</p>
          </div>
        </div>

        <div className="workspaceModuleGrid workspaceModuleGridPremium">
          {workspaces.map((item) => (
            <Card key={item.id} className="workspaceSummaryCard workspaceSummaryCardPremium" style={{ "--workspace-card-accent": item.accent }}>
              <div className="workspaceSummaryCardPremium__top">
                <span className="workspaceIcon" aria-hidden="true">
                  <Icon name={item.icon} size={20} />
                </span>
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.subtitle}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setPage("Dashboard")}>Preview</Button>
              </div>

              <div className="workspaceModuleList workspaceModuleListPremium">
                {item.modules.map((module) => (
                  <button key={module.page} type="button" onClick={() => setPage(module.page)}>
                    <Icon name={module.icon} size={15} />
                    <span>{module.title}</span>
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
