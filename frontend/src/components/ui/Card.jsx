export default function Card({ title, icon, footer, className = "", children }) {
  return (
    <section className={`jn-card ${className}`.trim()}>
      {(title || icon) && (
        <header className="card-header">
          {icon && <span className="card-icon">{icon}</span>}
          {title && <h3>{title}</h3>}
        </header>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </section>
  );
}
