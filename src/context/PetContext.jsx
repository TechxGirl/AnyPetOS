import { createContext, useContext } from "react";
import { usePets } from "../hooks/usePets";

// =====================================================
// 🟢 PetContext.jsx
//
// Global PetPassport animal state.
//
// =====================================================

const PetContext = createContext(null);

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

// =====================================================
// 🟢 usePetContext
// =====================================================

export function usePetContext() {
  const context = useContext(PetContext);

  if (!context) {
    throw new Error("usePetContext must be used inside PetProvider");
  }

  return context;
}