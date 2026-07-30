import { CORE_PRINCIPLES, ROADMAP_PHASES } from "../data/roadmap";
import { Card, CardHeader, Icon, PageHeader } from "../components/ui";

function statusClass(status) {
  return String(status).toLowerCase().replace(/\s+/g, "-");
}

export default function Roadmap() {
  const completed = ROADMAP_PHASES.filter((phase) => phase.status === "Complete").length;
  const active = ROADMAP_PHASES.filter((phase) => /progress|foundation/i.test(phase.status)).length;

  return (
    <div className="feed roadmapPage">
      <PageHeader
        eyebrow="Product roadmap"
        title="AnyPetOS 2.0"
        description="The long-range build plan for turning AnyPetOS into the operating system for animal care."
        icon={<Icon name="clipboard" size={22} />}
      />

      <section className="roadmapHero card">
        <div>
          <p className="section-eyebrow">Vision</p>
          <h2>Every animal has a story. Every record can travel.</h2>
          <p>
            AnyPetOS starts with care tracking and transportable Passports, then expands into workspaces, professional modules, community, AI, launch, and growth.
          </p>
        </div>
        <div className="roadmapHeroStats">
          <span>{completed} phases complete</span>
          <span>{active} active foundations</span>
          <span>{ROADMAP_PHASES.length} total phases</span>
        </div>
      </section>

      <div className="principleGrid">
        {CORE_PRINCIPLES.map((principle) => (
          <span key={principle}>{principle}</span>
        ))}
      </div>

      <div className="roadmapTimeline">
        {ROADMAP_PHASES.map((phase) => (
          <Card key={phase.id} className="roadmapCard">
            <div className="roadmapCard__topline">
              <span className="roadmapPhase">{phase.phase}</span>
              <span className={`roadmapStatus roadmapStatus-${statusClass(phase.status)}`}>
                {phase.status}
              </span>
            </div>

            <CardHeader
              icon={<Icon name={phase.status === "Complete" ? "check" : phase.status === "Planned" ? "clock" : "activity"} size={18} />}
              title={phase.title}
              description={phase.goal}
            />

            <p className="roadmapMilestone"><strong>Milestone:</strong> {phase.milestone}</p>

            <div className="roadmapItems">
              {phase.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader
          icon={<Icon name="sparkles" size={18} />}
          title="Success metric"
          description="People do not just use AnyPetOS. They rely on it."
        />
        <blockquote className="roadmapQuote">
          I honestly don't know how I managed my animals before AnyPetOS.
        </blockquote>
      </Card>
    </div>
  );
}
