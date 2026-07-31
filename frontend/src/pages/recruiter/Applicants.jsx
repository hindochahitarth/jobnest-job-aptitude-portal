import Table from "../../components/ui/Table";

const applicants = [
  { id: 1, name: "Aditi Sharma", score: "88%", resume: "Resume.pdf" },
  { id: 2, name: "Rohan Patel", score: "84%", resume: "Rohan_Profile.pdf" },
  { id: 3, name: "Mira Das", score: "81%", resume: "Mira_CV.pdf" },
];

export default function Applicants() {
  const columns = [
    { key: "name", label: "Name", accessor: "name" },
    { key: "score", label: "Match Score", accessor: "score" },
    { key: "resume", label: "Resume", accessor: "resume" },
    {
      key: "actions",
      label: "Actions",
      render: () => <button className="btn btn-secondary">View</button>,
    },
  ];

  return (
    <div className="dashboard-page applicants-page">
      <h3 className="section-title">Applicants</h3>
      <Table columns={columns} data={applicants} />
    </div>
  );
}
