export default function Badge({ children, variant = "neutral", dot = false, icon, className = "" }) {
  return (
    <span className={["ui-badge", `ui-badge--${variant}`, className].filter(Boolean).join(" ")}>
      {dot && <span className="ui-badge__dot" aria-hidden="true" />}
      {icon}
      <span>{children}</span>
    </span>
  );
}
