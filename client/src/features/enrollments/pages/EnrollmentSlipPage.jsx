import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getMyEnrollmentDetail } from "../../../api/enrollments.api";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

export default function EnrollmentSlipPage() {
  const { enrollmentId } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadEnrollment = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyEnrollmentDetail(enrollmentId);

        if (!isMounted) return;

        setEnrollment(response?.data?.enrollment || null);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message || "Failed to load enrollment detail",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadEnrollment();

    return () => {
      isMounted = false;
    };
  }, [enrollmentId]);

  const approvalDecision = useMemo(
    () => getLatestDecision(enrollment, "approved"),
    [enrollment],
  );

  if (loading) return <Loader text="Loading enrollment slip..." />;

  if (error) {
    return (
      <div>
        <PageHeader
          title="Enrollment Slip"
          subtitle="Approved course registration summary."
        />
        <EmptyState title={error} />
      </div>
    );
  }

  if (!enrollment) return <EmptyState title="Enrollment not found." />;

  const profile = enrollment.studentProfile || {};
  const student = enrollment.student || {};
  const totalCredits =
    enrollment.totalSelectedCredits ?? enrollment.totalCredits ?? getTotalCredits(enrollment);
  const isApproved = enrollment.status === "approved";

  if (!isApproved) {
    return (
      <div>
        <PageHeader
          title="Enrollment Status"
          subtitle="Printable slips are available after approval."
        />

        <div className="card">
          <h2>
            {enrollment.academicYear} / Semester {enrollment.semester}
          </h2>
          <p>
            <strong>Status:</strong> <StatusBadge status={enrollment.status} />
          </p>
          {enrollment.rejectionReason && (
            <p>
              <strong>Action Needed:</strong>{" "}
              {enrollment.decisionReasonType
                ? `${enrollment.decisionReasonType}: ${enrollment.rejectionReason}`
                : enrollment.rejectionReason}
            </p>
          )}
          <p>
            Your official enrollment slip will become available when this
            enrollment is approved by the registrar.
          </p>
          <Link to="/my-enrollments">Back to My Enrollments</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="print-hide">
        <PageHeader
          title="Enrollment Slip"
          subtitle="Approved course registration summary."
        />
        <div className="course-detail-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => window.print()}
          >
            Print Slip
          </button>
          <Link className="btn btn-outline" to="/my-enrollments">
            Back to My Enrollments
          </Link>
        </div>
      </div>

      <section className="enrollment-slip">
        <div className="enrollment-slip-header">
          <img
            src="/branding/uniportal-logo.svg"
            alt="UniPortal"
            className="enrollment-slip-logo"
          />
          <h1>Official Enrollment Slip</h1>
          <p>Student Course Registration Summary</p>
        </div>

        <div className="enrollment-slip-meta">
          <div>
            <h2>Student Information</h2>
            <p>
              <strong>Name:</strong> {student.name || "Not provided"}
            </p>
            <p>
              <strong>Email:</strong> {student.email || "Not provided"}
            </p>
            <p>
              <strong>Student ID:</strong>{" "}
              {profile.studentId || profile.registrationNumber || "Not provided"}
            </p>
            <p>
              <strong>Faculty:</strong> {profile.faculty || "Not provided"}
            </p>
            <p>
              <strong>Department:</strong> {profile.department || "Not provided"}
            </p>
            <p>
              <strong>Program:</strong> {profile.program || "Not provided"}
            </p>
            <p>
              <strong>Level:</strong>{" "}
              {profile.level || profile.yearOfStudy || "Not provided"}
            </p>
          </div>

          <div>
            <h2>Enrollment Information</h2>
            <p>
              <strong>Academic Year:</strong> {enrollment.academicYear}
            </p>
            <p>
              <strong>Semester:</strong> {enrollment.semester}
            </p>
            <p>
              <strong>Status:</strong> <StatusBadge status={enrollment.status} />
            </p>
            <p>
              <strong>Decision Date:</strong>{" "}
              {formatDateTime(approvalDecision?.decidedAt)}
            </p>
            <p>
              <strong>Reviewer:</strong>{" "}
              {approvalDecision?.decidedBy?.name ||
                approvalDecision?.decidedBy?.email ||
                "Not recorded"}
            </p>
          </div>
        </div>

        <div className="responsive-table enrollment-slip-table">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Title</th>
                <th>Credit Hours</th>
              </tr>
            </thead>
            <tbody>
              {(enrollment.courses || []).map((course) => (
                <tr key={course._id}>
                  <td>{course.code}</td>
                  <td>{course.title}</td>
                  <td>{course.creditHours}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="2">Total Credits</th>
                <th>{totalCredits}</th>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="enrollment-slip-footer">
          <p>
            This slip confirms approved course registration for the academic
            year and semester shown above.
          </p>
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status = "pending" }) {
  return (
    <span className={`review-status status-${status}`}>{formatStatus(status)}</span>
  );
}

function getLatestDecision(enrollment, status) {
  const decisions = enrollment?.decisionAuditLog || [];
  return decisions
    .filter((decision) => decision.newStatus === status)
    .sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt))[0];
}

function getTotalCredits(enrollment) {
  return (enrollment.courses || []).reduce(
    (sum, course) => sum + Number(course?.creditHours || 0),
    0,
  );
}

function formatStatus(status = "pending") {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString();
}
