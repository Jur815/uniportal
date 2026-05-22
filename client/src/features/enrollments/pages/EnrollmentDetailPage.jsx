import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getEnrollmentDetail,
  updateEnrollmentStatus,
} from "../../../api/enrollments.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const DECISION_REASONS = [
  "Missing profile information",
  "Wrong semester selection",
  "Exceeded credit load",
  "Academic verification incomplete",
  "Duplicate enrollment",
  "Other",
];

export default function EnrollmentDetailPage() {
  const { enrollmentId } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [reasonType, setReasonType] = useState("Academic verification incomplete");
  const [customText, setCustomText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEnrollment = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getEnrollmentDetail(enrollmentId);
        setEnrollment(data?.data?.enrollment || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load enrollment");
      } finally {
        setLoading(false);
      }
    };

    loadEnrollment();
  }, [enrollmentId]);

  const submitDecision = async (status) => {
    const needsReason = ["rejected", "correction_required"].includes(status);
    const rejectionReason = needsReason
      ? reasonType === "Other"
        ? customText || "Other"
        : customText || reasonType
      : "";

    try {
      setSaving(true);
      const data = await updateEnrollmentStatus({
        enrollmentId,
        status,
        decisionReasonType: needsReason ? reasonType : "",
        rejectionReason,
      });
      setEnrollment(data?.data?.enrollment || null);
      toast.success(`Enrollment ${formatStatus(status).toLowerCase()}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update enrollment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading enrollment detail..." />;

  if (error) {
    return (
      <div>
        <PageHeader title="Enrollment Detail" subtitle="Registrar review record." />
        <p className="error-text">{error}</p>
        <Link to="/admin/enrollments" className="btn">
          Back to Review Queue
        </Link>
      </div>
    );
  }

  if (!enrollment) return <EmptyState title="Enrollment not found." />;

  const student = enrollment.student || {};
  const profile = enrollment.studentProfile || {};
  const totalCredits = enrollment.totalSelectedCredits ?? enrollment.totalCredits ?? 0;
  const auditLog = [...(enrollment.decisionAuditLog || [])].sort(
    (a, b) => new Date(b.decidedAt) - new Date(a.decidedAt),
  );

  return (
    <div>
      <PageHeader
        title="Enrollment Detail"
        subtitle={`${student.name || "Unknown Student"} / ${enrollment.academicYear} / Semester ${enrollment.semester}`}
      />

      <div className="course-detail-actions">
        <Link to="/admin/enrollments" className="btn">
          Back to Review Queue
        </Link>
      </div>

      <div className="review-card-header detail-hero">
        <div>
          <div className="course-title-row">
            <h2>{student.name || "Unknown Student"}</h2>
            <StatusBadge status={enrollment.status} />
            {enrollment.creditWarning && (
              <span className="warning-badge">Credit load exceeds maximum</span>
            )}
          </div>
          <p>
            Submitted {formatDateTime(enrollment.createdAt)} / Updated{" "}
            {formatDateTime(enrollment.updatedAt)}
          </p>
        </div>
        <div className="metric-card compact-metric">
          <span>Selected Credits</span>
          <strong>
            {totalCredits}/{enrollment.maxCredits || 24}
          </strong>
        </div>
      </div>

      <div className="course-detail-grid">
        <Card>
          <h2>Student Profile Summary</h2>
          <div className="detail-list">
            <Info label="Full Name" value={student.name} />
            <Info label="Student ID" value={profile.studentId} />
            <Info label="Registration No" value={profile.registrationNumber} />
            <Info label="Email" value={student.email} />
            <Info label="Account Status" value={student.status || "active"} />
            <Info label="Guardian Name" value={profile.guardianName} />
            <Info label="Guardian Phone" value={profile.guardianPhone} />
          </div>
        </Card>

        <Card>
          <h2>Academic Profile Summary</h2>
          <div className="detail-list">
            <Info label="Faculty" value={profile.faculty} />
            <Info label="Department" value={profile.department} />
            <Info label="Program" value={profile.program} />
            <Info label="Level" value={profile.level} />
            <Info label="Year of Study" value={profile.yearOfStudy} />
            <Info label="Intake Year" value={profile.intakeYear} />
            <Info
              label="Academic Verified"
              value={profile.academicVerified ? "Yes" : "No"}
            />
          </div>
        </Card>
      </div>

      <Card>
        <h2>Selected Courses</h2>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Credits</th>
                <th>Faculty</th>
                <th>Department</th>
                <th>Program</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollment.courses?.map((course) => (
                <tr key={course._id}>
                  <td>{course.code}</td>
                  <td>{course.title}</td>
                  <td>{course.creditHours}</td>
                  <td>{course.facultyRef?.name || "N/A"}</td>
                  <td>{course.departmentRef?.name || course.department || "N/A"}</td>
                  <td>{course.programRef?.name || course.program || "N/A"}</td>
                  <td>
                    <StatusBadge status={course.isActive ? "active" : "inactive"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="course-detail-grid">
        <Card>
          <h2>Enrollment Timeline</h2>
          <div className="detail-list">
            <Info label="Academic Year" value={enrollment.academicYear} />
            <Info label="Semester" value={enrollment.semester} />
            <Info label="Current Status" value={formatStatus(enrollment.status)} />
            <Info label="Date Submitted" value={formatDateTime(enrollment.createdAt)} />
            <Info label="Last Updated" value={formatDateTime(enrollment.updatedAt)} />
            <Info label="Reason Type" value={enrollment.decisionReasonType} />
            <Info label="Reason" value={enrollment.rejectionReason} />
          </div>
        </Card>

        <Card>
          <h2>Approval Actions</h2>
          <div className="decision-panel stacked">
            <select
              value={reasonType}
              onChange={(event) => setReasonType(event.target.value)}
            >
              {DECISION_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Required action or decision note"
              value={customText}
              onChange={(event) => setCustomText(event.target.value)}
              rows="4"
            />
            <div className="course-actions">
              <Button
                onClick={() => submitDecision("approved")}
                disabled={saving || enrollment.status === "approved"}
              >
                Approve Enrollment
              </Button>
              <Button
                onClick={() => submitDecision("rejected")}
                disabled={saving || enrollment.status === "rejected"}
              >
                Reject Enrollment
              </Button>
              <Button
                onClick={() => submitDecision("correction_required")}
                disabled={saving || enrollment.status === "correction_required"}
              >
                Return for Correction
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2>Decision Audit Log</h2>
        {auditLog.length === 0 ? (
          <EmptyState title="No registrar decisions recorded yet." />
        ) : (
          <div className="audit-log">
            {auditLog.map((entry) => (
              <div className="audit-log-item" key={entry._id || entry.decidedAt}>
                <div className="course-title-row">
                  <StatusBadge status={entry.previousStatus || "pending"} />
                  <span>to</span>
                  <StatusBadge status={entry.newStatus} />
                </div>
                <p>
                  <strong>By:</strong>{" "}
                  {entry.decidedBy?.name || "Unknown reviewer"}{" "}
                  {entry.decidedBy?.role ? `(${entry.decidedBy.role})` : ""}
                </p>
                <p>
                  <strong>When:</strong> {formatDateTime(entry.decidedAt)}
                </p>
                <p>
                  <strong>Reason Type:</strong>{" "}
                  {entry.decisionReasonType || "N/A"}
                </p>
                <p>
                  <strong>Reason:</strong> {entry.reason || "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <p>
      <strong>{label}:</strong> {value || "N/A"}
    </p>
  );
}

function StatusBadge({ status }) {
  const normalized = status || "pending";
  return <span className={`review-status status-${normalized}`}>{formatStatus(normalized)}</span>;
}

function formatStatus(status = "pending") {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}
