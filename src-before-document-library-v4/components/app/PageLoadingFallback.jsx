import Icon from "../ui/Icon";

export default function PageLoadingFallback({ title = "Opening feature", message = "Loading only what you need..." }) {
  return (
    <div className="page-shell feature-loading-shell" role="status" aria-live="polite">
      <div className="feature-loading-panel">
        <div className="feature-loading-icon"><Icon name="loader" size={24} /></div>
        <div>
          <strong>{title}</strong>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}
