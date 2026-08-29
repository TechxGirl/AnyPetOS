import { createContext, useContext } from "react";

export const ModalContext = createContext(null);

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used inside ModalProvider.");
  }

  return context;
}