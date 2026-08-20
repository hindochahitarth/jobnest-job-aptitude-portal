import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/landing/Footer";
import JobCard from "../../components/job/JobCard";
import Card from "../../components/ui/Card";
import * as api from "../../services/api";
import "../../assets/styles/landing.css";

export default function JobsPage({ embed = false }) {
  const { user, token } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [candidateProfile, setCandidateProfile] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("matched"); // 'matched' | 'all'
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [expFilter, setExpFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        if (isLoggedIn && token && user.role === "CANDIDATE") {
          // Fetch candidate profile, jobs, and existing applications in parallel
          const [profileData, recJobs, allJobsData, myApplications] = await Promise.all([
            api.getProfile(token).catch(() => null),
            api.getRecommendedJobs(token).catch(() => []),
            api.getCandidateAllJobs(token).catch(() => []),
            api.getCandidateApplications(token).catch(() => []),
          ]);

          if (cancelled) return;

          setCandidateProfile(profileData);
          setRecommendedJobs(recJobs);
          setAllJobs(allJobsData);

          // Restore already-applied state from DB
          if (myApplications && myApplications.length > 0) {
            const applied = {};
            myApplications.forEach((app) => { applied[app.jobId] = true; });
            setAppliedJobs(applied);
          }

          // Choose default tab and selected job
          if (recJobs && recJobs.length > 0) {
            setActiveTab("matched");
            setSelectedJob(recJobs[0]);
          } else {
            setActiveTab("all");
            if (allJobsData && allJobsData.length > 0) {
              setSelectedJob(allJobsData[0]);
            }
          }
        } else {
          // Guest or recruiter
          const publicJobs = await api.getPublicJobs();
          if (cancelled) return;
          setAllJobs(publicJobs);
          setActiveTab("all");
          if (publicJobs && publicJobs.length > 0) {
            setSelectedJob(publicJobs[0]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load jobs");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [token, isLoggedIn, user?.role]);

  const candidateSkills = candidateProfile?.techStack || [];
  const hasSkills = candidateSkills.length > 0;

  // Determine current list to display based on active tab
  const currentList = activeTab === "matched" ? recommendedJobs : allJobs;

  // Extract unique locations and experience levels
  const availableLocations = [...new Set(currentList.map(j => j.location).filter(Boolean))].sort();
  const availableExpLevels = [...new Set(currentList.map(j => j.expLevel).filter(Boolean))].sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
  });

  // Filter list by search term, location, and exp level
  const filteredJobs = currentList.filter((j) => {
    const term = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !term ||
      j.title.toLowerCase().includes(term) ||
      j.company.toLowerCase().includes(term) ||
      (j.skills && j.skills.toLowerCase().includes(term));

    const matchesLoc = !locationFilter || j.location === locationFilter;
    const matchesExp = !expFilter || j.expLevel === expFilter;

    return matchesSearch && matchesLoc && matchesExp;
  });

  // Ensure selectedJob remains valid when list changes
  useEffect(() => {
    if (filteredJobs.length > 0) {
      const exists = filteredJobs.some((j) => j.id === selectedJob?.id);
      if (!exists) {
        setSelectedJob(filteredJobs[0]);
      }
    } else {
      setSelectedJob(null);
    }
  }, [activeTab, searchTerm, locationFilter, expFilter, filteredJobs.length]);

  async function handleApply(job) {
    if (!isLoggedIn) {
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }

    // Already applied (optimistic check)
    if (appliedJobs[job.id]) return;

    try {
      await api.applyToJob(job.id, token);
      setAppliedJobs((prev) => ({ ...prev, [job.id]: true }));
      setToastMessage(`🎉 Application sent to ${job.company} for "${job.title}"!`);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("already applied")) {
        setAppliedJobs((prev) => ({ ...prev, [job.id]: true }));
        setToastMessage(`ℹ️ You already applied to "${job.title}".`);
      } else {
        setToastMessage(`⚠️ ${err.message || "Failed to apply. Please try again."}`);
      }
    } finally {
      setTimeout(() => setToastMessage(null), 3500);
    }
  }

  function navigateTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toastMessage && (
        <div className="profile-toast success" style={{ position: "fixed", top: 24, right: 24, zIndex: 9999 }}>
          {toastMessage}
        </div>
      )}

      {/* Candidate Profile Skills Summary Bar (if candidate) */}
      {isLoggedIn && user?.role === "CANDIDATE" && (
        <div
          style={{
            background: "var(--surface)",
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--surface-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-main)" }}>
              Your Profile Tech Stack:
            </span>
            {hasSkills ? (
              candidateSkills.map((skill, i) => (
                <span
                  key={i}
                  className="badge-v2 primary"
                  style={{ fontSize: 12, padding: "4px 10px" }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ fontSize: 13, color: "var(--text-subtle)", fontStyle: "italic" }}>
                No tech skills configured yet
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigateTo("/dashboard/profile")}
          >
            {hasSkills ? "Update Skills" : "Add Skills in Profile"}
          </button>
        </div>
      )}

      {/* Search & Location Filter Bar */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12, alignItems: "center" }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search jobs by title, company, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <select
              className="input-field"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <select
              className="input-field"
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
            >
              <option value="">All Experience Levels</option>
              {availableExpLevels.map(exp => (
                <option key={exp} value={exp}>{exp} Years</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
              setExpFilter("");
            }}
          >
            Reset
          </button>
        </div>
      </Card>

      {/* Tabs Selector for Candidates */}
      {isLoggedIn && user?.role === "CANDIDATE" && (
        <div style={{ display: "flex", gap: 10, borderBottom: "1px solid var(--surface-border)", paddingBottom: 12 }}>
          <button
            type="button"
            className={`btn ${activeTab === "matched" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveTab("matched")}
          >
            Matched to My Skills ({recommendedJobs.length})
          </button>
          <button
            type="button"
            className={`btn ${activeTab === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveTab("all")}
          >
            All Available Jobs ({allJobs.length})
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="profile-loading">
          <div className="spinner" />
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Finding matching job opportunities...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--error)", fontSize: 14, fontWeight: 600 }}>⚠️ {error}</p>
        </div>
      )}

      {/* Main Jobs Split View */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
          {/* Job Cards Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  style={{
                    cursor: "pointer",
                    border: selectedJob?.id === job.id ? "2px solid var(--primary)" : "1px solid var(--surface-border)",
                    borderRadius: "var(--radius-md)",
                    background: selectedJob?.id === job.id ? "var(--primary-soft)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  <JobCard
                    job={job}
                    onApply={handleApply}
                    showApply={isLoggedIn}
                    isSelected={selectedJob?.id === job.id}
                  />
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: 40,
                  background: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--surface-border)",
                  textAlign: "center",
                }}
              >
                {activeTab === "matched" && !hasSkills ? (
                  <>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>
                      Add Your Skills to See Matching Jobs
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 450, margin: "0 auto 18px", lineHeight: 1.5 }}>
                      You haven't added any tech skills to your candidate profile yet. Update your profile to unlock personalized AI job recommendations!
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => navigateTo("/dashboard/profile")}
                      >
                        ⚡ Complete Skills Profile
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setActiveTab("all")}
                      >
                        Browse All Open Jobs
                      </button>
                    </div>
                  </>
                ) : activeTab === "matched" ? (
                  <>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>
                      No Jobs Found Matching Your Current Skills
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 450, margin: "0 auto 18px", lineHeight: 1.5 }}>
                      None of the currently posted roles require:{" "}
                      <strong>{candidateSkills.join(", ")}</strong>. You can expand your skills or explore all available jobs.
                    </p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setActiveTab("all")}
                      >
                        Explore All Available Jobs ({allJobs.length})
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigateTo("/dashboard/profile")}
                      >
                        Edit Tech Stack
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>
                      No Jobs Found
                    </h3>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
                      No jobs matched your filter criteria: "{searchTerm || locationFilter}". Try clearing your filters.
                    </p>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSearchTerm("");
                        setLocationFilter("");
                      }}
                    >
                      Clear Filters
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Selected Job Detail Drawer / View */}
          <div>
            {selectedJob ? (
              <Card>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    {selectedJob.matchScore != null && (
                      <div style={{ marginBottom: 10 }}>
                        <span className="badge-v2 success" style={{ fontSize: 13, padding: "6px 12px" }}>
                          {selectedJob.matchScore}% Profile Skill Match
                        </span>
                      </div>
                    )}
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>
                      {selectedJob.title}
                    </h2>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>
                      {selectedJob.company} • {selectedJob.location}
                    </p>
                  </div>

                  <div
                    style={{
                      padding: 14,
                      background: "var(--bg-subtle)",
                      borderRadius: "var(--radius-sm)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid var(--surface-border)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11.5, color: "var(--text-subtle)", display: "block" }}>
                        OFFERED PACKAGE
                      </span>
                      <strong style={{ fontSize: 15, color: "var(--text-main)" }}>
                        {selectedJob.salary || "₹8 LPA - ₹12 LPA"}
                      </strong>
                    </div>
                    {selectedJob.expLevel && (
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 11.5, color: "var(--text-subtle)", display: "block" }}>
                          EXPERIENCE
                        </span>
                        <strong style={{ fontSize: 13.5, color: "var(--text-main)" }}>
                          {selectedJob.expLevel} Years
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Skills Match Breakdown */}
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "var(--text-main)" }}>
                      Required Skills & Matching Analysis
                    </h4>

                    {selectedJob.matchedSkills && selectedJob.matchedSkills.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--success)", display: "block", marginBottom: 4 }}>
                          Matching Your Profile Skills:
                        </span>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {selectedJob.matchedSkills.map((s, i) => (
                            <span key={i} className="badge-v2 success" style={{ fontSize: 12 }}>
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedJob.missingSkills && selectedJob.missingSkills.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-subtle)", display: "block", marginBottom: 4 }}>
                          Other Required Skills:
                        </span>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {selectedJob.missingSkills.map((s, i) => (
                            <span key={i} className="badge-v2 neutral" style={{ fontSize: 12 }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {!selectedJob.matchedSkills && selectedJob.skills && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {selectedJob.skills.split(",").map((s, i) => (
                          <span key={i} className="badge-v2 primary" style={{ fontSize: 12 }}>
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Role Description</h4>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {selectedJob.description ||
                        "As part of the engineering team, you will collaborate with cross-functional members, build scalable features, and write clean, verified code."}
                    </p>
                  </div>

                  {selectedJob.aptitudeCutoff && (
                    <div style={{ padding: 12, background: "var(--primary-soft)", borderRadius: "var(--radius-sm)", border: "1px solid var(--primary-light)" }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary)" }}>
                        Aptitude Eligibility: Cutoff ≥ {selectedJob.aptitudeCutoff}%
                      </span>
                    </div>
                  )}

                  {appliedJobs[selectedJob.id] ? (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: "var(--radius-md)",
                        background: "var(--success-bg)",
                        color: "var(--success)",
                        border: "1px solid var(--success-border)",
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      ✓ Applied to {selectedJob.company}!
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      style={{ width: "100%", marginTop: 8 }}
                      onClick={() => handleApply(selectedJob)}
                    >
                      {isLoggedIn ? "Apply Now with JobNest Profile" : "Login to Apply"}
                    </button>
                  )}
                </div>
              </Card>
            ) : (
              <Card>
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-subtle)" }}>
                  👈 Select a job from the feed to view full details and apply.
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (embed) return content;

  return (
    <div className="landing-page">
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-main)" }}>Explore Jobs</h1>
          <p style={{ fontSize: 15, color: "var(--text-muted)", marginTop: 4 }}>
            Browse open positions from top employers tailored to your verified aptitude & tech skills
          </p>
        </div>
        {content}
      </main>
      <Footer />
    </div>
  );
}
