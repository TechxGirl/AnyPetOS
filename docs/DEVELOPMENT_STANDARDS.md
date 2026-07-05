# 🐍 PetPassport Development Standards

Version: 1.0

These standards exist to keep PetPassport clean, consistent, scalable, and easy to maintain as the project grows.

---

# 🎯 Philosophy

We are not building a collection of pages.

We are building a platform.

Every feature should make pet ownership, breeding, rescue work, veterinary care, or education easier.

If a feature does not solve a real problem, it does not belong in the current phase.

---

# 🏗 Project Structure

src/

components/
Reusable UI

pages/
Entire screens

constants/
Static application data

utils/
Reusable helper functions

data/
Animal databases

docs/
Project documentation

assets/
Images and icons

---

# 📁 Naming Conventions

## React Components

Use PascalCase.

Examples:

PetCard.jsx

Dashboard.jsx

FeedModal.jsx

QuickMedsModal.jsx

---

## Utilities

Use camelCase.

Examples:

calculateAge.js

calculateNextFeed.js

formatDate.js

filterPets.js

---

## Constants

Use lowercase.

Examples:

animals.js

statuses.js

temperaments.js

roles.js

---

## Documentation

Use ALL_CAPS.

Examples:

ROADMAP.md

ARCHITECTURE.md

DEVELOPMENT_STANDARDS.md

IDEAS.md

---

# 🟢 React File Organization

Every component should follow this order whenever possible.

Imports

Header Comment

🟢 State

🟢 Derived Data

🟢 Effects

🟢 Event Handlers

🟢 Helper Functions

🟢 Render

Render sections should also be separated using green section comments.

Example:

🟢 Header

🟢 Account

🟢 Sidebar

🟢 Feed

🟢 Footer

---

# 🎨 UI Philosophy

Every screen should answer ONE question.

Welcome

Why am I here?

Account

Who am I?

Role Selection

What experience fits me?

Dashboard

What should I do next?

Pet Profile

What do I need to know?

---

# 🐍 Product Principles

Everything starts with the animal.

We build one platform, not six separate apps.

Fast logging beats perfect logging.

Done beats perfect.

Never show an empty dashboard.

Guide the user toward their next action.

---

# 💬 Naming Philosophy

We do not create "pet profiles."

We create Passports.

Examples:

Passport Library

Passport Transfer

Passport Timeline

Passport History

Passport Shared

Passport QR

The branding should always reinforce the Passport experience.

---

# 🧩 Components

Large components should be split before they become difficult to understand.

If a component starts approaching 300–400 lines, consider extracting pieces into reusable components.

---

# 🔁 Reuse

If logic is duplicated more than once, move it into utils.

If UI is duplicated more than once, make it a component.

---

# 🚀 Development Workflow

Every feature follows this order.

1. Brainstorm

2. Design

3. Build UI

4. Test UX

5. Connect Data

6. Polish

7. Launch

Never skip straight to code.

---

# 📈 PetPassport Roadmap

Every task belongs to a phase.

Never jump ahead.

If a new idea appears:

Add it to IDEAS.md

Return to the current phase.

Finish the current phase before beginning another.

---

# ❤️ Our Goal

We are not trying to build the biggest pet app.

We are trying to build the pet platform people cannot imagine living without.

Every feature should make someone say:

"That saved me time."

or

"I didn't know I needed that."

If it doesn't accomplish one of those two things, rethink it.

---

Built with ❤️ by the PetPassport team.