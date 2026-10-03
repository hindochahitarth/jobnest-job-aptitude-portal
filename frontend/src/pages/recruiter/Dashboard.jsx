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
    {
      key: "dash", href: "/dashboard", label: "Hiring Overview",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>),
    },
    {
      key: "post", href: "/dashboard/post-job", label: "Post New Job",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>),
    },
    {
      key: "applicants", href: "/dashboard/applicants", label: "Applicants ATS",
      badge: newApplicantsCount > 0 ? `${newApplicantsCount} New` : null,
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    },
    {
      key: "shortlisted", href: "/dashboard/shortlisted", label: "Shortlisted Talent",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
    },
    {
      key: "reports", href: "/dashboard/reports", label: "Analytics & Reports",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
    },
    {
      key: "ai", href: "/dashboard/ai-tools", label: "AI Screening Suite",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
    },
  ];


  const currentPath = window.location.pathname.replace("/dashboard", "") || "/";
  const title = user ? `Recruiter Hub — ${user.name || "Hiring Manager"}` : "Recruiter Portal";

  return (
    <DashboardLayout items={sidebarItems} title={title} subtitle="Recruiter Portal">
      {resolveSection(currentPath)}
    </DashboardLayout>
  );
}
