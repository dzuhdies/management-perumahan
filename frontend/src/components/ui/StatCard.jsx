function StatCard({ title, value, description }) {
  return (
    <article className="stat-card">
      <p className="stat-card-title">{title}</p>
      <h3 className="stat-card-value">{value}</h3>
      <p className="stat-card-description">{description}</p>
    </article>
  );
}

export default StatCard;