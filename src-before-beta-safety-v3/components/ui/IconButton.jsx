import Button from "./Button";

export default function IconButton({ icon, label, className = "", ...props }) {
  return (
    <Button
      className={["ui-icon-button", className].filter(Boolean).join(" ")}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </Button>
  );
}
