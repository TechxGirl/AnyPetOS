# 🐍 PetPassport

**Document:** Architecture

**Version:** 2.0

**Last Updated:** July 2026

**Status:** Active

---

# 🌍 Vision

PetPassport is a lifelong digital Passport for every animal.

Our goal is not to build another pet tracker.

Our goal is to build the operating system for animal care.

Every owner, breeder, rescue, veterinarian, zoo, educator, retailer, and future workspace shares the same Passport architecture.

---

# 🏗 Core Philosophy

Build one platform.

Not six separate applications.

Each workspace presents different tools while sharing the same database, Passport model, and cloud infrastructure.

Every architectural decision should make adding future workspaces easier, not harder.

---

# 🧠 Engineering Principles

## Components

Components should only render UI.

Business logic should remain minimal.

If a component becomes difficult to understand, extract logic into a custom hook.

---

## Hooks

Hooks own business logic.

Examples:

- usePets()
- useProfile()

Hooks communicate with services and expose clean functions for the UI.

---

## Context

Context owns global application state.

Examples:

- Authentication
- Pet Passports
- User Preferences
- Theme (Future)

Avoid unnecessary prop drilling whenever possible.

---

## Services

Services communicate with external systems.

Examples:

- Supabase
- AI APIs
- Cloud Storage
- Notifications

Components should never communicate directly with external services.

---

## Utilities

Utilities remain pure.

They should never modify React state.

Examples:

- calculateNextFeed()
- normalizePet()
- generateAnimalId()

---

# 📂 Folder Structure

src/

components/

Reusable UI components

hooks/

Business logic

context/

Global application state

layouts/

Application layouts

pages/

Application pages

services/

External services

utils/

Pure helper functions

constants/

Application constants

data/

Species databases

styles/

Global styling

docs/

Documentation

---

# 🌊 Data Flow

User Action

↓

Component

↓

Context

↓

Hook

↓

Service

↓

Supabase

↓

Context Update

↓

React Re-render

↓

Updated UI

This should remain the standard flow whenever possible.

---

# 🐍 Passport

Every animal receives one Passport.

A Passport represents the permanent identity of that animal.

Nothing else in the application is more important.

---

## Passport contains

Identity

Species

Morph / Breed

Sex

Age

Owner

Photos

Feeding

Weight History

Medication History

Medical History

Sheds

Timeline

Attachments

Breeding Records (Future)

Ownership Transfers (Future)

QR Sharing (Future)

AI Insights (Future)

---

# 👤 User

Stores:

Authentication

Profile

Display Name

Username

Email

Phone

Roles

Workspace Preferences

Settings

---

# 🏢 Workspace System

PetPassport uses one shared platform with multiple workspaces.

Current

• Owner

Planned

• Breeder

• Rescue

• Veterinary

• Retail

• Zoo

• Education

Each workspace exposes different tools while sharing the same Passport model.

---

# 🎨 UI Philosophy

The interface should feel calm, modern, and focused.

Every screen should answer one question:

"What does this user need to do right now?"

Avoid clutter.

Prioritize readability.

Keep interactions fast.

---

# 📥 Import Philosophy

Users should never be forced to rebuild existing collections manually.

Future import sources include:

• CSV

• Excel

• MorphMarket

• Reptile Buddy

• JSON Backups

Imports should include:

Preview

Duplicate Detection

Validation

Rollback

Progress Tracking

---

# 🤖 AI Philosophy

AI should assist.

Never replace the keeper.

Examples include:

Voice Logging

Timeline Search

Health Pattern Recognition

Feeding Suggestions

Care Assistance

Passport Summaries

Species Questions

Future predictive health insights

---

# 🚀 Long-Term Goal

PetPassport should become the platform people trust with the complete history of every animal they care for.

When someone acquires an animal, its Passport should already exist.

When ownership changes, the Passport continues.

The story never starts over.

---

# 🎯 Guiding Principle

Everything revolves around the Passport.

Not folders.

Not spreadsheets.

Not individual features.

If a feature does not strengthen the Passport ecosystem, reconsider whether it belongs in PetPassport.