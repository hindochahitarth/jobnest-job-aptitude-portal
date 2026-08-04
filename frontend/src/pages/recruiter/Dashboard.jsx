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
  { key: "dash", href: "/dashboard", label: "Hiring Overview", icon: "🏠" },
  { key: "post", href: "/dashboard/post-job", label: "Post New Job", icon: "✍️" },
  { key: "applicants", href: "/dashboard/applicants", label: "Applicants ATS", icon: "🧾", badge: "24 New" },
  { key: "shortlisted", href: "/dashboard/shortlisted", label: "Shortlisted Talent", icon: "⭐" },
  { key: "reports", href: "/dashboard/reports", label: "Analytics & Reports", icon: "📈" },
  { key: "ai", href: "/dashboard/ai-tools", label: "AI Screening Suite", icon: "🤖" },
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

export default function RecruiterDashboard() {
  const { user } = useContext(AuthContext);
  const currentPath = window.location.pathname.replace("/dashboard", "") || "/";
  const title = user ? `Recruiter Hub — ${user.name || "Hiring Manager"}` : "Recruiter Portal";

  return (
    <DashboardLayout items={sidebarItems} title={title} subtitle="Recruiter Portal">
      {resolveSection(currentPath)}
    </DashboardLayout>
  );
}
