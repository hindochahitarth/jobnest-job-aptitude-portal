import Card from "../../components/ui/Card";

const metrics = [
  { label: "Quant", value: "78%" },
  { label: "Logical", value: "84%" },
  { label: "Verbal", value: "69%" },
  { label: "Coding", value: "73%" },
];

export default function Results() {
  return (
    <div className="dashboard-page results-page">
      <div className="result-summary">
        {metrics.map((metric) => (
          <Card key={metric.label} className="metric-card" title={metric.label}>
            <strong>{metric.value}</strong>
          </Card>
        ))}
      </div>

      <Card title="Strength analysis" icon="💡">
        <ul className="analysis-list">
          <li>Strong performance in Logical reasoning, keep practicing time-based puzzles.</li>
          <li>Verbal score can improve with reading practice and vocabulary reviews.</li>
          <li>Coding accuracy is good — aim for faster solution breakdown.</li>
        </ul>
      </Card>
    </div>
  );
}
