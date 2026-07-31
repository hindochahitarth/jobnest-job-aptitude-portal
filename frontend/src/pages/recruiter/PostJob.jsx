import { useState } from "react";
import Card from "../../components/ui/Card";

export default function PostJob() {
  const [form, setForm] = useState({ title: "", company: "", location: "", salary: "", deadline: "", skills: "" });

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    alert(`Job posted: ${form.title}`);
  }

  return (
    <div className="dashboard-page post-job-page">
      <Card title="Create a new job" icon="✍️">
        <form className="job-form" onSubmit={handleSubmit}>
          <label>
            Job title
            <input name="title" value={form.title} onChange={handleChange} placeholder="Senior React Developer" required />
          </label>
          <label>
            Company
            <input name="company" value={form.company} onChange={handleChange} placeholder="Acme" required />
          </label>
          <label>
            Location
            <input name="location" value={form.location} onChange={handleChange} placeholder="Remote / Bengaluru" required />
          </label>
          <label>
            Salary
            <input name="salary" value={form.salary} onChange={handleChange} placeholder="₹40k - ₹55k" required />
          </label>
          <label>
            Deadline
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
          </label>
          <label>
            Skills
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="React, SQL, communication" required />
          </label>
          <button type="submit" className="btn btn-primary">Post job</button>
        </form>
      </Card>
    </div>
  );
}
