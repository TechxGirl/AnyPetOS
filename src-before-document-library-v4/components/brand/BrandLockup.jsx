import BrandMark from "./BrandMark";

export default function BrandLockup({ compact = false, className = "" }) {
  return (
    <span className={["anypetos-lockup", compact ? "is-compact" : "", className].filter(Boolean).join(" ")}>
      <BrandMark size={compact ? 31 : 42} className="anypetos-lockup__mark" />
      <span className="anypetos-lockup__copy">
        <strong className="anypetos-lockup__name">AnyPet<span>OS</span></strong>
        {!compact && <small className="anypetos-lockup__tagline">The operating system for every pet</small>}
      </span>
    </span>
  );
}
