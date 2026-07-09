# True Workspace System Changelog

## Added

### Workspace infrastructure
- `WorkspaceProvider`
- `useWorkspace`
- Workspace configs for owner, breeder, rescue, veterinary, education/zoo, pet sitter, and retail/pet shop
- Active workspace local persistence
- Enabled workspace local persistence
- Workspace accent CSS variable

### UI
- Workspace switcher component
- Workspaces page
- Role-specific sidebar navigation
- Role-specific dashboard cards
- Workspace quick actions
- Workspace-specific pipeline snapshot
- Settings workspace management
- Retail / Pet Shop onboarding option

### Pages
- Generic professional module page surface for roadmap modules
- Data Center foundation page surface
- Transfer, expo, rescue, breeder, veterinary, education, sitter, and retail workflow surfaces

### Roadmap foundation
- Prepared the app for:
  - MorphMarket CSV/import flow
  - Spreadsheet mapping
  - Duplicate detection
  - Permissions and temporary access
  - Breeder sales pipeline
  - Rescue intake/quarantine/rehab
  - Vet records
  - Education public profiles
  - Pet sitter care reports
  - Retail inventory/customer transfer workflows

## Preserved
- Supabase auth/profile flow
- Cloud pet loading
- Share Passport links
- Revoke link
- Regenerate link
- Ownership transfer invite and accept flow
- Public Passport view
- Local network crypto fix

## Build result

`npm run build` passed. Vite still reports a large chunk warning, which is not a beta blocker. Code splitting can be handled in a later performance pass.
