export default function Card({ children, className = "", padding = "md", interactive = false, ...props }) {
  return (
    <section
      className={[
        "ui-card",
        `ui-card--padding-${padding}`,
        interactive ? "ui-card--interactive" : "",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </section>
  );
}

export function CardHeader({ title, description, action, icon }) {
  return (
    <header className="ui-card-header">
      <div className="ui-card-header__copy">
        {icon && <span className="ui-card-header__icon">{icon}</span>}
        <div>
          <h3>{title}</h3>
          {description && <p>{description}</p>}
        </div>
      </div>
      {action && <div className="ui-card-header__action">{action}</div>}
    </header>
  );
}
