# Care Infrastructure v1 Changelog

## Added

### Enclosures
- New Enclosures page/tab
- Create enclosure records
- Track type, size, location, assigned animal, temps, humidity, substrate, cleaning interval, last cleaned date, and notes
- Delete enclosure records

### Equipment
- New Equipment page/tab
- Create equipment records
- Track thermostats, heat lamps, UVB bulbs, filters, pumps, mist systems, timers, thermometers, hygrometers, and more
- Assign equipment to an enclosure and/or animal
- Track next due/replacement date
- Delete equipment records

### Smart Reminders
- New Smart Reminders page/tab
- Reminder types for feeding, medication, weight checks, cleaning, UVB replacement, vet visits, quarantine checks, and custom tasks
- Repeat every X days
- Due today / overdue / upcoming status calculation
- Complete, skip, and delete reminders
- Repeating reminders automatically roll forward when completed

### Files + Supabase Storage
- New Files page/tab
- Private Supabase Storage bucket: `pet-files`
- Upload photos, vet records, receipts, test results, care sheets, transfer documents, enclosure photos, and other files
- Attach files to animals and/or enclosures
- Open uploaded files with a temporary signed URL
- Delete uploaded files

### Permission-Based Access
- New Access Center page/tab
- Create temporary access invites
- Access levels:
  - View only
  - Care logging
  - Medical view
  - Medical editing
  - Sitter access
  - Foster access
  - Vet access
- Expiration options
- Copy access invite links
- Public access invite preview route
- Signed-in users can accept access invites
- Owners can revoke invites

## Updated

- Sidebar/workspace navigation now includes:
  - Enclosures
  - Equipment
  - Smart Reminders
  - Files
  - Access Center
- Pet profile now has Files and Access buttons.
- Passport transport utilities now support `/passport/access/:token`.

## SQL

Included:
- `PETPASSPORT_CARE_INFRASTRUCTURE_V1.sql`

Creates:
- `public.enclosures`
- `public.equipment`
- `public.care_reminders`
- `public.pet_files`
- `public.access_permissions`
- private `pet-files` Supabase Storage bucket
- storage object policies
- `get_access_invite_by_token`
- `accept_access_invite`

## Preserved

- Pet photos
- Care guides
- Smart feeding
- Morph/breed/variety library
- Data Center imports
- Workspace actions
- Share/revoke/regenerate
- Ownership transfer
