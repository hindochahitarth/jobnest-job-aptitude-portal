import Card from "../../components/ui/Card";
import ChartCard from "../../components/ui/ChartCard";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const analytics = [
  { month: "Jan", timeToHire: 18, passRate: 72 },
  { month: "Feb", timeToHire: 15, passRate: 78 },
  { month: "Mar", timeToHire: 12, passRate: 84 },
  { month: "Apr", timeToHire: 9, passRate: 88 },
];

export default function Reports() {
  return (
    <div className="dashboard-grid two-col">
      <div className="main-col">
        <ChartCard title="Recruitment Efficiency & Time-to-Hire Trend" subtitle="Average days to hire candidates with pre-screened aptitude scores">
          <div style={{ width: "100%", height: 260, paddingTop: 10 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", borderRadius: 10, color: "#fff", border: "none" }} />
                <Area type="monotone" dataKey="timeToHire" stroke="#0a66c2" fill="rgba(10, 102, 194, 0.15)" strokeWidth={3} name="Time-to-Hire (Days)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="side-col">
        <Card title="Assessment Metrics" icon="📈">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>88%</div>
              <div style={{ fontSize: 12, color: "var(--text-subtle)" }}>Aptitude Screening Accuracy</div>
            </div>
            <div style={{ padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--success)" }}>9.2 Days</div>
              <div style={{ fontSize: 12, color: "var(--text-subtle)" }}>Average Offer Cycle Time</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
