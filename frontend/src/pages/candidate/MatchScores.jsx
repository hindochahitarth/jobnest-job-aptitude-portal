import Card from "../../components/ui/Card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const scores = [
  { name: "Technical", score: 80 },
  { name: "Communication", score: 72 },
  { name: "Culture", score: 65 },
];
const colors = ["#7c3aed", "#2563eb", "#38bdf8"];

export default function MatchScores() {
  return (
    <div className="dashboard-page match-scores-page">
      <div className="chart-summary-grid">
        <Card title="Match score summary" icon="📊">
          <p>These scores reflect the latest matches between your resume and active job listings.</p>
          <ul className="match-list">
            {scores.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.score}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="donut-card" title="Match breakdown" icon="🎯">
          <div className="chart-wrapper small">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={scores} dataKey="score" nameKey="name" innerRadius={60} outerRadius={98} paddingAngle={4}>
                  {scores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 14, borderColor: "rgba(255,255,255,0.12)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
