import React, { useState } from "react";

export default function Hero() {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [exp, setExp] = useState("0-2");

  function handleSearch(e) {
    e.preventDefault();
    window.history.pushState({}, "", `/jobs?q=${encodeURIComponent(role)}&loc=${encodeURIComponent(location)}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function handleTrendingClick(tag) {
    setRole(tag);
    window.history.pushState({}, "", `/jobs?q=${encodeURIComponent(tag)}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  return (
    <section className="landing-hero">
      <div className="hero-container">
        <div className="hero-header-center">
          <div className="hero-badge-pill">
            <span>🎯 India's #1 Skill & Aptitude-Verified Job Portal</span>
          </div>

          <h1 className="hero-title">
            Find Your Dream Job with <span>Verified Aptitude Scores</span>
          </h1>

          <p className="hero-subtitle">
            JobNest matches early talent with top employers using AI resume analysis, verified aptitude assessments, and direct recruiter recommendations.
          </p>
        </div>

        {/* Naukri / LinkedIn Style Search Widget */}
        <form className="hero-search-widget" onSubmit={handleSearch}>
          <div className="search-field">
            <span className="field-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by job title, skill, or company (e.g. React, Data Analyst)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="search-field">
            <span className="field-icon">📍</span>
            <input
              type="text"
              placeholder="Location (e.g. Remote, Bengaluru)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="search-field">
            <span className="field-icon">💼</span>
            <select value={exp} onChange={(e) => setExp(e.target.value)}>
              <option value="0-1">Fresher (0-1 yrs)</option>
              <option value="0-2">Junior (0-2 yrs)</option>
              <option value="2-5">Mid Level (2-5 yrs)</option>
              <option value="5+">Senior (5+ yrs)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-lg">
            Search Jobs
          </button>
        </form>

        <div className="trending-searches">
          <span>Trending Searches:</span>
          {["Full Stack Developer", "Data Analyst", "Aptitude Practice", "Frontend SDE", "Remote Jobs"].map((tag) => (
            <button
              key={tag}
              type="button"
              className="trending-pill"
              onClick={() => handleTrendingClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stat Counter Banner */}
        <div className="hero-stats-banner">
          <div className="stat-item">
            <div className="number">250K+</div>
            <div className="label">Active Openings</div>
          </div>
          <div className="stat-item">
            <div className="number">10K+</div>
            <div className="label">Verified Employers</div>
          </div>
          <div className="stat-item">
            <div className="number">96%</div>
            <div className="label">Aptitude Match Rate</div>
          </div>
          <div className="stat-item">
            <div className="number">1M+</div>
            <div className="label">Assessments Taken</div>
          </div>
        </div>
      </div>
    </section>
  );
}
