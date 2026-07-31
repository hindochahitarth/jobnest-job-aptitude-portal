import Card from "../../components/ui/Card";
import ChartCard from "../../components/ui/ChartCard";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const stats = [
  { label: "Jobs Posted", value: "8" },
  { label: "Applicants", value: "184" },
  { label: "Shortlisted", value: "26" },
  { label: "Offers Sent", value: "7" },
];

const hires = [
  { name: "Week 1", hires: 2 },
  { name: "Week 2", hires: 1 },
  { name: "Week 3", hires: 3 },
  { name: "Week 4", hires: 1 },
];

export default function Overview() {
  return (
    <div className="dashboard-page recruiter-overview-page">
      <div className="stat-grid">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat-card" title={stat.label}>
            <strong>{stat.value}</strong>
          </Card>
        ))}
      </div>

      <div className="dashboard-panels recruiter-panels">
        <ChartCard title="Hiring activity" subtitle="Recent hires and progress">
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hires} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 16, borderColor: "rgba(255,255,255,0.12)" }} />
                <Bar dataKey="hires" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card className="recruiter-card" title="Top open roles" icon="📌">
          <ul className="top-roles">
            <li>React Engineer — 32 applicants</li>
            <li>Data Scientist — 19 applicants</li>
            <li>Operations Intern — 14 applicants</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
