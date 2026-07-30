import { Button, Card, Icon } from "../ui";

export default function AppErrorState({
  title = "AnyPetOS could not load this area",
  message = "Please check your connection and try again.",
  onRetry = () => window.location.reload(),
}) {
  return (
    <div className="app-error-state" role="alert">
      <Card className="app-error-state__card">
        <span className="app-error-state__icon" aria-hidden="true">
          <Icon name="alert" size={28} />
        </span>
        <h1>{title}</h1>
        <p>{message}</p>
        <Button
          leftIcon={<Icon name="history" size={17} />}
          onClick={onRetry}
        >
          Try again
        </Button>
      </Card>
    </div>
  );
}
