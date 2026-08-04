import { useState } from "react";
import Card from "../../components/ui/Card";

export default function PostJob() {
  const [form, setForm] = useState({
    title: "",
    company: "Acme Corp",
    location: "",
    salary: "",
    expLevel: "0-2",
    aptitudeCutoff: "80",
    deadline: "",
    skills: "",
    description: "",
  });

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    alert(`Job successfully posted on JobNest: ${form.title}!`);
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <div className="dashboard-grid two-col">
      <div className="main-col">
        <Card title="Post a New Job Opening" icon="✍️">
          <form className="job-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="input-group">
              <label>Job Title *</label>
              <input
                className="input-field"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="input-group">
                <label>Company Name *</label>
                <input
                  className="input-field"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Acme Corp"
                  required
                />
              </div>

              <div className="input-group">
                <label>Location / Work Mode *</label>
                <input
                  className="input-field"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Remote / Bengaluru"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="input-group">
                <label>Salary Package (LPA) *</label>
                <input
                  className="input-field"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="e.g. ₹8 LPA - ₹12 LPA"
                  required
                />
              </div>

              <div className="input-group">
                <label>Minimum Aptitude Cutoff Score (%)</label>
                <select className="input-field" name="aptitudeCutoff" value={form.aptitudeCutoff} onChange={handleChange}>
                  <option value="70">&gt; 70% Cutoff</option>
                  <option value="80">&gt; 80% Cutoff (Recommended)</option>
                  <option value="85">&gt; 85% Cutoff (High Priority)</option>
                  <option value="90">&gt; 90% Cutoff (Elite)</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Required Skills (Comma separated) *</label>
              <input
                className="input-field"
                name="skills"
                value={form.skills}
                onChange={handleChange}
                placeholder="React, JavaScript, SQL, Problem Solving"
                required
              />
            </div>

            <div className="input-group">
              <label>Application Deadline *</label>
              <input
                type="date"
                className="input-field"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
              Publish Job & Screen Applicants
            </button>
          </form>
        </Card>
      </div>

      <div className="side-col">
        <Card title="Recruiter Job Posting Tips" icon="💡">
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--text-main)" }}>
            <li>✔️ Setting an Aptitude Cutoff filters out unverified candidates automatically.</li>
            <li>✔️ Standardized skill tags increase candidate match accuracy by 40%.</li>
            <li>✔️ Including salary ranges gets 2.5x more qualified applications on JobNest.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
