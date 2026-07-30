import { Button, Icon } from "./ui";

export default function BetaBanner({ setPage }) {
  return (
    <section className="betaBanner" aria-label="AnyPetOS beta notice">
      <div className="betaBanner__brand">
        <span className="betaBanner__pulse" aria-hidden="true" />
        <div>
          <strong>Any time. Any place. Any Pet.</strong>
          <span>Private beta · Help us shape the operating system for every pet.</span>
        </div>
      </div>

      <div className="betaBanner__actions">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Icon name="message" size={16} />}
          onClick={() => setPage("Beta Feedback")}
        >
          Send feedback
        </Button>
      </div>
    </section>
  );
}
