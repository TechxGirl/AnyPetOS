import { useState } from "react";
import { Badge, Button, Card, CardHeader, Icon, PageHeader, Textarea } from "../components/ui";

const CHECKLIST = [
  "Remember Me survives a full browser restart",
  "Session-only sign in ends after the browser session",
  "Forgot-password email and reset link work",
  "Unfinished Passport draft restores after refresh",
  "Create pet autofill works",
  "Passport saves once without duplicates",
  "Offline warning appears when the connection drops",
  "Feeding dropdown works",
  "Feed log saves",
  "Medication schedule and dose history are correct",
  "Medication doses appear on the Calendar",
  "Weight log saves",
  "Shed log saves",
  "Share link opens read-only",
  "Revoke kills old link",
  "Regenerate creates a new link",
  "Transfer works with second account",
  "JSON backup downloads and restore preview opens",
  "Light and dark themes work",
  "Mobile layout is usable",
  "Supabase auth redirects are set",
  "Beta disclaimer is visible",
];

const GROWTH_ITEMS = [
  "Premium plan",
  "Team accounts",
  "Marketplace integrations",
  "Public API",
  "Internationalization",
  "Enterprise features",
  "Partnerships",
  "Native mobile apps",
];

export default function LaunchCenter({ pets }) {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("petpassport-launch-checklist") || "{}"); } catch { return {}; }
  });
  const [notes, setNotes] = useState(() => localStorage.getItem("petpassport-launch-notes") || "");

  const toggle = (item) => {
    const next = { ...checked, [item]: !checked[item] };
    setChecked(next);
    localStorage.setItem("petpassport-launch-checklist", JSON.stringify(next));
  };

  const saveNotes = () => {
    localStorage.setItem("petpassport-launch-notes", notes);
  };

  const completed = CHECKLIST.filter((item) => checked[item]).length;
  const percent = Math.round((completed / CHECKLIST.length) * 100);
  const betaInvite = `AnyPetOS private beta is open for testing. Please create a test account, add a test animal, try sharing a read-only Passport, and test ownership transfer. This is beta software, not veterinary advice or emergency record storage.`;

  return (
    <div className="page-shell roadmap-feature-page">
      <PageHeader
        eyebrow="Launch preparation"
        title="Beta & Growth Center"
        description="Private beta readiness, UI polish checks, accessibility, marketing copy, and long-term growth planning."
        icon={<Icon name="sparkles" size={22} />}
        actions={<Badge variant="success">{percent}% ready</Badge>}
      />

      <div className="feature-grid feature-grid--two">
        <Card>
          <CardHeader icon={<Icon name="clipboard" size={18} />} title="Private beta checklist" description="Use this before inviting testers." action={<Badge variant="primary">{completed}/{CHECKLIST.length}</Badge>} />
          <div className="launch-checklist">
            {CHECKLIST.map((item) => (
              <label key={item} className="launch-check-item">
                <input type="checkbox" checked={Boolean(checked[item])} onChange={() => toggle(item)} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader icon={<Icon name="share" size={18} />} title="Beta tester invite copy" description="Copy this into messages, posts, or emails." />
          <Textarea readOnly value={betaInvite} />
          <div className="buttonRow"><Button variant="secondary" onClick={() => navigator.clipboard?.writeText(betaInvite)}>Copy invite</Button></div>
          <p className="helperText">Current collection: {pets.length} passport{pets.length === 1 ? "" : "s"}. Use test animals during beta transfer testing.</p>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<Icon name="file" size={18} />} title="Marketing website sections" description="The public launch site can use these sections." />
        <div className="module-chip-grid">
          {[
            "Hero: The digital Passport for every animal",
            "Problem: scattered care records disappear during rehoming",
            "Solution: share, revoke, and transfer lifelong records",
            "Workspaces: owners, breeders, rescues, vets, educators, sitters",
            "Trust: private beta, secure links, no veterinary replacement claims",
            "CTA: Join private beta",
          ].map((item) => <article key={item} className="module-chip"><strong>{item}</strong></article>)}
        </div>
      </Card>

      <div className="feature-grid feature-grid--two">
        <Card>
          <CardHeader icon={<Icon name="activity" size={18} />} title="Growth roadmap" description="Phase 9 items stay visible without pretending they are done." />
          <div className="module-chip-grid">{GROWTH_ITEMS.map((item) => <span key={item} className="achievement-pill"><Icon name="clock" size={15} />{item}</span>)}</div>
        </Card>
        <Card>
          <CardHeader icon={<Icon name="edit" size={18} />} title="Launch notes" description="Keep beta observations in one place on this device." />
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Tester bugs, UI polish notes, launch ideas..." />
          <Button variant="secondary" onClick={saveNotes}>Save notes</Button>
        </Card>
      </div>
    </div>
  );
}
