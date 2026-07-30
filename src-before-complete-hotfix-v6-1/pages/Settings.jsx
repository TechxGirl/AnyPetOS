import { useWorkspace } from "../context/WorkspaceContext";
import { WorkspaceSwitcher } from "../components/workspace";
import { FoundingBadgePanel } from "../components/founding";
import {
  Button,
  Card,
  CardHeader,
  Icon,
  PageHeader,
  ThemeSelector,
} from "../components/ui";

export default function Settings({ user, profile, setUser }) {
  const { workspace, enabledWorkspaceIds } = useWorkspace();
  const displayName =
    user?.displayName || user?.username || user?.email || user?.phone || "Guest";
  const logout = () => setUser(null);

  return (
    <div className="feed">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage your account, appearance, and active PetPassport interface."
        icon={<Icon name="settings" size={22} />}
      />

      <Card>
        <CardHeader
          icon={<Icon name="user" size={18} />}
          title="Account"
          description="The profile currently connected to this workspace."
        />
        <p>
          <strong>Logged in as:</strong> {displayName}
        </p>
        {user?.username && (
          <p>
            <strong>Username:</strong> @{user.username}
          </p>
        )}
        <p>
          <strong>Active workspace:</strong> {workspace.label}
        </p>
        <p>
          <strong>Enabled workspaces:</strong> {enabledWorkspaceIds.length}
        </p>
        <div className="buttonRow">
          <Button
            variant="outline"
            leftIcon={<Icon name="logout" size={16} />}
            onClick={logout}
          >
            Log out
          </Button>
        </div>
      </Card>

      <FoundingBadgePanel primaryRole={profile?.role || user?.primaryRole} />

      <Card>
        <WorkspaceSwitcher />
        <p className="settingsHelperText">
          Workspace changes are saved on this device for beta. A later backend pass will sync enabled workspaces, staff permissions, and default roles to Supabase profiles.
        </p>
      </Card>

      <Card>
        <CardHeader
          icon={<Icon name="sun" size={18} />}
          title="Appearance"
          description="Choose the workspace theme that is most comfortable for you."
        />
        <ThemeSelector />
        <p className="settingsHelperText">
          Your selection is saved on this device and applied before PetPassport
          opens, preventing a bright or dark flash during startup.
        </p>
      </Card>

      <Card>
        <CardHeader
          icon={<Icon name="shield" size={18} />}
          title="Security and role permissions"
          description="The next permission layer will control what each person can view, edit, log, or transfer."
        />
        <ul>
          <li>View-only Passport sharing</li>
          <li>Care logging access for sitters and fosters</li>
          <li>Medical record access for veterinary review</li>
          <li>Temporary access with expiration dates</li>
          <li>Team roles for rescues, stores, clinics, and education programs</li>
        </ul>
      </Card>

      <Card>
        <CardHeader
          icon={<Icon name="database" size={18} />}
          title="Data and import roadmap"
          description="The Data Center will become the home for MorphMarket exports, spreadsheets, backups, and bulk migration."
        />
        <ul>
          <li>MorphMarket CSV/export import with column mapping</li>
          <li>Generic spreadsheet import preview</li>
          <li>Duplicate detection by IDs, names, species, morphs, and dates</li>
          <li>Backup JSON export and restore preview</li>
          <li>Saved import templates for breeders, rescues, vets, and stores</li>
        </ul>
      </Card>
    </div>
  );
}
