import {
  useCallback,
  useMemo,
  useState,
} from "react";
import { ModalContext } from "./ModalContextCore";

export function ModalProvider({ children }) {
  const [activeModal, setActiveModal] =
    useState(null);

  const openModal = useCallback(
    (type, petId = null, payload = {}) => {
      setActiveModal({
        type,
        petId,
        payload,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const value = useMemo(
    () => ({
      activeModal,
      openModal,
      closeModal,
    }),
    [
      activeModal,
      openModal,
      closeModal,
    ]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}