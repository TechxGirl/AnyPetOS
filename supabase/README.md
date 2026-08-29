# Supabase Database Files

AnyPetOS uses Supabase for authentication, persistence, database functions, and application data.

This directory separates current database work from historical SQL retained for reference.

## Directory Structure

### `migrations/`

Contains current AnyPetOS database migrations and feature-level SQL.

Current examples include:

- `ANYPETOS_CARE_INFRASTRUCTURE_V1.sql`
- `ANYPETOS_EXPO_COMMAND_CENTER_V1.sql`
- `PETPASSPORT_MORPH_LIBRARY_V1.sql`
- `PETPASSPORT_BREED_VARIETY_LIBRARY_EXPANSION_V1.sql`

Some filenames still use the original PetPassport project name because they were created before the application was renamed to AnyPetOS.

### `legacy/`

Contains historical SQL retained for development reference and migration context.

#### `legacy/early-database/`

Early database setup files from the original project architecture.

#### `legacy/old-transport/`

Older passport-sharing and transport-related SQL that is no longer treated as the current implementation.

## Important

These files document the evolution of the AnyPetOS database.

The repository does not currently provide a single one-command database bootstrap migration for creating the entire production schema from scratch.

Environment-specific credentials and local `.env` files are intentionally excluded from version control.