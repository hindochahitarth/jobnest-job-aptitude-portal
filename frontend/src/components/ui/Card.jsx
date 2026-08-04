export default function Card({ title, icon, footer, className = "", children }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || icon) && (
        <header className="card-header">
          <h3>
            {icon && <span>{icon}</span>}
            {title}
          </h3>
        </header>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer" style={{ padding: "12px 20px", borderTop: "1px solid var(--surface-border)", background: "var(--bg-subtle)" }}>{footer}</div>}
    </section>
  );
}
