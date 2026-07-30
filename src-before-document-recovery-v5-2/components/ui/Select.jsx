import { forwardRef } from "react";

const Select = forwardRef(function Select({ className = "", error = false, children, ...props }, ref) {
  return <select ref={ref} className={["ui-select", error ? "is-error" : "", className].filter(Boolean).join(" ")} {...props}>{children}</select>;
});
export default Select;
