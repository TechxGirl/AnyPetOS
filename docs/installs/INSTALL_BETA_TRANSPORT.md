# How to Install the Beta Transport Pack

## 1. Stop the dev server

In VS Code terminal, press:

```text
Ctrl + C
```

## 2. Make sure you have a Git checkpoint

```powershell
git status
git add .
git commit -m "checkpoint: before beta transport pack"
git push
```

If Git says there is nothing to commit, that is okay.

## 3. Extract this ZIP

Extract:

```text
petpassport-beta-transport-pack.zip
```

## 4. Replace files

Copy the extracted files into your project folder and allow Windows to replace matching files.

This pack includes:

```text
src
public
package.json
package-lock.json
vite.config.js
index.html
.gitignore
PETPASSPORT_BETA_TRANSPORT_SUPABASE.sql
CHANGELOG_BETA_TRANSPORT.md
BETA_TRANSPORT_TEST_CHECKLIST.md
```

## 5. Run npm install

This installs the new QR code dependency.

```powershell
npm install
```

## 6. Run the Supabase SQL

Open Supabase:

```text
Project → SQL Editor → New query
```

Paste everything from:

```text
PETPASSPORT_BETA_TRANSPORT_SUPABASE.sql
```

Then click Run.

## 7. Start the app

```powershell
npm run dev
```

## 8. Test

Use:

```text
BETA_TRANSPORT_TEST_CHECKLIST.md
```

Do not invite beta users until the share, revoke, and transfer tests pass.
