# PetPassport Beta Transport Test Checklist

## Before replacing files

- [ ] Commit current work:
  ```powershell
  git add .
  git commit -m "checkpoint: before beta transport pack"
  git push
  ```

## Install

- [ ] Replace the project files with this pack.
- [ ] Run:
  ```powershell
  npm install
  ```
- [ ] Run the Supabase SQL file:
  ```text
  PETPASSPORT_BETA_TRANSPORT_SUPABASE.sql
  ```
- [ ] Start the app:
  ```powershell
  npm run dev
  ```

## Known regression tests

- [ ] Create a Ball Python and confirm food/substrate/frequency autofill.
- [ ] Create a Boa Constrictor and confirm generic snake options autofill.
- [ ] Create a Crested Gecko and confirm generic lizard options autofill.
- [ ] Open feeding modal and confirm the food dropdown appears.
- [ ] Add a food from dropdown.
- [ ] Add a custom food.
- [ ] Save feeding and refresh.
- [ ] Confirm feeding persists.

## Share link tests

- [ ] Open a pet profile.
- [ ] Click Share Passport.
- [ ] Choose Buyer / adopter view.
- [ ] Click Create share link.
- [ ] Confirm QR code appears.
- [ ] Click Copy link.
- [ ] Paste link in a private/incognito browser.
- [ ] Confirm Passport opens without signing in.
- [ ] Confirm shared page is read-only.
- [ ] Revoke link.
- [ ] Refresh the old public link.
- [ ] Confirm it no longer works.

## Text/email tests

- [ ] Click Text.
- [ ] Confirm message contains link.
- [ ] Click Email.
- [ ] Confirm email draft contains link.

## Transfer invite tests

- [ ] Open Share Passport modal.
- [ ] Click Create transfer invite.
- [ ] Copy transfer link.
- [ ] Open transfer link in incognito.
- [ ] Confirm Passport preview appears without signup.
- [ ] Sign in as a different account.
- [ ] Click Accept transfer.
- [ ] Confirm success message.
- [ ] Open dashboard on buyer account.
- [ ] Confirm pet appears.
- [ ] Sign back into seller account.
- [ ] Confirm pet no longer appears after refresh.

## Two-account privacy test

- [ ] Account A cannot see Account B private pets.
- [ ] Account A cannot edit Account B private pets.
- [ ] Account A cannot delete Account B private pets.
- [ ] Public share link only shows the one shared Passport.
- [ ] Revoked share link returns unavailable.
- [ ] Transfer invite cannot be accepted by the sender.

## Beta disclaimer reminder

Add or confirm visible beta copy somewhere in Settings or Dashboard:

> PetPassport is currently in private beta. Please keep your own backup of important records. PetPassport is not veterinary advice and does not replace a licensed veterinarian.
