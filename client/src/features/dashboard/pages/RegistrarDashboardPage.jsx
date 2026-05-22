import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getRegistrarDashboardSummary } from "../../../api/admin.api";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

export default function RegistrarDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await getRegistrarDashboardSummary();
        setSummary(data?.data?.summary || null);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            "Failed to load registrar dashboard summary",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) return <Loader text="Loading registrar dashboard..." />;

  if (error) {
    return (
      <div className="p-6">
        <PageHeader
          title="Registrar Dashboard"
          subtitle="Enrollment review and academic operations."
        />
        <EmptyState title={error} />
      </div>
    );
  }

  const activeSession = summary?.activeAcademicSession;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Registrar Dashboard"
        subtitle="Monitor pending registration requests and enrollment decisions."
      />

      <div className="metric-grid">
        <DashboardMetric label="Pending" value={summary?.pendingEnrollments} />
        <DashboardMetric label="Approved" value={summary?.approvedEnrollments} />
        <DashboardMetric label="Rejected" value={summary?.rejectedEnrollments} />
        <DashboardMetric label="Returned" value={summary?.correctionEnrollments} />
        <DashboardMetric label="Approvals Today" value={summary?.approvalsToday} />
        <DashboardMetric label="Rejections Today" value={summary?.rejectionsToday} />
        <DashboardMetric label="Returns Today" value={summary?.returnsToday} />
      </div>

      <div className="course-detail-grid">
        <div className="card">
          <h2>Active Academic Session</h2>
          {activeSession ? (
            <div className="detail-list">
              <p>
                <strong>Academic Year:</strong> {activeSession.academicYear}
              </p>
              <p>
                <strong>Semester:</strong> {activeSession.semester}
              </p>
              <p>
                <strong>Enrollment:</strong>{" "}
                <StatusBadge status={summary?.enrollmentStatus || "closed"} />
              </p>
              {activeSession.startDate && (
                <p>
                  <strong>Start Date:</strong> {formatDate(activeSession.startDate)}
                </p>
              )}
              {activeSession.endDate && (
                <p>
                  <strong>End Date:</strong> {formatDate(activeSession.endDate)}
                </p>
              )}
            </div>
          ) : (
            <p className="error-text">No active academic session configured.</p>
          )}
        </div>

        <div className="card">
          <h2>Enrollment Review</h2>
          <p>
            Use the review queue to approve, reject, or return enrollment
            requests for correction.
          </p>
          <div className="course-actions">
            <Link className="btn btn-primary" to="/admin/enrollments">
              Open Full Review Queue
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="review-toolbar">
          <div>
            <h2>Latest Pending Enrollments</h2>
            <p>Most recent requests waiting for registrar action.</p>
          </div>
          <Link className="btn btn-outline" to="/admin/enrollments">
            View All
          </Link>
        </div>

        <PendingEnrollmentTable
          enrollments={summary?.latestPendingEnrollments || []}
        />
      </div>
    </div>
  );
}

function DashboardMetric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}

function PendingEnrollmentTable({ enrollments }) {
  if (enrollments.length === 0) {
    return <EmptyState title="No pending enrollment requests." />;
  }

  return (
    <div className="responsive-table">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Academic Year</th>
            <th>Semester</th>
            <th>Credits</th>
            <th>Submitted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.map((enrollment) => (
            <tr key={enrollment._id}>
              <td>{enrollment.student?.name || "Unknown student"}</td>
              <td>{enrollment.student?.email || "Not provided"}</td>
              <td>{enrollment.academicYear}</td>
              <td>{enrollment.semester}</td>
              <td>{enrollment.totalCredits ?? 0}</td>
              <td>{formatDate(enrollment.createdAt)}</td>
              <td>
                <Link to={`/admin/enrollments/${enrollment._id}`}>Review</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`review-status status-${status || "closed"}`}>
      {formatStatus(status || "closed")}
    </span>
  );
}

function formatStatus(status = "") {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Date(value).toLocaleDateString();
}
