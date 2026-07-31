import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await login(form);
      window.history.pushState({}, "", "/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } catch (err) {
      setMessage(err.message || "Login failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <aside className="auth-brand">
          <div className="auth-brand-inner">
            <span className="auth-logo">Jobnest</span>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your dashboard and tests.</p>
          </div>
        </aside>

        <section className="auth-form-section">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="auth-card-header">
              <h1>Sign in</h1>
              <p>Access your account</p>
            </div>

            <label>
              Email
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
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit">Sign in</button>

            {message && <p className="auth-message error">{message}</p>}

            <p className="auth-footer">
              New here? <a href="/signup" onClick={(e) => { e.preventDefault(); window.history.pushState({}, "", "/signup"); window.dispatchEvent(new PopStateEvent("popstate")); }}>Create an account</a>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
