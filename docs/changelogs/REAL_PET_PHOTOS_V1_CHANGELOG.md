# Real Pet Photos v1 Changelog

## Added

- `src/utils/images.js`
  - image compression helper
  - pet photo URL helper
  - initials fallback helper

- `src/components/PetPhotoUploader.jsx`
  - reusable real-photo upload component
  - upload/change/remove photo actions
  - compressed preview

## Updated

- `normalizePet`
  - preserves `photo`
  - preserves `includePhotoInPassport`

- `AddPet`
  - upload photo while creating a Passport
  - choose whether photo is included in shared/transferred Passport

- `EditPetModal`
  - change/remove photo
  - update public Passport photo privacy

- `PetCard`
  - redesigned with photo-first layout
  - cleaner details
  - better action grid

- `PetProfile`
  - larger hero photo section
  - cleaner identity header

- `passportTransport`
  - includes pet photo in public snapshot only when allowed

- `PublicPassportView`
  - displays shared pet photo

- `TransferPassportView`
  - displays pet photo in transfer preview

- `App.css`
  - real photo uploader styles
  - polished pet card layout
  - pet profile hero styles
  - public/transfer photo styles

## Not included yet

- Supabase Storage upload
- Photo gallery
- Vet/medical document images
- Molt/shed photo logs
- Permission-level photo controls beyond profile photo include/exclude
