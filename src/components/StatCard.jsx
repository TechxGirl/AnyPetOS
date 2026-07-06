// =====================================================
// 🟢 StatCard.jsx
//
// Premium dashboard statistic card.
//
// =====================================================

export default function StatCard({
  icon,
  value,
  label,
  color = "#3dd9c5",
}) {
  return (
    <div className="statCard">
      <div
        className="statIcon"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>

      <h2>{value}</h2>

      <p>{label}</p>
    </div>
  );
}