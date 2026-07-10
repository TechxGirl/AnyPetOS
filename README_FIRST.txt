PETPASSPORT WORKSPACE MODAL FIX

What changed
------------
The workspace-module record form now opens in the existing reusable PetPassport Modal instead of appearing farther down the page.

This applies to actions such as:
- Create care routine / New routine
- Attach animal
- Create alert
- Other workspace-module record actions that use the same form

The popup now supports:
- Centered modal presentation
- Dimmed backdrop
- Close button
- Cancel button
- Escape key to close
- Backdrop click to close
- Keyboard focus management
- Save record button in the modal footer

Changed source file
-------------------
src/pages/WorkspaceModulePage.jsx

Installation
------------
1. Close or stop the local development server if desired.
2. Extract this ZIP.
3. Drag the included src folder into the main pet-passport project folder.
4. When Windows asks whether to merge/replace files, choose Replace the files in the destination.
5. In VS Code, run: npm run dev
6. Open Care Planner and click New routine to test the popup.

Recommended test
----------------
- Open the popup from each Care Planner action.
- Close with X, Cancel, Escape, and clicking the backdrop.
- Save a record and confirm it appears on the workflow board.
- Test in both light and dark themes.
