import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea({ className = "", error = false, ...props }, ref) {
  return <textarea ref={ref} className={["ui-textarea", error ? "is-error" : "", className].filter(Boolean).join(" ")} {...props} />;
});
export default Textarea;
