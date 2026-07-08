export default function PageHeader({ eyebrow, title, description, actions, icon }) {
  return (
    <header className="ui-page-header">
      <div className="ui-page-header__copy">
        {eyebrow && <p className="ui-page-header__eyebrow">{eyebrow}</p>}
        <div className="ui-page-header__title-row">
          {icon && <span className="ui-page-header__icon">{icon}</span>}
          <h1>{title}</h1>
        </div>
        {description && <p className="ui-page-header__description">{description}</p>}
      </div>
      {actions && <div className="ui-page-header__actions">{actions}</div>}
    </header>
  );
}
