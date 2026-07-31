export default function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card card">
      <div className="chart-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="chart-card-body">{children}</div>
    </div>
  );
}
