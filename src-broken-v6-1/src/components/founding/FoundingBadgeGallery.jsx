import FoundingBadge from "./FoundingBadge";
import { useFoundingBadges } from "../../context/FoundingBadgeContext";

export default function FoundingBadgeGallery({ compact = false, empty = null }) {
  const { badges, loading } = useFoundingBadges();

  if (loading) {
    return <div className="founding-badge-gallery is-loading">Loading founding status…</div>;
  }

  if (!badges.length) {
    return empty;
  }

  return (
    <div className="founding-badge-gallery" aria-label="Founding beta badges">
      {badges.map((badge) => (
        <FoundingBadge
          key={badge.role}
          role={badge.role}
          number={badge.badgeNumber}
          awardedAt={badge.awardedAt}
          compact={compact}
        />
      ))}
    </div>
  );
}
