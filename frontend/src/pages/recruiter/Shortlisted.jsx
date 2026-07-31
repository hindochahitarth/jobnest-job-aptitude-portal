import Table from "../../components/ui/Table";

const candidates = [
  { id: 1, name: "Arjun Sen", score: "91%", resume: "Arjun_Resume.pdf" },
  { id: 2, name: "Sara Nair", score: "89%", resume: "Sara_Profile.pdf" },
];

export default function Shortlisted() {
  const columns = [
    { key: "name", label: "Name", accessor: "name" },
    { key: "score", label: "Match Score", accessor: "score" },
    { key: "resume", label: "Resume", accessor: "resume" },
    {
      key: "actions",
      label: "Actions",
      render: () => <button className="btn btn-secondary">Message</button>,
    },
  ];

  return (
    <div className="dashboard-page shortlisted-page">
      <h3 className="section-title">Shortlisted Candidates</h3>
      <Table columns={columns} data={candidates} />
    </div>
  );
}
