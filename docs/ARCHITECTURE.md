# AnyPetOS Architecture

**Version:** 3.0
**Last Updated:** August 2026
**Status:** Active Beta Development

---

## Overview

AnyPetOS is a multi-role animal care and management platform built around a persistent digital animal Passport.

The application is designed as one shared platform rather than separate applications for pet owners, breeders, rescues, veterinary professionals, pet sitters, and education or zoo organizations.

Each workspace can expose different workflows while sharing the same underlying animal records, application services, and cloud infrastructure.

---

## Architectural Goals

AnyPetOS should remain:

- Modular
- Maintainable
- Mobile-friendly
- Role-aware
- Cloud-backed
- Secure by default
- Easy to extend with new animal-care workflows

New features should strengthen the shared Passport and workspace ecosystem rather than create disconnected systems.

---

## Technology Stack

### Frontend

- React
- JavaScript / JSX
- React Router
- Vite
- CSS

### Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security
- Cloud-backed application data

### Deployment

- Vercel

---

## Source Structure

```text
src/
|-- components/
|-- constants/
|-- context/
|-- data/
|-- hooks/
|-- layouts/
|-- pages/
|-- services/
|-- styles/
|-- utils/
|-- App.jsx
`-- main.jsx
```

### components/

Reusable user-interface and application components.

Examples include:

- Pet cards
- Modals
- Form controls
- Navigation
- Medication interfaces
- Passport-sharing tools
- Workspace controls

Reusable UI primitives are organized under:

```text
src/components/ui/
```

Application-level states and infrastructure components are organized under:

```text
src/components/app/
```

---

### pages/

Top-level application screens.

Current routed application areas include:

- Dashboard
- Pets
- Favorites
- Add Pet
- Timeline
- Medications
- Calendar
- Care Guides
- AI Assistant
- Workspaces
- Data Center
- Expo Mode
- Community
- Care Infrastructure
- Settings
- Beta Feedback

Some pages remain under active beta development.

---

### hooks/

Reusable business and data-access logic.

Current examples include:

```text
usePets()
useProfile()
useExpoMode()
useCareInfrastructure()
useMorphLibrary()
useAsyncAction()
```

Hooks should be used when logic needs to be shared, isolated, or kept out of presentation-heavy components.

---

### context/

Global or broadly shared application state.

Current contexts include:

- Pet state
- Workspace state
- Theme state
- Modal state
- Founding badge state

Context should be used for application-wide state when passing data through many component layers would otherwise create unnecessary prop drilling.

---

### services/

External service integrations.

Current services include:

```text
src/services/supabaseClient.js
```

External APIs and infrastructure integrations should be centralized where practical so application components do not become tightly coupled to service implementations.

---

### utils/

Reusable transformations and helper functions.

Examples include:

- Age calculation
- Feeding schedule calculation
- Date formatting
- Animal normalization
- Import/export processing
- Medication scheduling
- Navigation persistence
- Passport transport
- Transfer receipts
- Animal insights

Utilities should remain as predictable and side-effect-free as practical.

---

### data/

Structured application and domain data.

Current examples include:

- Animal taxonomy
- Morph library
- Care guides
- Feeding options
- Care profiles
- Workspace data
- Expo Mode data
- Status definitions
- Product roadmap data

---

### constants/

Shared application constants such as:

- Roles
- Limits
- Workspace configuration
- Application values
- Route-related values

Constants should reduce duplicated strings and configuration scattered throughout the codebase.

---

## Application Flow

A common AnyPetOS interaction follows this general flow:

```text
User interaction
      |
      v
React component
      |
      v
Context or hook
      |
      v
Service / utility
      |
      v
Supabase
      |
      v
Updated application state
      |
      v
