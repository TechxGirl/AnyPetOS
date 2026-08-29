import { createContext, useContext } from "react";

export const FoundingBadgeContext = createContext(null);

export function useFoundingBadges() {
  const context = useContext(FoundingBadgeContext);

  if (!context) {
    throw new Error(
      "useFoundingBadges must be used inside FoundingBadgeProvider."
    );
  }

  return context;
}