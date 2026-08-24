# AnyPetOS Database Architecture

**Last Updated:** August 2026
**Status:** Active Beta Development

---

## Overview

AnyPetOS uses Supabase and PostgreSQL as its primary cloud data layer.

The database supports shared animal Passports, care infrastructure, access controls, Expo Mode, and reusable animal taxonomy data. PostgreSQL Row Level Security (RLS) is used throughout current migration work so authorization is enforced at the database layer rather than only in the frontend.

This document describes the database architecture that is represented in the repository today.

It is not yet a complete from-zero production schema export.

---

## Repository Organization

Database-related SQL is organized under:

```text
supabase/
|-- migrations/
`-- legacy/
```

### migrations/

Contains newer database work that is still relevant to the current AnyPetOS application.

Current migration files include:

```text
ANYPETOS_CARE_INFRASTRUCTURE_V1.sql
ANYPETOS_EXPO_COMMAND_CENTER_V1.sql
PETPASSPORT_MORPH_LIBRARY_V1.sql
PETPASSPORT_BREED_VARIETY_LIBRARY_EXPANSION_V1.sql
```

Some current migration filenames still contain the previous PetPassport project name and will be normalized as the migration history is consolidated.

### legacy/

Contains historical SQL retained for reference.

Current legacy areas include:

```text
legacy/
|-- early-database/
`-- old-transport/
```

Legacy SQL should not be treated as the current production schema or run automatically against a current environment.

---

## Core Animal Relationship

The current migration set expects a central:

```text
public.pets
```

table.

Current care and Expo migrations reference animal records using:

```text
pet_id bigint
```

This means newer AnyPetOS database work is built around a bigint primary key for `public.pets`.

The repository does not yet contain a single canonical migration that creates the entire current application schema from an empty database.

---

## Care Infrastructure

The current care infrastructure migration creates shared systems for managing an animal's environment, equipment, reminders, files, and delegated access.

### enclosures

Stores enclosure records associated with a user and optionally with an animal.

Relationships include:

```text
pet_id -> public.pets(id)
```

Deleting an animal does not automatically delete the enclosure record when the relationship uses `ON DELETE SET NULL`.

RLS is enabled and owner-scoped select, insert, update, and delete policies are defined.

---

### equipment

Stores equipment records.

Equipment can be associated with:

```text
enclosure_id -> public.enclosures(id)
pet_id       -> public.pets(id)
```

RLS is enabled with owner-scoped CRUD policies.

---

### care_reminders

Stores care reminder records associated with animals, enclosures, or equipment.

Relationships include:

```text
pet_id       -> public.pets(id)
enclosure_id -> public.enclosures(id)
equipment_id -> public.equipment(id)
```

Animal deletion cascades to directly associated care reminders.

RLS is enabled with owner-scoped CRUD policies.

---

### pet_files

Stores animal-related file metadata.

Relationships include:

```text
pet_id       -> public.pets(id)
enclosure_id -> public.enclosures(id)
```

The migration also defines storage policies for file access.

RLS is enabled for both database records and related storage access.

---

### access_permissions

Stores delegated access to an animal Passport.

Relationships include:

```text
pet_id -> public.pets(id)
```

The access model distinguishes between the animal owner and an authorized recipient.

Current RLS policies allow:

- Owners to read their access records
- Authorized recipients to read access granted to them
- Owners to create access permissions
- Owners to update access permissions
- Owners to revoke/delete access permissions

This allows delegated care or professional access without relying only on frontend visibility rules.

---

## Expo Mode

The Expo Command Center migration introduces a separate group of tables for in-person animal events.

Current Expo tables include:

```text
expo_events
expo_event_vendors
expo_event_animals
expo_leads
expo_holds
expo_event_follows
expo_listing_favorites
expo_scans
expo_updates
expo_staff
```

### expo_events

Represents an Expo event.

Other Expo records connect back to this table through `event_id`.

---

### expo_event_vendors

Represents vendors or exhibitors associated with an event.

Relationship:

```text
event_id -> public.expo_events(id)
```

---

### expo_event_animals

Connects animals to an Expo event and vendor.

Relationships include:

