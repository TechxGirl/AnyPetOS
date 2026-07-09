# PetPassport Real Pet Photos v1 Pack

This pack adds real pet photo support and cleans up the animal card/profile layout.

## What this adds

- Upload a real pet photo while creating a Passport
- Add/change/remove a real pet photo while editing a Passport
- Clean placeholder initials when no photo is uploaded
- Photo privacy toggle for shared/transferred Passports
- Pet cards redesigned with a photo-first layout
- Pet profile modal redesigned with a large photo hero
- Public shared Passport can show the pet photo
- Transfer preview can show the pet photo
- Photos are compressed before saving

## Important beta note

This beta pack stores compressed photos in the pet record data as a data URL. That is okay for beta testing and demos.

For production, the better long-term version should use Supabase Storage with image resizing, permissions, and photo galleries.

## Install

1. Stop Vite with Ctrl + C.
2. Extract this zip.
3. Copy these into your real `pet-passport` folder:
   - `src`
   - `public`
   - `package.json`
   - `package-lock.json`
   - `vite.config.js`
   - `index.html`
4. Choose Replace when Windows asks.
5. Run:

```powershell
npm install
npm run build
npm run dev -- --host
```

## Test

1. Create a new pet and upload a real photo.
2. Confirm the photo appears on the card.
3. Open the profile and confirm the large photo appears.
4. Edit the pet, change the photo, then save.
5. Remove the photo and confirm the clean placeholder appears.
6. Create a share link and confirm the public Passport photo appears.
7. Create a transfer invite with a dummy pet and confirm the transfer preview photo appears.
