import { usePets } from "../hooks/usePets";
import { PetContext } from "./PetContextCore";

// =====================================================
// 🟢 PetContext.jsx
//
// Global AnyPetOS animal state provider.
//
// Context creation and the usePetContext hook live in
// PetContextCore.js so this file only exports components.
// =====================================================

// =====================================================
// 🟢 Pet Provider
// =====================================================

export function PetProvider({ session, children }) {
  const petState = usePets(session);

  return (
    <PetContext.Provider value={petState}>
      {children}
    </PetContext.Provider>
  );
}