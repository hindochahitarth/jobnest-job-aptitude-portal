import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import JobCard from "../../components/job/JobCard";
import "../../assets/styles/main.css";

export default function JobsPage({ embed = false }) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    setJobs([
      { id: 1, title: "Frontend Intern", company: "Acme", location: "Remote", match: 72, snippet: "Build delightful UIs using React and modern tooling." },
      { id: 2, title: "Data Analyst", company: "DataCorp", location: "Bengaluru", match: 64, snippet: "Analyze datasets and build dashboards to drive decisions." },
      { id: 3, title: "DevOps Intern", company: "CloudOps", location: "Hyderabad", match: 59, snippet: "Help build CI/CD pipelines and containerized apps." },
    ]);
  }, []);

  function handleApply(job) {
    alert(`Applied to ${job.title}`);
  }

  const content = (
    <section>
      <h2 style={{ color: "var(--surface)", marginBottom: 12 }}>Recommended jobs</h2>
      <div className="grid grid-jobs">
        {jobs.map((j) => (
          <JobCard key={j.id} job={j} onApply={handleApply} />
        ))}
      </div>
    </section>
  );

  return embed ? content : <DashboardLayout>{content}</DashboardLayout>;
}
