import JobCard from "../../components/job/JobCard";
import Card from "../../components/ui/Card";
import ChartCard from "../../components/ui/ChartCard";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const stats = [
  { label: "Profile Completion", value: "84%" },
  { label: "Applications Sent", value: "12" },
  { label: "Average Match", value: "71%" },
  { label: "Tests Completed", value: "5" },
];

const performance = [
  { name: "Week 1", score: 64 },
  { name: "Week 2", score: 72 },
  { name: "Week 3", score: 78 },
  { name: "Week 4", score: 83 },
];

const jobs = [
  { id: 1, title: "Frontend Intern", company: "Acme", location: "Remote", match: 72, snippet: "Design modern product pages and user flows." },
  { id: 2, title: "Product Analyst", company: "NexGen", location: "Bengaluru", match: 68, snippet: "Analyze user behavior and help shape hiring decisions." },
  { id: 3, title: "Growth Associate", company: "ScaleUp", location: "Hyderabad", match: 76, snippet: "Support hiring campaigns and candidate outreach." },
];

export default function Overview() {
  return (
    <div className="dashboard-page">
      <div className="stat-grid">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat-card" title={stat.label}>
            <strong>{stat.value}</strong>
          </Card>
        ))}
      </div>

      <div className="dashboard-panels">
        <ChartCard title="Match Score Trend" subtitle="Weekly progress from your latest applications">
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={performance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", borderColor: "rgba(255,255,255,0.12)", borderRadius: 16 }} />
                <Area type="monotone" dataKey="score" stroke="#7c3aed" fill="rgba(124,58,237,0.25)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card className="recommendations-card" title="Recommended roles">
          <div className="job-preview-list">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={() => alert(`Applied to ${job.title}`)} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
