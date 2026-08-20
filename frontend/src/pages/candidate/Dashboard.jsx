import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Overview from "./Overview";
import JobsPage from "./Jobs";
import Profile from "./Profile";
import ResumeBuilder from "./ResumeBuilder";
import MatchScores from "./MatchScores";
import Tests from "./Tests";
import AptitudeTest from "./AptitudeTest";
import Results from "./Results";
import InterviewPrep from "./InterviewPrep";
import * as api from "../../services/api";

function resolveSection(path) {
  if (!path || path === "/" || path === "") return <Overview />;
  switch (path) {
    case "/profile":
      return <Profile />;
    case "/resume":
      return <ResumeBuilder />;
    case "/jobs":
      return <JobsPage embed />;
    case "/match-scores":
      return <MatchScores />;
    case "/tests":
      return <Tests />;
    case "/test-session":
      return <AptitudeTest />;
    case "/results":
      return <Results />;
    case "/interview":
      return <InterviewPrep />;
    default:
      return <Overview />;
  }
}

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const currentPath = window.location.pathname.replace("/dashboard", "") || "/";
  const title = user ? `Welcome back, ${user.name?.split(" ")[0] || "Candidate"}` : "Candidate Hub";

  const [profileBadge, setProfileBadge] = useState(null);

  useEffect(() => {
    if (!token || user?.role === "RECRUITER") return;
    let cancelled = false;
    api.getProfile(token)
      .then((data) => {
        if (!cancelled) setProfileBadge(`${data.completionPercentage ?? 0}%`);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, user?.role, currentPath]);

  const sidebarItems = [
    {
      key: "dash", href: "/dashboard", label: "Feed & Overview",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>),
    },
    {
      key: "profile", href: "/dashboard/profile", label: "My Profile", badge: profileBadge,
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>),
    },
    {
      key: "jobs", href: "/dashboard/jobs", label: "Recommended Jobs",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>),
    },
    {
      key: "resume", href: "/dashboard/resume", label: "AI Resume Builder",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>),
    },
    {
      key: "match", href: "/dashboard/match-scores", label: "Match Scores",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>),
    },
    {
      key: "tests", href: "/dashboard/tests", label: "Aptitude Tests",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>),
    },
    {
      key: "test-session", href: "/dashboard/test-session", label: "Live Proctored Test",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>),
    },
    {
      key: "results", href: "/dashboard/results", label: "Test Scorecards",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>),
    },
    {
      key: "interview", href: "/dashboard/interview", label: "Interview Prep",
      icon: (<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
    },
  ];

  return (
    <DashboardLayout items={sidebarItems} title={title} subtitle="Candidate Hub">
      {resolveSection(currentPath)}
    </DashboardLayout>
  );
}
