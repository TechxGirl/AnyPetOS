import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Icon from "./Icon";
import { createId } from "../../utils/id";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, variant = "info", duration = 4200 }) => {
    const id = createId("toast");
    setToasts((current) => [...current, { id, title, message, variant }]);
    if (duration > 0) window.setTimeout(() => dismissToast(id), duration);
    return id;
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ui-toast-viewport" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((toast) => (
          <article key={toast.id} className={`ui-toast ui-toast--${toast.variant}`}>
            <span className="ui-toast__status" aria-hidden="true">
              <Icon name={toast.variant === "success" ? "check" : toast.variant === "error" ? "alert" : "info"} size={18} />
            </span>
            <div className="ui-toast__copy">
              {toast.title && <p className="ui-toast__title">{toast.title}</p>}
              {toast.message && <p className="ui-toast__message">{toast.message}</p>}
            </div>
            <button type="button" className="ui-toast__close" aria-label="Dismiss notification" onClick={() => dismissToast(toast.id)}>
              <Icon name="close" size={16} />
            </button>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
