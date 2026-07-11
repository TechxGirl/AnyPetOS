import { Button, Icon } from "./ui";

export default function BetaBanner({ setPage }) {
  return (
    <section className="betaBanner" aria-label="Private beta notice">
      <div className="betaBanner__icon" aria-hidden="true">
        <Icon name="sparkles" size={19} />
      </div>
      <div className="betaBanner__copy">
        <strong>Private beta</strong>
        <span>
          PetPassport is actively evolving. Use it for testing and care organization, not as a replacement for veterinary care or emergency records.
        </span>
      </div>
      <div className="betaBanner__actions">
        <Button variant="ghost" size="sm" onClick={() => setPage("Roadmap")}>
          Roadmap
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setPage("Beta Feedback")}>
          Feedback
        </Button>
      </div>
    </section>
  );
}
