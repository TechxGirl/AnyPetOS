import {
  Button,
  Card,
  CardHeader,
  Icon,
  PageHeader,
  ThemeSelector,
} from "../components/ui";

export default function Settings({ user, setUser }) {
  const displayName =
    user?.displayName || user?.username || user?.email || user?.phone || "Guest";
  const logout = () => setUser(null);

  return (
    <div className="feed">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage your account, appearance, and planned workspace options."
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
        {user?.primaryRole && (
          <p>
            <strong>Current mode:</strong> {user.primaryRole}
          </p>
        )}
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
          title="User mode"
          description="Role-specific workspaces are planned for a later development phase."
        />
        <ul>
          <li>Pet Owner</li>
          <li>Breeder</li>
          <li>Rescue</li>
          <li>Veterinarian</li>
          <li>Education / Zoo</li>
          <li>Pet Sitter</li>
        </ul>
      </Card>

      <Card>
        <CardHeader
          icon={<Icon name="sparkles" size={18} />}
          title="Planned settings"
          description="Upcoming personalization, privacy, and data-management tools."
        />
        <ul>
          <li>Reminder notifications</li>
          <li>Cloud sync controls</li>
          <li>Backup and restore</li>
          <li>Data export</li>
          <li>Privacy settings</li>
          <li>Expo mode</li>
        </ul>
      </Card>
    </div>
  );
}
