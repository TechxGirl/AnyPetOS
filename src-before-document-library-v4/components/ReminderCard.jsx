export default function ReminderCard({
  title,
  value,
  tone = "normal",
}) {
  return (
    <div className={`card reminderCard ${tone}`}>
      {/* 🟢 Reminder Title */}
      <p>{title}</p>

      {/* 🟢 Reminder Value */}
      <h3>{value}</h3>
    </div>
  );
}