React re-render
```

Not every feature must follow this exact sequence, but UI rendering, reusable business logic, data access, and external services should remain separated where practical.

---

## Application Routing

Authenticated application pages are primarily selected through the shared page-rendering system.

`PageRenderer.jsx` currently routes major application areas including animal management, care records, workspaces, Expo Mode, Community, and settings.

Some heavier application areas use lazy loading to avoid increasing the initial application bundle unnecessarily.

Current lazy-loaded examples include:

- Expo Mode
- Community

---

## Public Routes

AnyPetOS also supports routes that exist outside the normal authenticated application interface.

Current public transport flows include:

### Public Passport

Allows an animal Passport to be shared through a tokenized public route.

### Access Invitation

Allows another person to receive scoped access through an invitation route.

### Passport Transfer

Supports transfer of an animal Passport between parties.

### Public Expo

Supports public Expo pages, listings, and kiosk-oriented views.

These routes are resolved before the main authenticated application interface is rendered.

---

## Passport Model

The Passport is the central product concept in AnyPetOS.

A Passport represents the ongoing digital history of an animal.

Depending on the available data and enabled features, a Passport can contain or connect to information such as:

- Identity
- Species
- Morph or breed
- Sex
- Age
- Photos
- Ownership
- Feeding
- Weight history
- Medication history
- Shed history
- Care timeline
- Enclosures
- Equipment
- Files
- Access permissions
- Sharing
- Transfer history

Future functionality should continue building around this persistent animal record.

---

## Workspace Architecture

AnyPetOS currently defines six primary workspace types.

### Owner

Focused on everyday animal care and personal pet records.

### Breeder

Focused on collection organization, animal status, and transfer workflows.

### Rescue

Focused on care history, medical tracking, rehabilitation, and adoption workflows.

### Veterinary

Focused on reviewing relevant medical, medication, weight, and care history.

### Education / Zoo

Focused on managed collections, ambassador animals, public-safe information, and staff workflows.

### Pet Sitter

Focused on care instructions, medication schedules, summaries, and delegated access.

Workspace configuration is shared rather than implemented as six unrelated applications.

---

## Care Infrastructure

AnyPetOS contains shared care-infrastructure systems for:

- Enclosures
- Equipment
- Smart reminders
- Animal files
- Access management

These systems are designed to support multiple workspaces while remaining connected to the same animal records.

---

## Data and Database Architecture

Supabase provides the primary cloud data layer.

Database-related files are organized under:

```text
supabase/
|-- migrations/
`-- legacy/
```

### migrations/

Contains newer AnyPetOS database work.

### legacy/

Contains historical database patches and older implementations retained for reference.

Legacy SQL must not be assumed to represent the current production schema.

A canonical from-zero database baseline is still being developed as the application and migration history are consolidated.

---

## Security Model

AnyPetOS uses Supabase Authentication and PostgreSQL Row Level Security as core parts of its security model.

Security decisions should follow these principles:

- Users should only access data they are authorized to access.
- Public links should expose only intentionally shared information.
- Transfer and access systems should use scoped tokens or permissions.
- Secrets must never be committed to the repository.
- Environment-specific configuration should remain outside source control.
- Database policies should enforce authorization server-side rather than relying only on UI restrictions.

The local `.env` file is ignored by Git.

Public configuration requirements are documented using:

```text
.env.example
```

---

## Environment Configuration

The frontend currently uses:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

These values are supplied through the local environment and are not committed directly to the repository.

---

## Theme Architecture

AnyPetOS supports light and dark appearance modes.

Theme state is managed through the shared theme context and utility system.

Relevant files include:

```text
src/context/ThemeContext.jsx
src/utils/theme.js
src/styles/tokens.css
src/components/ui/ThemeSelector.jsx
```

Design tokens should be preferred over duplicating theme-specific styling throughout individual components.

---

## Import and Export Architecture

AnyPetOS includes import/export utilities intended to reduce the need for users to manually rebuild existing animal collections.

The broader import architecture is intended to support:

- Data validation
- Preview
- Duplicate detection
- Field mapping
- Progress feedback
- Safe failure handling

Additional import formats and migration tools remain under development.

---

## Performance

Performance should be considered as AnyPetOS continues growing.

Current strategies include:

- Lazy loading larger application areas
- Reusable components
- Shared hooks and data access logic
- Avoiding unnecessary duplication across workspaces

Large application modules should be progressively refactored when their size begins to make maintenance or performance more difficult.

---

## Development Principles

### Keep presentation separate from business logic

Components should primarily focus on rendering and interaction.

Complex reusable logic should move into hooks, services, utilities, or dedicated domain modules.

### Prefer shared systems over duplicate implementations

Workspace-specific experiences should reuse the common AnyPetOS platform whenever possible.

### Preserve animal history

Features involving ownership, caregivers, or organizations should avoid unnecessarily breaking the continuity of an animal's Passport.

### Treat security as architecture

Authorization should be enforced by the backend and database, not only through hidden buttons or frontend checks.

### Refactor incrementally

Large working modules should be improved carefully rather than rewritten without a clear reason.

### Document implemented behavior separately from planned behavior

The repository should distinguish between:

- Implemented
- Beta
- Planned
- Historical

This helps contributors and reviewers understand the actual state of the product.

---

## Long-Term Direction

AnyPetOS is intended to become an operating layer for animal care rather than a collection of disconnected tracking features.

The architecture should continue supporting:

- Persistent animal records
- Multiple caregiver types
- Professional workflows
- Secure sharing
- Ownership continuity
- Care automation
- Data portability
- Species-aware experiences
- Future authorized integrations

The guiding architectural question remains:

> Does this strengthen the animal Passport and make care easier to manage?

If not, the feature should be reconsidered before becoming part of the core platform.
