import Card from "../../components/ui/Card";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const analytics = [
  { name: "Week 1", value: 4 },
  { name: "Week 2", value: 6 },
  { name: "Week 3", value: 9 },
  { name: "Week 4", value: 11 },
];

export default function Reports() {
  return (
    <div className="dashboard-page reports-page">
      <Card title="Recruitment analytics" icon="📈">
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 16, borderColor: "rgba(255,255,255,0.12)" }} />
              <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="rgba(56,189,248,0.22)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="reports-summary">
        <Card title="Hiring velocity" icon="⚡">
          <p>Your hiring funnel has improved this month. Focus next on reducing review time and accelerating applicant engagement.</p>
        </Card>
      </div>
    </div>
  );
}
