# PetPassport Expo Command Center v1

This pack turns Expo Mode into a connected event, exhibitor, public-discovery, kiosk, lead, hold, print, analytics, and Passport-transfer system.

## The central workflow

```text
Organizer creates and publishes an expo
→ PetPassport exhibitors request access
→ Organizer approves exhibitors
→ Exhibitors publish planned animals, prices, and booth details
→ The expo appears in Community Expo Discovery
→ Visitors follow the expo, save animals, compare choices, and build a booth route
→ Visitors show a listing code at the booth
→ Exhibitors manage leads, holds, deposits, and final status
→ Completed sales or adoptions can launch the private Passport transfer
```

## Install

1. Stop Vite by holding Ctrl and tapping C.
2. Extract this zip.
3. Copy these items into the real `pet-passport` project:
   - `src`
   - `public`
   - `package.json`
   - `package-lock.json`
   - `vite.config.js`
   - `index.html`
   - `PETPASSPORT_EXPO_COMMAND_CENTER_V1.sql`
4. Choose **Replace** when Windows asks.
5. Open Supabase.
6. Open **SQL Editor**.
7. Paste and run:

```text
PETPASSPORT_EXPO_COMMAND_CENTER_V1.sql
```

8. Return to the project terminal and run:

```powershell
npm install
npm run build
npm run dev -- --host
```

## Expected SQL result

The final query should return a row similar to:

```text
Expo Command Center v1 installed | 10
```

Supabase may also show notices about existing extensions, policies, or triggers when the SQL is rerun. Those notices are expected.

## Strict test order

### A. Regression safety

1. Confirm existing animals load.
2. Open an animal Passport.
3. Confirm Passport sharing still works.
4. Confirm temporary access still works.
5. Confirm ownership transfer still opens.

### B. Organizer event setup

1. Open **Expo Mode**.
2. Create a test event.
3. Use:
   - Status: Published
   - Public: enabled
   - Inventory release: now or blank
   - A future event date
4. Add venue, city, public hours, and booth number.
5. Add an optional logo URL and banner URL.
6. Set a kiosk PIN.
7. Save.

### C. Publish inventory

1. Add a cloud-synced test animal.
2. Enter price, deposit, booth location, care level, feeding information, temperament, genetics/lineage, and included supplies.
3. Publish the listing.
4. Confirm it receives a listing code, public link, and QR code.

### D. Public Community discovery

1. Open **Community**.
2. Confirm the expo appears.
3. Confirm featured animals show price, exhibitor, booth, and listing code.
4. Follow the expo.
5. Open the expo.

### E. Visitor planning

1. Save two or more animals.
2. Confirm **My Expo Plan** appears.
3. Confirm saved animals are sorted by booth.
4. Confirm the estimated budget appears when prices are public.
5. Compare up to three animals.
6. Open **Show at booth** and confirm the large listing code.

### F. Interest and lead management

1. Open the public expo in an incognito window.
2. Submit an interest form.
3. Return to the owner/exhibitor account.
4. Confirm the lead appears.
5. Move the lead through statuses.

### G. Holds and completion

1. Create a temporary hold.
2. Set its expiration.
3. Mark the deposit paid.
4. Release one test hold.
5. Complete another as Sold or Adopted.
6. Confirm the public listing status updates.

### H. Passport transfer

Use a dummy animal for this test.

1. Complete a sale/adoption.
2. Generate the private Passport transfer.
3. Open the transfer QR/link with a second account.
4. Confirm the existing transfer flow still works.

### I. Multi-exhibitor test

1. Sign in with a second PetPassport account.
2. Open Expo Mode.
3. Join using the public expo slug/link.
4. Request exhibitor access.
5. Return to the organizer account.
6. Approve the exhibitor.
7. Return to the second account.
8. Publish a planned animal and price.
9. Confirm both exhibitors appear in the public catalog.

### J. Kiosk and print

1. Open Kiosk Mode.
2. Confirm search, filters, compare, interest, and booth lookup work.
3. Test the inactivity reset.
4. Confirm visitor form details clear when the kiosk resets.
5. Test the kiosk exit PIN.
6. Print cage cards, QR labels, the event catalog, care cards, and the staff checklist.

### K. Analytics and after-event flow

1. Open public event and animal links several times.
2. Save listings and submit test leads.
3. Refresh the manager dashboard.
4. Confirm scan, follow, favorite, lead, hold, and completion counts.
5. Export leads CSV.
6. Duplicate the event.
7. Archive the original test event.

## Important v1 boundaries

- Prices, deposits, and payment status are manually recorded. Stripe or card processing is not included yet.
- Following is cloud-synced for signed-in users. Anonymous visitors are saved on their current device.
- Following does not yet send push notifications, SMS, or email alerts.
- Public catalogs refresh every 30 seconds. Kiosk Mode refreshes every 15 seconds.
- Event logo and banner v1 use image URLs.
- Staff database foundations exist, but a complete staff invitation and permission interface is a later phase.
- Use dummy animals for transfer testing.
- Public snapshots exclude private health histories, medication records, internal timelines, owner IDs, and private files.
- The production frontend build passed. The SQL must still be run and validated inside the project's Supabase instance.
