export default function Skeleton({ width = "100%", height = "1rem", radius = "0.65rem", className = "" }) {
  return <span className={["ui-skeleton", className].filter(Boolean).join(" ")} style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}
