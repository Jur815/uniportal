import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyCourses } from "../../../api/enrollments.api";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

export default function MyEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadEnrollments = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyCourses();

        if (!isMounted) return;

        setEnrollments(response?.data?.enrollments || []);
        setSummary(response?.summary || null);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message || "Failed to load your enrollments",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadEnrollments();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <Loader text="Loading your enrollments..." />;
  if (error) return <EmptyState title={error} />;

  return (
    <div>
      <PageHeader
        title="My Enrollments"
        subtitle="Review your registration requests and print approved enrollment slips."
      />

      {summary && (
        <div className="metric-grid enrollment-summary-grid">
          <Metric label="Requests" value={enrollments.length} />
          <Metric label="Requested Credits" value={summary.totalCredits} />
          <Metric label="Official Courses" value={summary.officialCourses} />
          <Metric label="Official Credits" value={summary.officialCredits} />
        </div>
      )}

      {enrollments.length === 0 ? (
        <EmptyState title="No enrollment requests found." />
      ) : (
        <div className="card">
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Courses</th>
                  <th>Total Credits</th>
                  <th>Action Needed</th>
                  <th>Slip</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id}>
                    <td>{enrollment.academicYear}</td>
                    <td>{enrollment.semester}</td>
                    <td>
                      <StatusBadge status={enrollment.status} />
                    </td>
                    <td>{enrollment.courses?.length || 0}</td>
                    <td>{enrollment.totalCredits ?? getTotalCredits(enrollment)}</td>
                    <td>{getActionNeeded(enrollment)}</td>
                    <td>
                      <Link to={`/my-enrollments/${enrollment._id}`}>
                        {enrollment.status === "approved" ? "View Slip" : "View Status"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  );
}

function StatusBadge({ status = "pending" }) {
  return (
    <span className={`review-status status-${status}`}>{formatStatus(status)}</span>
  );
}

function formatStatus(status = "pending") {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getActionNeeded(enrollment) {
  if (!["rejected", "correction_required"].includes(enrollment.status)) {
    return "N/A";
  }

  if (enrollment.decisionReasonType && enrollment.rejectionReason) {
    return `${enrollment.decisionReasonType}: ${enrollment.rejectionReason}`;
  }

  return enrollment.rejectionReason || enrollment.decisionReasonType || "Review status";
}

function getTotalCredits(enrollment) {
  return (enrollment.courses || []).reduce(
    (sum, course) => sum + Number(course?.creditHours || 0),
    0,
  );
}
