AnyPetOS Document Library + Transfer Attachments V4
Date: 2026-07-10

WHAT THIS UPDATE ADDS
- A cleaner, more professional Document Library experience.
- Search and filters by document type, animal, and transfer-ready status.
- Reusable organization files that are not permanently tied to one animal.
- Agreement categories including sales, adoption, and transfer agreements.
- A clear private-by-default / transfer-ready toggle.
- Document selection inside the normal ownership-transfer window for Owner, Breeder, and Rescue workspaces.
- Secure, temporary signed document links included with the transfer invite.
- A recipient-facing “Documents included” section before ownership is accepted.
- “Document Library” naming in the workspace navigation.

IMPORTANT BETA SCOPE
- This version lets a recipient review documents attached to an active transfer invite.
- The secure document links expire with the transfer invite.
- Permanent copying of an attached agreement into the recipient's own Document Library and on-screen e-signatures are the next database-backed phase. This update does not pretend those pieces are finished.
- Existing care-infrastructure Supabase tables and the private pet-files storage bucket must already be installed.

INSTALL
1. Stop the Vite server with Ctrl+C.
2. Rename the current active src folder to src-before-document-library-v4.
3. Copy the new src folder beside it into the pet-passport project.
4. Run npm run dev.
5. Open Document Library and upload a test document.
6. Mark it “Available during shares and transfers.”
7. Open an animal's Transport Passport window and select the document before creating a transfer invite.

SAFETY
- Documents remain private unless explicitly marked transfer-ready.
- Only transfer-ready files belonging to the signed-in account are eligible.
- Reusable files or files linked to the selected animal can be attached.
- Signed links expire at the same time as the transfer invite.
