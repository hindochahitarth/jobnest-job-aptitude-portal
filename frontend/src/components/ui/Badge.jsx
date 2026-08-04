export default function Badge({ label, variant = "primary" }) {
  return <span className={`badge-v2 ${variant}`}>{label}</span>;
}
