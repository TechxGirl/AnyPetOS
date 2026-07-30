import { useMemo, useState } from "react";
import { Button, Card, CardHeader, FormField, Icon, Input, Select } from "../components/ui";

const TYPES = ["Bug or broken feature", "Confusing experience", "Feature request", "Design feedback", "Something I loved", "Other"];

export default function BetaFeedback({ currentUser, setPage }) {
  const [form, setForm] = useState({ type: TYPES[0], rating: "", page: "", details: "", steps: "" });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const report = useMemo(() => [
    "ANYPETOS BETA FEEDBACK",
    "",
    `Type: ${form.type}`,
    `Rating: ${form.rating || "Not provided"}`,
    `Page or feature: ${form.page || "Not provided"}`,
    `Account: ${currentUser?.email || "Not available"}`,
    `Browser page: ${window.location.href}`,
    `Device: ${navigator.userAgent}`,
    "",
    "What happened / feedback:",
    form.details || "Not provided",
    "",
    "Steps to reproduce:",
    form.steps || "Not provided",
  ].join("\n"), [form, currentUser]);

  const copy = async () => {
    await navigator.clipboard.writeText(report);
    window.alert("Feedback copied. You can paste it into a message or email.");
  };

  const email = () => {
    const subject = encodeURIComponent(`AnyPetOS beta feedback: ${form.type}`);
    const body = encodeURIComponent(report);
    window.location.href = `mailto:hello@anypetos.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="feed betaFeedbackPage">
      <div className="betaFeedbackTopbar">
        <Button variant="ghost" leftIcon={<Icon name="arrowLeft" size={17} />} onClick={() => setPage("Dashboard")}>Back to dashboard</Button>
      </div>

      <section className="betaFeedbackHero">
        <p className="section-eyebrow">AnyPetOS private beta</p>
        <h1>Help us make AnyPetOS better.</h1>
        <p>Tell us what broke, what felt confusing, or what would make animal care easier. Specific details help us fix things faster.</p>
      </section>

      <Card className="betaFeedbackCard">
        <CardHeader icon={<Icon name="message" size={19} />} title="Send beta feedback" description="Screenshots can be attached after your email app opens." />
        <div className="betaFeedbackGrid">
          <FormField label="Feedback type">
            <Select value={form.type} onChange={(e) => update("type", e.target.value)}>
              {TYPES.map((type) => <option key={type}>{type}</option>)}
            </Select>
          </FormField>
          <FormField label="Overall experience">
            <Select value={form.rating} onChange={(e) => update("rating", e.target.value)}>
              <option value="">Choose a rating</option>
              <option>Excellent</option><option>Good</option><option>Okay</option><option>Frustrating</option><option>Blocked me completely</option>
            </Select>
          </FormField>
          <FormField label="Page or feature" className="full">
            <Input value={form.page} onChange={(e) => update("page", e.target.value)} placeholder="Example: Add Animal, Care Planner, email verification" />
          </FormField>
          <FormField label="What happened or what would you change?" className="full">
            <textarea className="ui-input betaFeedbackTextarea" value={form.details} onChange={(e) => update("details", e.target.value)} placeholder="Please include what you expected and what actually happened." />
          </FormField>
          <FormField label="Steps to reproduce (optional)" className="full">
            <textarea className="ui-input betaFeedbackTextarea betaFeedbackTextarea--small" value={form.steps} onChange={(e) => update("steps", e.target.value)} placeholder="1. I opened... 2. I tapped... 3. Then..." />
          </FormField>
        </div>
        <div className="betaFeedbackActions">
          <Button variant="outline" leftIcon={<Icon name="clipboard" size={17} />} onClick={copy}>Copy feedback</Button>
          <Button leftIcon={<Icon name="message" size={17} />} onClick={email}>Email feedback</Button>
        </div>
      </Card>
    </div>
  );
}
