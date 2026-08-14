import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/landing/Footer";
import JobCard from "../../components/job/JobCard";
import Card from "../../components/ui/Card";
import "../../assets/styles/landing.css";

const mockJobs = [
  { id: 1, title: "Frontend React Engineer", company: "Acme Corp", location: "Remote / India", match: 92, salary: "₹8 LPA - ₹12 LPA", snippet: "Build web applications with React, Redux, and modern CSS modules.", skills: "React, JavaScript, CSS" },
  { id: 2, title: "Data Analyst", company: "DataCorp Analytics", location: "Bengaluru", match: 86, salary: "₹9 LPA - ₹13 LPA", snippet: "Transform business metrics into actionable SQL queries and dashboard reports.", skills: "SQL, Python, PowerBI" },
  { id: 3, title: "Full Stack Developer Trainee", company: "CloudScale Tech", location: "Hyderabad", match: 79, salary: "₹6 LPA - ₹10 LPA", snippet: "Develop RESTful APIs using Node.js, Express, and PostgreSQL.", skills: "Node.js, React, SQL" },
  { id: 4, title: "Software QA & Aptitude Intern", company: "QualityFirst", location: "Pune", match: 74, salary: "₹5 LPA - ₹7 LPA", snippet: "Write automated test suites and verify system aptitude pipelines.", skills: "Jest, Cypress, Java" },
];

export default function JobsPage({ embed = false }) {
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedJob, setSelectedJob] = useState(mockJobs[0]);

  const filteredJobs = mockJobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleApply(job) {
    if (!isLoggedIn) {
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }
    alert(`Successfully applied to ${job.title} at ${job.company}!`);
  }

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Naukri Style Search Bar */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: 12, alignItems: "center" }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search by job title, skill (e.g. React, SQL)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="input-field"
              placeholder="📍 Filter by location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary">
            Search
          </button>
        </div>
      </Card>

      {/* Main Jobs Split View */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        {/* Job Cards Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              style={{
                cursor: "pointer",
                border: selectedJob.id === job.id ? "2px solid var(--primary)" : "1px solid var(--surface-border)",
                borderRadius: "var(--radius-md)"
              }}
            >
              <JobCard job={isLoggedIn ? job : { ...job, match: null }} onApply={handleApply} showApply={isLoggedIn} />
            </div>
          ))}
        </div>

        {/* Selected Job Detail Drawer / View */}
        <div>
          {selectedJob && (
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  {isLoggedIn && (
                    <span className="badge-v2 success" style={{ marginBottom: 8 }}>
                      🎯 {selectedJob.match}% Match Confidence
                    </span>
                  )}
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>
                    {selectedJob.title}
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>
                    {selectedJob.company} • {selectedJob.location}
                  </p>
                </div>

                <div style={{ padding: 12, background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 700 }}>
                  Salary Package: {selectedJob.salary}
                </div>

                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Role Description</h4>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {selectedJob.snippet} As part of the engineering team, you will collaborate with product designers, solve quantitative problems, and build scalable user features.
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Required Skills & Aptitude</h4>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedJob.skills.split(",").map((s, i) => (
                      <span key={i} className="badge-v2 primary">{s.trim()}</span>
                    ))}
                    <span className="badge-v2 success">Aptitude Score &gt; 80%</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", marginTop: 10 }}
                  onClick={() => handleApply(selectedJob)}
                >
                  {isLoggedIn ? "Apply Now with JobNest Profile" : "Login to Apply"}
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  if (embed) return content;

  return (
    <div className="landing-page">
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)" }}>Explore Jobs</h1>
          <p style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 4 }}>Browse open positions from top employers on JobNest</p>
        </div>
        {content}
      </main>
      <Footer />
    </div>
  );
}
