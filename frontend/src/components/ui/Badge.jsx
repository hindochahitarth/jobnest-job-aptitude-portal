export default function Badge({ label, variant = "primary" }) {
  return <span className={`badge badge-${variant}`}>{label}</span>;
}
