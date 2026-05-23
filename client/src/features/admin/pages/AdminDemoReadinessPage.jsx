import React from "react";

import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";

const modules = [
  ["Authentication and role-based access", "Ready"],
  ["Admin dashboard analytics", "Ready"],
  ["Registrar enrollment review", "Ready"],
  ["Registrar decision audit log", "Ready"],
  ["Academic session and enrollment window control", "Ready"],
  ["Faculty, department, and program setup", "Ready"],
  ["Course management and course detail", "Ready"],
  ["Student profile and academic identity", "Ready"],
  ["Enrollment slip printing", "Ready"],
  ["Academic records foundation", "Pilot foundation"],
];

const accounts = [
  { role: "Admin", email: "admin@uniportal.demo" },
  { role: "Registrar", email: "registrar@uniportal.demo" },
  { role: "Student", email: "john.student@uniportal.demo" },
  { role: "Student", email: "amina.student@uniportal.demo" },
];

const demoSteps = [
  "Login as admin and review dashboard KPIs.",
  "Open Academic Setup, Faculties, Departments, Sessions, and Courses.",
  "Open Student Management and review academic identity fields.",
  "Login as registrar and open the Registrar Dashboard.",
  "Review pending enrollments and open an enrollment detail record.",
  "Approve or return an enrollment and inspect the audit log.",
  "Login as student and review My Enrollments.",
  "Print an approved enrollment slip.",
  "Open Academic Records and review grades, GPA, and remarks.",
];

const seedTargets = [
  "3 faculties",
  "8-10 departments",
  "6-10 programs",
  "30-50 courses",
  "20-50 students",
  "Mixed enrollment decisions",
  "Historical sessions",
  "Registrar audit history",
];

const riskChecks = [
  "Run npm run seed:demo against the deployed demo database.",
  "Confirm Render health route before opening Vercel.",
  "Capture generated demo passwords from seed output.",
  "Open admin, registrar, and student flows before the live session.",
];

export default function AdminDemoReadinessPage() {
  return (
    <div>
      <PageHeader
        title="Demo Readiness"
        subtitle="UniPortal University Management System prepared for institutional demo."
      />

      <div className="demo-command-hero">
        <div>
          <p className="demo-kicker">UniPortal</p>
          <h2>Demo Command Center</h2>
          <p>University Management System prepared for institutional demo.</p>
        </div>
        <div className="demo-score">
          <span>Demo Readiness</span>
          <strong>Guided MVP</strong>
        </div>
      </div>

      <div className="metric-grid enrollment-summary-grid">
        <Metric label="Demo Positioning" value="MVP" />
        <Metric label="Core Workflows" value="10" />
        <Metric label="Audience" value="Admin" />
        <Metric label="Pilot Gap" value="Reports" />
      </div>

      <div className="course-detail-grid">
        <Card>
          <h2>Completed Modules</h2>
          <div className="setup-list">
            {modules.map(([module, status]) => (
              <div className="setup-list-item" key={module}>
                <strong>{module}</strong>
                <span className="review-status status-approved">{status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2>Sample Accounts</h2>
          <p>
            Run the backend demo seed to print test credentials in the terminal.
          </p>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.email}>
                    <td>{account.role}</td>
                    <td>{account.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="course-detail-grid">
        <Card>
          <h2>Institutional Seed Coverage</h2>
          <div className="setup-list">
            {seedTargets.map((target) => (
              <div className="setup-list-item" key={target}>
                <strong>{target}</strong>
                <span>Included in institutional demo seed</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2>Live Demo Risk Checks</h2>
          <div className="setup-list">
            {riskChecks.map((check) => (
              <div className="setup-list-item" key={check}>
                <strong>{check}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h2>Recommended Demo Flow</h2>
        <div className="demo-flow">
          {demoSteps.map((step, index) => (
            <div className="demo-flow-step" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
