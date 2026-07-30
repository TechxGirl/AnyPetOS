import { useMemo, useState } from "react";
import { Card, EmptyState, Icon, PageHeader } from "../components/ui";
import {
  CARE_GUIDE_SOURCES,
  CARE_LEVELS,
  getAllCareGuides,
  getSourceLabels,
} from "../data/careGuides";

function matchesSearch(guide, search) {
  const haystack = [
    guide.species,
    guide.category,
    guide.group,
    guide.summary,
    guide.fallbackTitle,
    ...(guide.feeding?.foods || []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
}

function GuideSection({ title, items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="careGuideSection">
      <h4>{title}</h4>
      <div className="careGuidePillGrid">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function CareGuide() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [guideType, setGuideType] = useState("All");
  const [careLevel, setCareLevel] = useState("All");

  const guides = useMemo(() => getAllCareGuides(), []);

  const categories = useMemo(
    () => ["All", ...new Set(guides.map((guide) => guide.category).filter(Boolean))],
    [guides]
  );

  const filteredGuides = guides.filter((guide) => {
    const categoryMatch = category === "All" || guide.category === category;
    const typeMatch =
      guideType === "All" ||
      (guideType === "Verified" && guide.isDetailed) ||
      (guideType === "Fallback" && !guide.isDetailed);
    const levelMatch = careLevel === "All" || guide.difficulty === careLevel;
    const searchMatch = !search || matchesSearch(guide, search);

    return categoryMatch && typeMatch && levelMatch && searchMatch;
  });

  const verifiedCount = guides.filter((guide) => guide.isDetailed).length;
  const fallbackCount = guides.length - verifiedCount;
  const levelCounts = CARE_LEVELS.reduce((counts, level) => {
    counts[level] = guides.filter((guide) => guide.difficulty === level).length;
    return counts;
  }, {});

  return (
    <div className="careGuidePage">
      <PageHeader
        eyebrow="Reference library"
        title="Care guides"
        description="Species-aware husbandry starter guides for reptiles, amphibians, arachnids, invertebrates, fish, birds, mammals, and custom animals."
        icon={<Icon name="book" size={22} />}
      />

      <section className="careGuideHero card innerCard">
        <div>
          <span className="miniEyebrow">Care Guides + Smart Feeding v1</span>
          <h2>Better care data without pretending every animal is identical.</h2>
          <p>
            AnyPetOS now separates detailed starter guides from fallback category guides. That gives beta users broad coverage while making it clear which guides need deeper species-specific review later.
          </p>
        </div>

        <div className="careGuideStats">
          <div><strong>{guides.length}</strong><span>Total species covered</span></div>
          <div><strong>{verifiedCount}</strong><span>Verified starter guides</span></div>
          <div><strong>{fallbackCount}</strong><span>Fallback guides</span></div>
        </div>
      </section>

      <section className="careGuideLevelStrip card innerCard" aria-label="Care level filter">
        <div>
          <span className="miniEyebrow">Filter by care level</span>
          <h3>Beginner, Intermediate, Advanced</h3>
          <p>
            Care levels are intentionally broad. They help users sort the library quickly while each card still explains species-specific details.
          </p>
        </div>

        <div className="careGuideLevelButtons">
          <button
            type="button"
            className={careLevel === "All" ? "active" : ""}
            onClick={() => setCareLevel("All")}
          >
            All levels
            <span>{guides.length}</span>
          </button>
          {CARE_LEVELS.map((level) => (
            <button
              type="button"
              key={level}
              className={`${careLevel === level ? "active" : ""} ${level.toLowerCase()}`}
              onClick={() => setCareLevel(level)}
            >
              {level}
              <span>{levelCounts[level] || 0}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="careGuideToolbar card innerCard">
        <div className="careGuideSearch">
          <Icon name="search" size={17} />
          <input
            placeholder="Search species, food, category, or guide notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select value={guideType} onChange={(event) => setGuideType(event.target.value)}>
          <option>All</option>
          <option>Verified</option>
          <option>Fallback</option>
        </select>

        <select value={careLevel} onChange={(event) => setCareLevel(event.target.value)}>
          <option value="All">All care levels</option>
          {CARE_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      {filteredGuides.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={<Icon name="book" size={24} />}
            title="No care guides found"
            description="Try another species, category, or food term."
          />
        </Card>
      ) : (
        <div className="careGuideGrid">
          {filteredGuides.map((guide) => {
            const sourceLabels = getSourceLabels(guide.sources || []);

            return (
              <article key={`${guide.category}-${guide.group}-${guide.species}`} className="careGuideCard card innerCard">
                <div className="careGuideCardHeader">
                  <div>
                    <span className="miniEyebrow">{guide.category} / {guide.group}</span>
                    <h3>{guide.species}</h3>
                    {!guide.isDetailed && guide.fallbackTitle && (
                      <p className="careGuideFallbackLabel">Using {guide.fallbackTitle}</p>
                    )}
                  </div>

                  <span className={guide.isDetailed ? "careGuideBadge verified" : "careGuideBadge fallback"}>
                    {guide.isDetailed ? "Verified starter" : "Fallback"}
                  </span>
                </div>

                <p className="careGuideSummary">{guide.summary}</p>

                <div className="careGuideFacts">
                  <div className={`careLevelFact ${(guide.difficulty || "Intermediate").toLowerCase()}`}>
                    <span>Care level</span>
                    <strong>{guide.difficulty || "Intermediate"}</strong>
                  </div>
                  <div>
                    <span>Reviewed</span>
                    <strong>{guide.lastReviewed || "Needs review"}</strong>
                  </div>
                  <div>
                    <span>Feeding strategy</span>
                    <strong>{guide.feeding?.strategy || "Species-specific"}</strong>
                  </div>
                </div>

                {guide.environment?.length > 0 && (
                  <div className="careGuideSection">
                    <h4>Environment</h4>
                    <div className="careGuideMetricGrid">
                      {guide.environment.map((item) => (
                        <div key={`${item.label}-${item.value}`}>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {guide.feeding && (
                  <div className="careGuideSection careGuideFeedingBox">
                    <h4>Feeding</h4>
                    <p><strong>Frequency:</strong> {guide.feeding.frequency}</p>
                    <p>{guide.feeding.notes}</p>
                    <GuideSection title="Food options" items={guide.feeding.foods} />
                    <GuideSection title="Meal-size options" items={guide.feeding.sizes} />
                  </div>
                )}

                <GuideSection title="Substrate / setup" items={guide.substrate} />
                <GuideSection title="Health warning signs" items={guide.healthWarnings} />
                <GuideSection title="Common mistakes" items={guide.commonMistakes} />
                <GuideSection title="Recommended logs" items={guide.recommendedLogs} />

                {sourceLabels.length > 0 && (
                  <div className="careGuideSources">
                    <span>Source notes</span>
                    <p>{sourceLabels.join(" • ")}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <section className="careGuideSourceNote card innerCard">
        <Icon name="shield" size={20} />
        <div>
          <h3>Beta care guide policy</h3>
          <p>
            Care guides are husbandry support, not emergency veterinary advice. Fallback guides are intentionally labeled, but every listed species now receives a category or group-aware starter guide, including isopods, mantises, beetles, snails, centipedes, millipedes, roaches, and aquatic invertebrates.
          </p>
          <p className="helperText">
            Sources used in this v1 include {Object.values(CARE_GUIDE_SOURCES).map((source) => source.label).filter(Boolean).join(", ")}.
          </p>
        </div>
      </section>
    </div>
  );
}
