import { useContext } from "react";
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

const sidebarItems = [
  { key: "dash", href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { key: "profile", href: "/dashboard/profile", label: "My Profile", icon: "👤" },
  { key: "resume", href: "/dashboard/resume", label: "Resume Builder", icon: "📄" },
  { key: "jobs", href: "/dashboard/jobs", label: "Jobs", icon: "💼" },
  { key: "match", href: "/dashboard/match-scores", label: "Match Scores", icon: "🎯" },
  { key: "tests", href: "/dashboard/tests", label: "Aptitude Tests", icon: "🧠" },
  { key: "results", href: "/dashboard/results", label: "Results", icon: "📊" },
  { key: "interview", href: "/dashboard/interview", label: "Interview Prep", icon: "🧪" },
];

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
  const { user } = useContext(AuthContext);
  const currentPath = window.location.pathname.replace("/dashboard", "") || "/";
  const title = user ? `Welcome back, ${user.name?.split(" ")[0] || "Candidate"}` : "Candidate Dashboard";

  return (
    <DashboardLayout items={sidebarItems} title={title} subtitle="Your candidate hub">{resolveSection(currentPath)}</DashboardLayout>
  );
}
