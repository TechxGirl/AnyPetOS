import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Icon,
  Input,
  PageHeader,
} from "../components/ui";
import StatCard from "../components/StatCard";

export default function AI({ pets }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const now = Date.now();

  const overdueFeedings = pets.filter((pet) => pet.nextFeed && now > pet.nextFeed);
  const favoritePets = pets.filter((pet) => pet.favorite);
  const medsDue = pets.flatMap((pet) =>
    (pet.meds || [])
      .filter((med) => {
        if (!med.lastGiven) return true;
        const nextDose = med.lastGiven + Number(med.frequencyHours) * 60 * 60 * 1000;
        return now >= nextDose;
      })
      .map((med) => ({
        petId: pet.id,
        petName: pet.name,
        medName: med.name,
        dose: med.dose,
      }))
  );
  const sickOrMonitoring = pets.filter((pet) =>
    ["Sick", "Monitoring", "Quarantine"].includes(pet.status)
  );

  const askLocalAI = (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("due") || lowerQuestion.includes("today")) {
      setAnswer(
        [
          "Today's priorities",
          `Feedings due: ${overdueFeedings.length}`,
          `Medications due: ${medsDue.length}`,
          `Animals needing attention: ${sickOrMonitoring.length}`,
          "",
          "This preview uses the records already stored in PetPassport.",
        ].join("\n")
      );
      return;
    }

    if (lowerQuestion.includes("med")) {
      setAnswer(
        medsDue.length > 0
          ? [
              "Medications due",
              ...medsDue.map(
                (med) =>
                  `${med.petName}: ${med.medName}${med.dose ? ` (${med.dose})` : ""}`
              ),
            ].join("\n")
          : "No medications are due right now."
      );
      return;
    }

    if (lowerQuestion.includes("favorite")) {
      setAnswer(
        favoritePets.length > 0
          ? ["Favorite pets", ...favoritePets.map((pet) => pet.name)].join("\n")
          : "You do not have any favorite pets yet."
      );
      return;
    }

    setAnswer(
      [
        "PetPassport Assistant preview",
        "",
        "Try asking:",
        "• Who is due today?",
        "• Which pets are on medication?",
        "• Who is in quarantine?",
        "• Which pets are favorites?",
        "",
        "This phase uses local rules. A connected AI service can be added later.",
      ].join("\n")
    );
  };

  const priorities = [
    ...overdueFeedings.map((pet) => ({
      key: `feed-${pet.id}`,
      icon: "utensils",
      title: `Feed ${pet.name}`,
      description: "The scheduled feeding time has passed.",
      tone: "warning",
    })),
    ...medsDue.map((med) => ({
      key: `med-${med.petId}-${med.medName}`,
      icon: "pill",
      title: `${med.medName} for ${med.petName}`,
      description: med.dose ? `Dose: ${med.dose}` : "Dose is due now.",
      tone: "danger",
    })),
    ...sickOrMonitoring.map((pet) => ({
      key: `status-${pet.id}`,
      icon: "alert",
      title: `Check ${pet.name}`,
      description: `Current status: ${pet.status}`,
      tone: "info",
    })),
  ];

  return (
    <div className="page-shell assistant-page">
      <PageHeader
        eyebrow="Collection intelligence"
        title="PetPassport Assistant"
        description="Review priorities and ask simple questions about the records in your workspace."
        icon={<Icon name="bot" size={23} />}
        actions={<Badge variant="primary">Preview mode</Badge>}
      />

      <div className="statGrid assistant-stat-grid">
        <StatCard icon={<Icon name="paw" size={21} />} value={pets.length} label="Pets" color="#2dd4bf" />
        <StatCard icon={<Icon name="star" size={21} />} value={favoritePets.length} label="Favorites" color="#fbbf24" />
        <StatCard icon={<Icon name="utensils" size={21} />} value={overdueFeedings.length} label="Feedings due" color="#60a5fa" />
        <StatCard icon={<Icon name="pill" size={21} />} value={medsDue.length} label="Medications due" color="#a78bfa" />
        <StatCard icon={<Icon name="alert" size={21} />} value={sickOrMonitoring.length} label="Need attention" color="#fb7185" />
      </div>

      <div className="assistant-layout-grid">
        <Card>
          <CardHeader
            title="Today's priorities"
            description="Items detected from your current care records."
            icon={<Icon name="clipboard" size={19} />}
          />

          {priorities.length === 0 ? (
            <EmptyState
              icon={<Icon name="check" size={24} />}
              title="Everything looks calm"
              description="No overdue feedings, medications, or active health alerts were detected."
            />
          ) : (
            <div className="assistant-priority-list">
              {priorities.map((item) => (
                <article key={item.key} className="assistant-priority-item">
                  <span className={`assistant-priority-icon is-${item.tone}`}>
                    <Icon name={item.icon} size={18} />
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Ask your workspace"
            description="This preview answers a small set of questions from local pet data."
            icon={<Icon name="sparkles" size={19} />}
          />

          <form className="assistant-question-form" onSubmit={askLocalAI}>
            <Input
              aria-label="Ask PetPassport"
              placeholder="Try: Who is due today?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />
            <Button type="submit" leftIcon={<Icon name="sparkles" size={17} />}>
              Ask assistant
            </Button>
          </form>

          {answer && (
            <div className="assistant-answer" aria-live="polite">
              <div className="assistant-answer-heading">
                <Icon name="bot" size={18} />
                <strong>Response</strong>
              </div>
              <pre>{answer}</pre>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Planned assistant capabilities"
          description="Future features can build on the same records and design system."
          icon={<Icon name="activity" size={19} />}
        />
        <div className="assistant-feature-grid">
          {["Voice care logging", "Photo-assisted identification", "Morph and breed support", "Feeding and weight insights", "Early warning alerts"].map((feature) => (
            <div key={feature} className="assistant-feature-item">
              <Icon name="check" size={16} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
