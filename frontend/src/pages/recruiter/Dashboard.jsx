import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Overview from "./Overview";
import PostJob from "./PostJob";
import Applicants from "./Applicants";
import Shortlisted from "./Shortlisted";
import Reports from "./Reports";
import AITools from "./AITools";
import * as api from "../../services/api";

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
  const { user, token } = useContext(AuthContext);
  const [newApplicantsCount, setNewApplicantsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchApplicants() {
      if (!token) return;
      try {
        const data = await api.getRecruiterApplicants(token);
        if (!cancelled) {
          const newCount = data.filter((app) => app.status === "APPLIED").length;
          setNewApplicantsCount(newCount);
        }
      } catch (err) {
        console.error("Failed to load applicants", err);
      }
    }
    fetchApplicants();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const sidebarItems = [
    { key: "dash", href: "/dashboard", label: "Hiring Overview" },
    { key: "post", href: "/dashboard/post-job", label: "Post New Job" },
    { key: "applicants", href: "/dashboard/applicants", label: "Applicants ATS", badge: newApplicantsCount > 0 ? `${newApplicantsCount} New` : null },
    { key: "shortlisted", href: "/dashboard/shortlisted", label: "Shortlisted Talent" },
    { key: "reports", href: "/dashboard/reports", label: "Analytics & Reports" },
    { key: "ai", href: "/dashboard/ai-tools", label: "AI Screening Suite" },
  ];

  const currentPath = window.location.pathname.replace("/dashboard", "") || "/";
  const title = user ? `Recruiter Hub — ${user.name || "Hiring Manager"}` : "Recruiter Portal";

  return (
    <DashboardLayout items={sidebarItems} title={title} subtitle="Recruiter Portal">
      {resolveSection(currentPath)}
    </DashboardLayout>
  );
}