```text
event_id  -> public.expo_events(id)
vendor_id -> public.expo_event_vendors(id)
pet_id    -> public.pets(id)
```

This keeps Expo listings connected to the animal's existing AnyPetOS Passport instead of creating a separate Expo-only animal record.

---

### expo_leads

Stores leads generated during an event.

Relationships can include:

```text
event_id   -> public.expo_events(id)
listing_id -> public.expo_event_animals(id)
vendor_id  -> public.expo_event_vendors(id)
```

---

### expo_holds

Stores animal/listing hold activity.

Relationships can include:

```text
event_id   -> public.expo_events(id)
listing_id -> public.expo_event_animals(id)
vendor_id  -> public.expo_event_vendors(id)
lead_id    -> public.expo_leads(id)
```

---

### expo_event_follows

Stores event follow relationships.

---

### expo_listing_favorites

Stores favorited Expo animal listings.

Relationships include:

```text
event_id   -> public.expo_events(id)
listing_id -> public.expo_event_animals(id)
```

---

### expo_scans

Stores scan activity related to Expo events and optional listings.

---

### expo_updates

Stores event or vendor updates.

Relationships can include:

```text
event_id   -> public.expo_events(id)
vendor_id  -> public.expo_event_vendors(id)
listing_id -> public.expo_event_animals(id)
```

---

### expo_staff

Stores Expo staff membership and permissions.

---

## Expo Security

RLS is enabled across the current Expo tables.

The current migration includes policy groups for:

- Event members
- Event owners
- Vendors
- Approved vendors
- Animal owners
- Organizers
- Managers
- Staff
- User-owned follows
- User-owned favorites

This provides role-aware access rules at the database layer.

---

## Morph and Breed / Variety Data

### morph_options

The morph library migration creates:

```text
public.morph_options
```

RLS is enabled.

Current policy intent includes:

- Public or broad read access to active morph options
- Authenticated users being able to contribute morph options

A related breed/variety expansion migration adds additional reference data without introducing a separate primary schema system.

---

## Authentication and Authorization

AnyPetOS uses Supabase Authentication.

Current database migrations use:

```text
auth.uid()
```

inside RLS policies to compare the authenticated user with ownership or permission fields.

This is important because hiding a button in React is not sufficient authorization.

Database policies should remain the final authority for whether a user can read or modify protected data.

---

## Deletion Behavior

Current migrations use a mixture of PostgreSQL deletion strategies depending on the relationship.

Examples include:

```text
ON DELETE CASCADE
ON DELETE SET NULL
```

### CASCADE

Used when a child record should not survive without its parent relationship.

### SET NULL

Used when a record may still have value after the related animal, enclosure, or listing relationship is removed.

Deletion rules should be selected intentionally when new schema is added.

---

## Environment Configuration

The frontend currently expects:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Local values belong in:

```text
.env
```

The real `.env` file is excluded from Git.

A safe template is provided in:

```text
.env.example
```

---

## Migration Policy

Until the database history is fully consolidated:

1. Treat `supabase/migrations/` as current migration work, not a guaranteed complete bootstrap sequence.
2. Treat `supabase/legacy/` as historical reference only.
3. Do not assume an old PetPassport SQL file matches the current schema.
4. Verify foreign-key types before applying older SQL.
5. Prefer additive, reviewable migrations over manually changing production schema without documentation.
6. Keep RLS policies versioned alongside the schema they protect.

---

## Current Limitation

The repository does not yet provide one canonical SQL baseline that can recreate the complete live AnyPetOS database from an empty Supabase project.

That is intentional documentation of the current repository state, not a claim that the database consists only of the tables listed in this file.

A future database-cleanup milestone should produce:

- A verified current schema baseline
- Ordered migrations
- Clear migration dependencies
- A repeatable fresh-environment setup process
- Validation of RLS policies
- Documentation of required storage buckets and policies

---

## Guiding Principle

The database should preserve the continuity of an animal's Passport while allowing different caregivers and professional workflows to interact with that record safely.

Schema design should favor:

- Clear ownership
- Explicit permissions
- Durable animal history
- Data portability
- Role-aware access
- Backend-enforced authorization
- Incremental migrations
