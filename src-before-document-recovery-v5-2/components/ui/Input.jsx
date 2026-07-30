import { forwardRef } from "react";

const Input = forwardRef(function Input({ className = "", error = false, ...props }, ref) {
  return <input ref={ref} className={["ui-input", error ? "is-error" : "", className].filter(Boolean).join(" ")} {...props} />;
});
export default Input;
