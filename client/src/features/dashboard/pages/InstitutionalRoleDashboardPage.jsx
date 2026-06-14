import React from "react";
import { Link } from "react-router-dom";

const roleDashboards = {
  finance: {
    kicker: "Finance Office",
    title: "Finance Readiness Dashboard",
    subtitle:
      "A pilot workspace for fee visibility, payment coordination, and financial clearance planning.",
    overview: [
      ["Payment Status", "Pilot placeholder", "Future snapshot for paid, pending, and exception cases."],
      ["Fee Management", "Roadmap", "Planned controls for fee schedules, invoices, and student balances."],
      ["Clearance", "Concept", "Institutional clearance checkpoint before final enrollment validation."],
    ],
    modules: [
      "Payment status overview placeholder",
      "Fee management roadmap",
      "Financial clearance concept",
    ],
    message:
      "Finance access is included for presentation credibility only. No live payment processing or fee posting is active in this MVP.",
  },
  lecturer: {
    kicker: "Lecturer Workspace",
    title: "Teaching Operations Dashboard",
    subtitle:
      "A pilot view for assigned teaching responsibilities, class lists, and academic submission workflows.",
    overview: [
      ["Assigned Courses", "Pilot placeholder", "Future list of course sections assigned to the lecturer."],
      ["Student Roster", "Concept", "Planned class roster visibility linked to approved enrollment."],
      ["Grade Submission", "Demonstrable", "Controlled marks entry for approved enrolled students."],
    ],
    modules: [
      "Assigned courses placeholder",
      "Student roster placeholder",
      "Course marks entry and submission",
    ],
    message:
      "Lecturers can enter and submit marks for review. They cannot review, finalize, or release institutional results.",
    examinationAccess: true,
  },
  dean_hod: {
    kicker: "Dean / HOD Oversight",
    title: "Department Leadership Dashboard",
    subtitle:
      "A pilot oversight view for department-level enrollment, approval visibility, and academic analytics.",
    overview: [
      ["Enrollment Overview", "Pilot placeholder", "Future department-level enrollment summary by program and level."],
      ["Approval Oversight", "Demonstrable", "Review submitted results and return exceptions for correction."],
      ["Analytics", "Concept", "Future department analytics for academic planning and reporting."],
    ],
    modules: [
      "Department enrollment overview placeholder",
      "Dean/HOD result review",
      "Department analytics concept",
    ],
    message:
      "Dean/HOD users can review or return lecturer submissions. Final approval and result release remain Registrar or Administrator responsibilities.",
    examinationAccess: true,
  },
};

export default function InstitutionalRoleDashboardPage({ role }) {
  const dashboard = roleDashboards[role] || roleDashboards.finance;

  return (
    <div className="dashboard-page institutional-role-page">
      <div className="dashboard-hero institutional-role-hero">
        <div>
          <div className="hero-brand-lockup">
            <img src="/branding/uniportal-mark.svg" alt="" />
            <p className="demo-kicker">{dashboard.kicker}</p>
          </div>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.subtitle}</p>
        </div>
        {dashboard.examinationAccess && (
          <Link className="btn btn-light" to="/examinations">
            Open Examination Workspace
          </Link>
        )}
      </div>

      <div className="dashboard-strip">
        <div>
          <span>Access Level</span>
          <strong>Pilot Phase</strong>
        </div>
        <div>
          <span>Operational Risk</span>
          <strong>
            {dashboard.examinationAccess
              ? "Role-controlled workflow"
              : "Read-only concept"}
          </strong>
        </div>
        <div>
          <span>MVP Stability</span>
          <strong>Controlled pilot scope</strong>
        </div>
      </div>

      <div className="command-grid">
        {dashboard.overview.map(([label, status, description]) => (
          <div className="command-card" key={label}>
            <span>{status}</span>
            <h2>{label}</h2>
            <p>{description}</p>
          </div>
        ))}
      </div>

      <div className="course-detail-grid">
        <div className="card">
          <h2>Coming Module Scope</h2>
          <div className="detail-list">
            {dashboard.modules.map((module) => (
              <p key={module}>
                <strong>{module}</strong>
              </p>
            ))}
          </div>
        </div>

        <div className="card priority-card">
          <span>Institutional Message</span>
          <h2>Presentation Readiness</h2>
          <p>{dashboard.message}</p>
        </div>
      </div>

      <div className="insight-panel">
        <h2>Controlled Expansion Path</h2>
        <p>
          UniPortal demonstrates a controlled examination workflow while
          keeping enrollment, academic records, and administration services
          stable for institutional review.
        </p>
      </div>
    </div>
  );
}
