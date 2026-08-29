import { createContext, useContext } from "react";

export const PetContext = createContext(null);

export function usePetContext() {
  const context = useContext(PetContext);

  if (!context) {
    throw new Error("usePetContext must be used inside PetProvider");
  }

  return context;
}