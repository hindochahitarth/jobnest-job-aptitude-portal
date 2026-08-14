import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await login(form);
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err) {
      setMessage(err.message || "Invalid email or password. Please try again.");
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
            <a
              href="/"
              className="auth-logo-badge"
              onClick={(e) => { e.preventDefault(); navigateTo("/"); }}
              style={{ textDecoration: "none", cursor: "pointer" }}
            >
              <div className="icon-box">JN</div>
              <span>JobNest</span>
            </a>
            <h2>Welcome Back</h2>
            <p>
              Sign in to manage your aptitude assessments, track job applications, and access recruiter shortlists.
            </p>
            <ul className="auth-feature-list">
              <li><span className="check">✓</span> Verified Aptitude Performance Reports</li>
              <li><span className="check">✓</span> AI Recommended Jobs Feed</li>
              <li><span className="check">✓</span> Real-time Hiring Pipeline Tracking</li>
            </ul>
          </div>
        </aside>

        {/* Form Side Panel */}
        <section className="auth-form-section">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-card-header">
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); navigateTo("/"); }}
                style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 12 }}
              >
                ← Back to Home
              </a>
              <h1>Sign In</h1>
              <p>Access your JobNest account</p>
            </div>

            <div className="input-group">
              <label>Email Address</label>
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
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", marginTop: 6 }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {message && (
              <div style={{
                marginTop: 14,
                padding: 10,
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: 600,
                background: "var(--error-bg)",
                color: "var(--error)",
                border: "1px solid #fca5a5"
              }}>
                {message}
              </div>
            )}

            <p style={{ textAlign: "center", fontSize: 13.5, color: "var(--text-muted)", marginTop: 20 }}>
              New to JobNest?{" "}
              <a
                href="/signup"
                style={{ fontWeight: 700, color: "var(--primary)" }}
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, "", "/signup");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
              >
                Create Account
              </a>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
