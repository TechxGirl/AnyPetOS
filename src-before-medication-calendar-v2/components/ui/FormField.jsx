import { useId } from "react";

export default function FormField({ label, hint, error, optional = false, children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const fieldProps = { id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) || undefined };

  return (
    <div className="ui-form-field">
      <label htmlFor={id}>
        {label}
        {optional && <span>Optional</span>}
      </label>
      {typeof children === "function" ? children(fieldProps) : children}
      {hint && <small id={hintId} className="ui-form-field__hint">{hint}</small>}
      {error && <small id={errorId} className="ui-form-field__error">{error}</small>}
    </div>
  );
}
