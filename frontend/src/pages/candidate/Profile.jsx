import Card from "../../components/ui/Card";

export default function Profile() {
  return (
    <div className="dashboard-page dashboard-profile">
      <div className="profile-summary">
        <Card className="profile-card" title="Profile completion" icon="📈">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "84%" }} />
          </div>
          <p className="profile-copy">Your profile is 84% complete. Add more achievements, skills, and resume sections to improve job match results.</p>
        </Card>

        <Card className="info-card" title="Your candidate profile" icon="👤">
          <ul className="profile-details">
            <li><strong>Name</strong> John Doe</li>
            <li><strong>Email</strong> johndoe@example.com</li>
            <li><strong>Experience</strong> 2 years</li>
            <li><strong>Location</strong> Remote / India</li>
          </ul>
        </Card>
      </div>

      <div className="profile-actions">
        <Card className="action-card" title="Next steps" icon="🚀">
          <ul>
            <li>Complete resume sections</li>
            <li>Review your top job matches</li>
            <li>Schedule a mock aptitude session</li>
          </ul>
        </Card>
        <Card className="action-card" title="Recommended updates" icon="✨">
          <p>Refine your headline, add project metrics, and confirm your availability to boost recruiter interest.</p>
        </Card>
      </div>
    </div>
  );
}
