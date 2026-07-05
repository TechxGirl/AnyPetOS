# 🐍 PetPassport

**Document:** Architecture
**Version:** 1.0
**Last Updated:** July 2026
**Status:** Active

---

# 🏗 Purpose

This document describes how PetPassport is structured.

Its purpose is to keep the application scalable, organized, and easy to maintain as new features are added.

---

# 🧱 Core Philosophy

Build one platform.

Not six separate apps.

Different users receive different experiences while sharing the same underlying architecture.

---

# 📂 Folder Structure

src/

components/
Reusable UI components

pages/
Application pages

constants/
Static application data

utils/
Reusable helper functions

data/
Species databases

assets/
Images and icons

docs/
Project documentation

---

# 🏛 Architecture Layers

Layer 1

User

↓

Layer 2

Workspace (Future)

↓

Layer 3

Animals

↓

Layer 4

Animal Data

• Logs

• Weights

• Feedings

• Medications

• Attachments

• Timeline

---

# 👤 User

Stores:

Email

Phone

Username

Display Name

Roles

Settings

---

# 🐍 Passport

Every animal receives one Passport.

A Passport contains:

Species

Morph/Breed

Sex

Weight History

Medical History

Feeding History

Timeline

Attachments

Ownership History (Future)

QR Sharing (Future)

---

# 🎯 Design Goal

Everything should revolve around the Passport.

Not around spreadsheets.

Not around folders.

The Passport is the heart of the platform.