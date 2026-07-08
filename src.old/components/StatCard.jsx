export default function StatCard({ icon, value, label, color = "#2dd4bf" }) {
  return (
    <div className="statCard">
      <div className="statIcon" style={{ backgroundColor: color }} aria-hidden="true">
        {icon}
      </div>
      <h2>{value}</h2>
      <p>{label}</p>
    </div>
  );
}
