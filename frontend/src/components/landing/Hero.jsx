import React, { useState } from "react";

export default function Hero() {


  return (
    <section className="landing-hero">
      <div className="hero-container">
        <div className="hero-header-center">
          <div className="hero-badge-pill">
            <span>India's #1 Skill & Aptitude-Verified Job Portal</span>
          </div>

          <h1 className="hero-title">
            Find Your Dream Job with <span>Verified Aptitude Scores</span>
          </h1>

          <p className="hero-subtitle">
            JobNest matches early talent with top employers using AI resume analysis, verified aptitude assessments, and direct recruiter recommendations.
          </p>
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
