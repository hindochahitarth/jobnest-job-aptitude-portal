import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Overview from "./Overview";
import PostJob from "./PostJob";
import Applicants from "./Applicants";
import Shortlisted from "./Shortlisted";
import Reports from "./Reports";
import AITools from "./AITools";

const sidebarItems = [
  { key: "dash", href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { key: "post", href: "/dashboard/post-job", label: "Post Job", icon: "✍️" },
  { key: "applicants", href: "/dashboard/applicants", label: "Applicants", icon: "🧾" },
  { key: "shortlisted", href: "/dashboard/shortlisted", label: "Shortlisted", icon: "⭐" },
  { key: "reports", href: "/dashboard/reports", label: "Reports", icon: "📈" },
  { key: "ai", href: "/dashboard/ai-tools", label: "AI Tools", icon: "🤖" },
];

function resolveSection(path) {
  if (!path || path === "/" || path === "") return <Overview />;
  switch (path) {
    case "/post-job":
      return <PostJob />;
    case "/applicants":
      return <Applicants />;
    case "/shortlisted":
      return <Shortlisted />;
    case "/reports":
      return <Reports />;
    case "/ai-tools":
      return <AITools />;
    default:
      return <Overview />;
  }
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const currentPath = window.location.pathname.replace("/dashboard", "") || "/";
  const title = user ? `Recruiter Dashboard` : "Recruiter Dashboard";

  return (
    <DashboardLayout items={sidebarItems} title={title} subtitle="Manage hiring and candidate flow">{resolveSection(currentPath)}</DashboardLayout>
  );
}
