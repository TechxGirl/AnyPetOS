import { Card, CardHeader, Icon, PageHeader } from "../components/ui";

const TEST_AREAS = [
  "Create an animal Passport",
  "Use search and collection filters",
  "Log a feeding from the food dropdown",
  "Log weight, shed, and medications",
  "Open the Passport profile",
  "Create a share link and confirm it opens read-only",
  "Revoke a share link and confirm the old link dies",
  "Create a new share link after revoke",
  "Create and accept a transfer invite with a second account",
  "Switch light/dark theme",
];

export default function BetaFeedback() {
  return (
    <div className="feed betaFeedbackPage">
      <PageHeader
        eyebrow="Private beta"
        title="Feedback checklist"
        description="Use this page to guide testers through the features that need poking before launch."
        icon={<Icon name="clipboard" size={22} />}
      />

      <Card>
        <CardHeader
          icon={<Icon name="alert" size={18} />}
          title="Beta reminder"
          description="AnyPetOS is in active development. Data, features, and workflows may change during beta."
        />
        <p>
          Test with real-ish sample records first. Do not use AnyPetOS as the only copy of emergency veterinary records yet.
        </p>
      </Card>

      <Card>
        <CardHeader
          icon={<Icon name="check" size={18} />}
          title="Tester script"
          description="Ask each tester to run through these in order."
        />
        <div className="betaChecklist">
          {TEST_AREAS.map((item, index) => (
            <label key={item} className="betaChecklistItem">
              <input type="checkbox" />
              <span>
                <strong>{index + 1}. {item}</strong>
                <small>Mark this after it works or note what felt confusing.</small>
              </span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={<Icon name="sparkles" size={18} />}
          title="What to report"
          description="Useful beta feedback is specific and repeatable."
        />
        <div className="feedbackPromptGrid">
          <div>
            <h4>Bug report</h4>
            <p>What did you click? What happened? What did you expect? Screenshot if possible.</p>
          </div>
          <div>
            <h4>Confusing moment</h4>
            <p>Where did you hesitate, reread, or wonder what a button meant?</p>
          </div>
          <div>
            <h4>Missing feature</h4>
            <p>What would make this replace your current animal tracking method?</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
