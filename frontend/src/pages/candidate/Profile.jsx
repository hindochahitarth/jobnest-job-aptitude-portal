import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/ui/Card";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const name = user?.name || "John Doe";
  const email = user?.email || "johndoe@example.com";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="dashboard-grid two-col">
      <div className="main-col" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* LinkedIn Style Profile Header */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ height: 120, background: "linear-gradient(135deg, #0a66c2 0%, #004182 100%)", position: "relative" }} />
          <div style={{ padding: "0 24px 24px", position: "relative" }}>
            <div style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              border: "4px solid #ffffff",
              background: "#0a66c2",
              color: "#fff",
              fontSize: 36,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: -45,
              marginBottom: 12,
              boxShadow: "var(--shadow-md)"
            }}>
              {initial}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)" }}>{name}</h2>
                <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>
                  Computer Science Student • Full Stack Developer • Seeking SDE Roles
                </p>
                <p style={{ fontSize: 13, color: "var(--text-subtle)", marginTop: 4 }}>
                  📍 Bengaluru, India • {email}
                </p>
              </div>
              <button type="button" className="btn btn-secondary btn-sm">
                ✏️ Edit Profile
              </button>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--surface-border)", display: "flex", gap: 12 }}>
              <span className="badge-v2 success">Verified Aptitude: 94th Percentile</span>
              <span className="badge-v2 primary">Available for Hiring</span>
            </div>
          </div>
        </div>

        {/* Profile Strength Meter */}
        <Card title="Profile Strength" icon="📈">
          <div className="profile-meter-box">
            <div className="meter-header">
              <span>Overall Completeness</span>
              <span>84%</span>
            </div>
            <div className="meter-bar">
              <div className="meter-fill" style={{ width: "84%" }} />
            </div>
            <p className="meter-subtext">Add 1 project or complete a coding assessment to reach 100% and get 3.5x more recruiter views.</p>
          </div>
        </Card>

        {/* Verified Skills */}
        <Card title="Verified Aptitude & Technical Skills" icon="🧠">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <span className="badge-v2 success" style={{ padding: "6px 12px", fontSize: 13 }}>
              ✓ Quantitative Reasoning (94%)
            </span>
            <span className="badge-v2 success" style={{ padding: "6px 12px", fontSize: 13 }}>
              ✓ Logical Thinking (88%)
            </span>
            <span className="badge-v2 primary" style={{ padding: "6px 12px", fontSize: 13 }}>
              React.js
            </span>
            <span className="badge-v2 primary" style={{ padding: "6px 12px", fontSize: 13 }}>
              JavaScript (ES6+)
            </span>
            <span className="badge-v2 primary" style={{ padding: "6px 12px", fontSize: 13 }}>
              SQL & PostgreSQL
            </span>
            <span className="badge-v2 neutral" style={{ padding: "6px 12px", fontSize: 13 }}>
              Node.js
            </span>
          </div>
        </Card>
      </div>

      <div className="side-col" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Card title="Next Action Items" icon="🚀">
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
            <li style={{ padding: 10, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
              <strong>Upload updated PDF Resume</strong>
              <div style={{ color: "var(--text-subtle)", marginTop: 2 }}>Boost your AI resume score</div>
            </li>
            <li style={{ padding: 10, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
              <strong>Take Verbal Assessment</strong>
              <div style={{ color: "var(--text-subtle)", marginTop: 2 }}>Earn your verbal skill badge</div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
