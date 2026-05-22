import React from "react";

import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";

const modules = [
  "Authentication and role-based access",
  "Admin dashboard analytics",
  "Registrar enrollment review",
  "Registrar decision audit log",
  "Academic session and enrollment window control",
  "Faculty and department setup",
  "Course management and course detail",
  "Student profile and academic identity",
  "Enrollment slip printing",
  "Academic records foundation",
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

export default function AdminDemoReadinessPage() {
  return (
    <div>
      <PageHeader
        title="Demo Readiness"
        subtitle="UniPortal University Management System prepared for institutional demo."
      />

      <div className="demo-hero card">
        <p className="demo-kicker">UniPortal</p>
        <h2>University Management System</h2>
        <p>Prepared for institutional demo</p>
      </div>

      <div className="course-detail-grid">
        <Card>
          <h2>Completed Modules</h2>
          <div className="setup-list">
            {modules.map((module) => (
              <div className="setup-list-item" key={module}>
                <strong>{module}</strong>
                <span className="review-status status-approved">Ready</span>
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

      <Card>
        <h2>Recommended Demo Flow</h2>
        <div className="setup-list">
          {demoSteps.map((step, index) => (
            <div className="setup-list-item" key={step}>
              <strong>
                {index + 1}. {step}
              </strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
