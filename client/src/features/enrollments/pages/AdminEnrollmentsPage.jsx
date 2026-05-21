import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAllEnrollments,
  updateEnrollmentStatus,
} from "../../../api/enrollments.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const STATUS_OPTIONS = [
  "all",
  "pending",
  "approved",
  "rejected",
  "correction_required",
];

const DECISION_REASONS = [
  "Missing profile information",
  "Wrong semester selection",
  "Exceeded credit load",
  "Academic verification incomplete",
  "Duplicate enrollment",
  "Other",
];

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [decisionDrafts, setDecisionDrafts] = useState({});
  const [error, setError] = useState("");

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = statusFilter === "all" ? {} : { status: statusFilter };
      const response = await getAllEnrollments(params);
      setEnrollments(response?.data?.enrollments || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleDraftChange = (enrollmentId, field, value) => {
    setDecisionDrafts((current) => ({
      ...current,
      [enrollmentId]: {
        reasonType: "Academic verification incomplete",
        customText: "",
        ...(current[enrollmentId] || {}),
        [field]: value,
      },
    }));
  };

  const handleStatusUpdate = async (enrollment, status) => {
    const draft = decisionDrafts[enrollment._id] || {};
    const needsReason = ["rejected", "correction_required"].includes(status);
    const decisionReasonType = needsReason
      ? draft.reasonType || "Academic verification incomplete"
      : "";
    const rejectionReason = needsReason
      ? decisionReasonType === "Other"
        ? draft.customText || "Other"
        : draft.customText || decisionReasonType
      : "";

    try {
      setActionLoadingId(enrollment._id);
      const response = await updateEnrollmentStatus({
        enrollmentId: enrollment._id,
        status,
        decisionReasonType,
        rejectionReason,
      });
      const updatedEnrollment = response?.data?.enrollment;

      setEnrollments((current) =>
        current.map((item) =>
          item._id === enrollment._id ? updatedEnrollment || item : item,
        ),
      );

      toast.success(`Enrollment ${formatStatus(status).toLowerCase()}`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update enrollment",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const summary = useMemo(() => {
    return enrollments.reduce(
      (acc, item) => {
        const status = item.status || "pending";
        acc.total += 1;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        correction_required: 0,
      },
    );
  }, [enrollments]);

  if (loading) return <Loader text="Loading enrollment review queue..." />;

  if (error) {
    return (
      <div>
        <PageHeader
          title="Enrollment Review"
          subtitle="Review student registration requests with registrar controls."
        />
        <Card>
          <p className="error-text">{error}</p>
          <Button onClick={fetchEnrollments}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Enrollment Review"
        subtitle="Review student registration requests, credit load, course selections, and academic eligibility."
      />

      <div className="metric-grid enrollment-summary-grid">
        <Metric label="Queue" value={summary.total} />
        <Metric label="Pending" value={summary.pending} />
        <Metric label="Approved" value={summary.approved} />
        <Metric label="Rejected" value={summary.rejected} />
        <Metric label="Corrections" value={summary.correction_required} />
      </div>

      <Card>
        <div className="review-toolbar">
          <div>
            <h2>Registrar Queue</h2>
            <p>Filter by decision status and open detail review when needed.</p>
          </div>
          <div className="course-actions">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : formatStatus(status)}
                </option>
              ))}
            </select>
            <Button onClick={fetchEnrollments}>Refresh</Button>
          </div>
        </div>
      </Card>

      {enrollments.length === 0 ? (
        <EmptyState title="No enrollment requests found." />
      ) : (
        <div className="review-list">
          {enrollments.map((enrollment) => (
            <EnrollmentReviewCard
              key={enrollment._id}
              enrollment={enrollment}
              draft={decisionDrafts[enrollment._id] || {}}
              saving={actionLoadingId === enrollment._id}
              onDraftChange={handleDraftChange}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EnrollmentReviewCard({
  enrollment,
  draft,
  saving,
  onDraftChange,
  onStatusUpdate,
}) {
  const profile = enrollment.studentProfile || {};
  const student = enrollment.student || {};
  const credits = enrollment.totalSelectedCredits ?? enrollment.totalCredits ?? 0;
  const isPendingLike = ["pending", "correction_required"].includes(
    enrollment.status || "pending",
  );

  return (
    <Card>
      <div className="review-card-header">
        <div>
          <div className="course-title-row">
            <h2>{student.name || "Unknown Student"}</h2>
            <StatusBadge status={enrollment.status} />
            {enrollment.creditWarning && (
              <span className="warning-badge">Credit load warning</span>
            )}
          </div>
          <p>
            {enrollment.academicYear} / Semester {enrollment.semester} /{" "}
            Submitted {formatDate(enrollment.createdAt)}
          </p>
        </div>
        <Link to={`/admin/enrollments/${enrollment._id}`} className="btn">
          Detail Review
        </Link>
      </div>

      <div className="review-grid">
        <InfoPanel title="Student Information">
          <Info label="Student ID" value={profile.studentId} />
          <Info label="Email" value={student.email} />
          <Info label="Faculty" value={profile.faculty} />
          <Info label="Department" value={profile.department} />
          <Info label="Program" value={profile.program} />
          <Info label="Level" value={profile.level} />
          <Info label="Account" value={student.status || "active"} />
          <Info
            label="Academic Verified"
            value={profile.academicVerified ? "Yes" : "No"}
          />
        </InfoPanel>

        <InfoPanel title="Enrollment Context">
          <Info label="Status" value={formatStatus(enrollment.status)} />
          <Info label="Selected Credits" value={`${credits}/${enrollment.maxCredits || 24}`} />
          <Info label="Reason Type" value={enrollment.decisionReasonType} />
          <Info label="Reason" value={enrollment.rejectionReason} />
        </InfoPanel>
      </div>

      <div className="selected-course-list">
        <h3>Selected Courses</h3>
        {enrollment.courses?.map((course) => (
          <div className="selected-course-row" key={course._id}>
            <strong>{course.code}</strong>
            <span>{course.title}</span>
            <span>{course.creditHours} credits</span>
            <span>{course.facultyRef?.name || "No faculty"}</span>
            <span>{course.departmentRef?.name || course.department || "No department"}</span>
            <span>{course.programRef?.name || course.program || "No program"}</span>
            <StatusBadge status={course.isActive ? "active" : "inactive"} />
          </div>
        ))}
      </div>

      <div className="decision-panel">
        <select
          value={draft.reasonType || "Academic verification incomplete"}
          onChange={(event) =>
            onDraftChange(enrollment._id, "reasonType", event.target.value)
          }
        >
          {DECISION_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
        <input
          placeholder="Optional custom note for rejection/correction"
          value={draft.customText || ""}
          onChange={(event) =>
            onDraftChange(enrollment._id, "customText", event.target.value)
          }
        />
        <div className="course-actions">
          <Button
            onClick={() => onStatusUpdate(enrollment, "approved")}
            disabled={saving || enrollment.status === "approved"}
          >
            Approve
          </Button>
          <Button
            onClick={() => onStatusUpdate(enrollment, "rejected")}
            disabled={saving || enrollment.status === "rejected"}
          >
            Reject
          </Button>
          <Button
            onClick={() => onStatusUpdate(enrollment, "correction_required")}
            disabled={saving || !isPendingLike}
          >
            Return for Correction
          </Button>
        </div>
      </div>
    </Card>
  );
}

function InfoPanel({ title, children }) {
  return (
    <div className="review-panel">
      <h3>{title}</h3>
      <div className="detail-list">{children}</div>
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

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
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

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}
