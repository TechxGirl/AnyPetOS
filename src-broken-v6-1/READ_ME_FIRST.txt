AnyPetOS Complete Beta Hotfix V6.1
=================================

This source folder combines the last complete working feature chain:
- medication courses measured in doses or days
- scheduled-vs-actual medication history
- past, present, and future medication events on Calendar
- dose recording, skipping, and backfilling
- beta safety features, Remember Me, password recovery, draft autosave, offline status
- professional Document Library and reusable transfer attachments
- electronic agreement review/acceptance and receipts
- independent document loading/recovery
- stay-on-page navigation
- Founding 150 numbered role badges
- navigation label changed from Files/Document Library to Documents while preserving the internal route

No new Supabase SQL is required if the V5.1 electronic-acceptance SQL and V6 Founding 150 SQL were already run successfully.

INSTALL
1. Stop the local Vite server with Ctrl+C.
2. Rename the current active src folder to src-before-complete-hotfix-v6-1.
3. Copy the new src folder from this package into the pet-passport project root.
4. Run: npm run build
5. If the build succeeds, run: npm run dev
6. Test Medications, Calendar, Documents, transfer acceptance, stay-on-page, and Founding 150.

PUBLISH
Run:
  git add src
  git commit -m "Restore medication calendar and complete beta features"
  git push origin main

Do not use git add . because backup folders and local files should remain untracked.
