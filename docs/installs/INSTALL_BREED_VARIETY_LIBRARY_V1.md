# PetPassport Breed / Variety Library v1 Pack

This extends the shared Morph / Breed / Variety / Strain library beyond reptiles.

## What this adds

- Dog breed options
- Cat breed/pattern options
- Rabbit, ferret, rodent, livestock, equine, and exotic mammal breed/variety options
- Freshwater, saltwater, and pond fish strain/variety options
- Bird breed/mutation/type options
- Amphibian morph/line options
- Invertebrate colony/line/variety options
- Additional reptile locality/morph/line options for species not covered in v1
- Updated wording from Morph Library to a broader shared option library

## Important

Run the SQL file after installing the app files:

```txt
PETPASSPORT_BREED_VARIETY_LIBRARY_EXPANSION_V1.sql
```

This only adds starter options. Users can still add missing options for everyone by typing a custom value and clicking **Add for everyone**.

## Install

1. Stop Vite with Ctrl + C.
2. Extract this zip.
3. Copy these into your real `pet-passport` folder:
   - `src`
   - `public`
   - `package.json`
   - `package-lock.json`
   - `vite.config.js`
   - `index.html`
4. Run the SQL file in Supabase SQL Editor.
5. Run:

```powershell
npm install
npm run build
npm run dev -- --host
```

## Test

Try Add Animal or Edit Animal with:

- Dog
- Cat
- Rabbit
- Ferret
- Betta
- Goldfish
- Guppy
- Koi
- Cockatiel
- Budgie
- Chicken
- Axolotl
- Dairy Cow Isopod
- Cherry Shrimp
- Carpet Python
- Panther Chameleon

You should see starter breed/variety/strain options, and you should still be able to add custom options for everyone.
