# 🗄 PetPassport Database Blueprint

---

# User

Stores account information.

Fields

- id
- email
- phone
- username
- displayName
- role
- profilePhoto
- createdAt

---

# Pet

Stores each animal.

Fields

- id
- passportId
- ownerId

Basic Info

- name
- species
- category
- animalGroup
- morph
- sex

Age

- dob
- ageType
- estimatedAge
- ageNote

Care

- diet
- foodList
- frequency
- substrate
- temperament
- notes

Status

- status
- favorite

Relationships

- medicationIds
- weightIds
- logIds
- attachmentIds

Dates

- createdAt
- updatedAt

---

# Feeding Log

- id
- petId
- food
- amount
- accepted
- weight
- notes
- date

---

# Weight Log

- id
- petId
- weight
- unit
- notes
- date

---

# Shed Log

- id
- petId
- shedType
- notes
- date

---

# Medication

- id
- petId
- name
- dose
- route
- frequencyHours
- durationDays
- continueIndefinitely
- firstDose
- lastGiven
- notes

---

# Attachment

Future

- receipt
- genetics
- vetRecord
- xray
- clutch
- certificate

---

# Passport Share

Future

- owner
- viewer
- permissions
- expiration
- qrCode
- shareLink

---

# Notifications

Future

- feeding
- medications
- sheds
- birthdays
- UVB
- substrate
- inventory

---

# Collections (Breeder)

Future

- holdbacks
- breeders
- babies
- forSale
- retired
- memorial