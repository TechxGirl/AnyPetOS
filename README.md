# AnyPetOS

**Animal care, records, and operations in one shared platform.**

AnyPetOS is a multi-role animal care and management application designed for pet owners, breeders, rescues, veterinary professionals, pet sitters, and education or zoo organizations.

Rather than treating every animal-care workflow as a separate application, AnyPetOS is built around one persistent animal Passport and a shared platform architecture. Care records, ownership history, medications, feeding, files, access, and professional workflows can all build on the same underlying animal record.

> **Status:** Active beta development

---

## Why I Built It

Animal records are often scattered across notebooks, spreadsheets, breeder software, veterinary portals, text messages, and memory.

That becomes especially difficult when an animal changes owners, receives ongoing medication, has multiple caregivers, or belongs to a breeder, rescue, or professional organization.

AnyPetOS is being built around a different idea:

**The animal's history should not have to start over every time the person or organization caring for it changes.**

The core product is therefore the animal Passport: a persistent digital record that can support both everyday care and more specialized workflows.

---

## Current Capabilities

### Animal Management

- Create and manage animal profiles
- Photos and profile information
- Species and morph/breed selection
- Favorites and collection organization
- Persistent animal records
- Dashboard and collection views

### Care Tracking

- Feeding logs
- Weight tracking
- Shed tracking
- Medication schedules and dose logging
- Care timelines
- Calendar-based care visibility
- Care guides

### Care Infrastructure

- Enclosure records
- Equipment records
- Smart reminders
- Animal-related file storage
- Access management

### Passport Sharing and Transfer

- Public Passport views
- Shareable Passport links
- Access invitation flows
- Ownership-transfer workflows
- Transfer signature capture
- Transfer receipts

### Expo Mode

AnyPetOS includes an Expo Command Center designed for animal expos and in-person events.

Current code includes support for:

- Expo event management
- Event animal lists
- Public Expo views
- Public listings
- Kiosk-oriented Expo views
- Passport transfer workflows from Expo Mode

### Data and Organization

- Data Center
- Import/export utilities
- Workspace switching
- Light and dark appearance modes
- Mobile and desktop navigation
- Beta feedback tools

### Additional Application Areas

The application also currently includes routed interfaces for:

- AI Assistant
- Community
- Professional tools
- Roadmap and launch planning

Some of these areas remain under active beta development.

---

## Workspace System

AnyPetOS is designed as one platform with different workflows for different types of animal caregivers.

### Owner

Current focus includes:

- Dashboard
- Care timeline
- Feeding, shed, weight, and medication logs
- Passport sharing

Planned expansion includes care planning, notifications, and pet-sitter care sheets.

### Breeder

Current focus includes:

- Collection organization
- Favorites
- Sale and holdback status
- Ownership transfer

Planned expansion includes pairing records, clutch/hatchling management, and a sales pipeline.

### Rescue

Current focus includes:

- Status indicators
- Medication tracking
- Medical history
- Adoption transfer

Planned expansion includes intake forms, rehabilitation plans, and adoption workflows.

### Veterinary

Current focus includes:

- Medication history
- Weight history
- Care timeline
- Shared Passport review

Planned expansion includes patient views, treatment plans, and visit summaries.

### Education / Zoo

Current focus includes:

- Collection organization
- Public-safe Passport sharing
- Care notes

Planned expansion includes program scheduling, ambassador profiles, and staff access.

### Pet Sitter

Current focus includes:

- Read-only Passport links
- Care summaries
- Medication schedules

Planned expansion includes visit scheduling, care reports, and client management.

---

## Technology Stack

### Frontend

- React
- React Router
- Vite
- JavaScript / JSX
- CSS

### Backend and Data

- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security
- Cloud-backed application data

### Additional Libraries

- QR code generation
- ESLint
- React Hooks

### Deployment

- Vercel

---

## Application Architecture

AnyPetOS follows a layered React architecture.

```text
src/
├── components/   Reusable UI and application components
├── constants/    Shared application constants
├── context/      Global application state
├── data/         Animal, care, workspace, and product data
├── hooks/        Reusable business logic
├── layouts/      Application layouts
├── pages/        Top-level application screens
├── services/     External service integrations
├── styles/       Shared styling and design tokens
└── utils/        Pure utility and transformation functions

```

---

## Getting Started

### Prerequisites

- Node.js
- npm
- A Supabase project

### Clone the Repository

```bash
git clone https://github.com/TechxGirl/AnyPetOS.git
cd AnyPetOS
```

### Install Dependencies

```bash
npm ci
```

### Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then provide the required Supabase values:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Local `.env` files are excluded from version control.

### Start the Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

---

## Database

AnyPetOS uses Supabase and PostgreSQL for application data, authentication, database functions, and access control.

Database-related SQL is organized under:

```text
supabase/
├── migrations/   Current feature and database migrations
└── legacy/       Historical SQL retained for migration context
```

See [`supabase/README.md`](supabase/README.md) for additional details.

The repository does not currently provide a single migration that recreates the complete production database from an empty Supabase project.

---

## Development Quality

The current repository is maintained with:

- ESLint validation
- Production build verification
- Dependency vulnerability auditing
- Route-level lazy loading
- Vendor code splitting for React and Supabase
- Environment files excluded from version control

---

## Project Status

AnyPetOS is under active beta development.

The repository represents an evolving production-oriented application, so some interfaces and workflows are still being expanded or refined.

## Copyright & Usage

Copyright © 2026 Morgan Mendoza. All Rights Reserved.

This project is publicly visible for portfolio, demonstration, and evaluation
purposes. No permission is granted to copy, redistribute, modify, republish,
commercialize, or incorporate this source code into another project without
prior written permission.

Third-party dependencies remain subject to their respective licenses.
