import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Signup() {
  const { signup } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CANDIDATE",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRoleSelect(role) {
    setForm({ ...form, role });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      await signup(form);
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err) {
      setMessage(err.message || "Signup failed. Please try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        {/* Brand Side Panel */}
        <aside className="auth-brand">
          <div className="auth-brand-inner">
            <div className="auth-logo-badge">
              <div className="icon-box">JN</div>
              <span>JobNest</span>
            </div>
            <h2>Accelerate Your Career with Verified Aptitude</h2>
            <p>
              Join India's leading skill-verified job portal connecting top talent with employers.
            </p>
            <ul className="auth-feature-list">
              <li><span className="check">✓</span> Verified Aptitude Badges & Scorecards</li>
              <li><span className="check">✓</span> AI Powered ATS Resume Matching</li>
              <li><span className="check">✓</span> Direct Recruiter Talent Pool Discovery</li>
            </ul>
          </div>
        </aside>

        {/* Form Side Panel */}
        <section className="auth-form-section">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-card-header">
              <h1>Get Started</h1>
              <p>Create your free JobNest account</p>
            </div>

            {/* Role Switcher Selector */}
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", display: "block", marginBottom: 8 }}>
                I am registering as:
              </span>
              <div className="role-switcher-grid">
                <button
                  type="button"
                  className={`role-tab-btn ${form.role === "CANDIDATE" ? "active" : ""}`}
                  onClick={() => handleRoleSelect("CANDIDATE")}
                >
                  🎓 Candidate
                </button>
                <button
                  type="button"
                  className={`role-tab-btn ${form.role === "RECRUITER" ? "active" : ""}`}
                  onClick={() => handleRoleSelect("RECRUITER")}
                >
                  👔 Employer / Recruiter
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder={form.role === "CANDIDATE" ? "e.g. John Doe" : "e.g. Sarah Jenkins"}
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Work or Personal Email</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: 6 }}
              disabled={loading}
            >
              {loading ? "Creating Account..." : `Sign Up as ${form.role === "CANDIDATE" ? "Candidate" : "Recruiter"}`}
            </button>

            {message && (
              <div style={{
                marginTop: 14,
                padding: 10,
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: 600,
                background: isError ? "var(--error-bg)" : "var(--success-bg)",
                color: isError ? "var(--error)" : "var(--success)",
                border: `1px solid ${isError ? "#fca5a5" : "#6ee7b7"}`
              }}>
                {message}
              </div>
            )}

            <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-muted)", marginTop: 20 }}>
              Already have an account?{" "}
              <a
                href="/login"
                style={{ fontWeight: 700, color: "var(--primary)" }}
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, "", "/login");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
              >
                Sign In
              </a>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
