import { useEffect, useState, useContext } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Home from "./pages/Landing/Home";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import CandidateDashboard from "./pages/candidate/Dashboard";
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import JobsPage from "./pages/candidate/Jobs";

function Router() {
  const { user } = useContext(AuthContext);
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Redirect helper
  function redirectTo(target) {
    window.history.pushState({}, "", target);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return null;
  }

  // Guest-only routes: redirect logged-in users to dashboard
  if (path === "/login") return user ? redirectTo("/dashboard") : <Login />;
  if (path === "/signup") return user ? redirectTo("/dashboard") : <Register />;

  // Protected routes: redirect guests to login
  if (path === "/jobs") return <JobsPage />;
  if (path.startsWith("/dashboard")) return <DashboardSwitcher />;

  // default to landing home
  return <Home />;
}

function DashboardSwitcher() {
  const { user } = useContext(AuthContext);
  if (!user) {
    // not authenticated
    window.history.pushState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
    return null;
  }

  if (user.role === "RECRUITER") return <RecruiterDashboard />;
  return <CandidateDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
