# Temporary Access Link Two-File Hotfix

The screenshot still shows the old component because the patched files are not active yet.

Replace exactly these two files in the real PetPassport project:

1. `src/pages/CareInfrastructure.jsx`
2. `src/App.css`

After replacing them, run:

```powershell
Remove-Item .\node_modules\.vite -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .\dist -Recurse -Force -ErrorAction SilentlyContinue
npm run build
npm run dev -- --host
```

Then press `Ctrl + Shift + R` in the browser.

Verification:

```powershell
Select-String -Path .\src\pages\CareInfrastructure.jsx -Pattern "Open invite"
```

It must return a line containing `Open invite`.
