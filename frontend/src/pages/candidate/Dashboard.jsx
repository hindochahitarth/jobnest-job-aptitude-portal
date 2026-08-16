import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Overview from "./Overview";
import JobsPage from "./Jobs";
import Profile from "./Profile";
import ResumeBuilder from "./ResumeBuilder";
import MatchScores from "./MatchScores";
import Tests from "./Tests";
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
    { key: "dash", href: "/dashboard", label: "Feed & Overview", icon: "🏠" },
    { key: "profile", href: "/dashboard/profile", label: "My Profile", icon: "👤", badge: profileBadge },
    { key: "jobs", href: "/dashboard/jobs", label: "Recommended Jobs", icon: "💼" },
    { key: "resume", href: "/dashboard/resume", label: "AI Resume Builder", icon: "📄" },
    { key: "match", href: "/dashboard/match-scores", label: "Match Scores", icon: "🎯" },
    { key: "tests", href: "/dashboard/tests", label: "Aptitude Tests", icon: "🧠" },
    { key: "results", href: "/dashboard/results", label: "Test Scorecards", icon: "📊" },
    { key: "interview", href: "/dashboard/interview", label: "Interview Prep", icon: "🧪" },
  ];

  return (
    <DashboardLayout items={sidebarItems} title={title} subtitle="Candidate Hub">
      {resolveSection(currentPath)}
    </DashboardLayout>
  );
}
