export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="ui-empty-state">
      {icon && <div className="ui-empty-state__icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  );
}
