import { useState } from "react";
import { signup } from "../../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CANDIDATE",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    try {
      await signup(form);
      setMessage("Account created. You can log in now.");
    } catch {
      setMessage("Signup failed. Try again.");
      setIsError(true);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <aside className="auth-brand">
          <div className="auth-brand-inner">
            <span className="auth-logo">Jobnest</span>
            <h2>Job & Aptitude Portal</h2>
            <p>
              Manage resumes, discover matching roles, and prepare with
              section-wise aptitude tests.
            </p>
            <ul className="auth-features">
              <li>Smart resume parsing</li>
              <li>JD match scoring</li>
              <li>Timed aptitude tests</li>
            </ul>
          </div>
        </aside>

        <section className="auth-form-section">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-card-header">
              <h1>Create account</h1>
              <p>Sign up as a candidate or recruiter</p>
            </div>

            <label>
              Full name
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                placeholder="Minimum 8 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              I am a
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="CANDIDATE">Candidate</option>
                <option value="RECRUITER">Recruiter</option>
              </select>
            </label>

            <button type="submit">Create account</button>

            {message && (
              <p className={`auth-message ${isError ? "error" : "success"}`}>
                {message}
              </p>
            )}

            <p className="auth-footer">
              Already have an account? <a href="#">Sign in</a>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
