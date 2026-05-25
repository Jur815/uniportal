import React, { useEffect, useMemo, useState } from "react";

import { getMyExamClearances } from "../../../api/examClearance.api";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

export default function MyExamClearancePage() {
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadClearances = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyExamClearances();

        if (!isMounted) return;
        setClearances(response?.data?.clearances || []);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message || "Failed to load exam clearance",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadClearances();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => summarize(clearances), [clearances]);

  if (loading) return <Loader text="Loading exam clearance..." />;
  if (error) return <EmptyState title={error} />;

  return (
    <div>
      <PageHeader
        title="Exam Clearance"
        subtitle="View your exam eligibility, attendance standing, and financial clearance status."
      />

      <div className="metric-grid enrollment-summary-grid">
        <Metric label="Records" value={summary.total} />
        <Metric label="Eligible" value={summary.eligible} />
        <Metric label="Not Eligible" value={summary.not_eligible} />
        <Metric label="Pending" value={summary.pending} />
      </div>

      {clearances.length === 0 ? (
        <EmptyState title="No exam clearance record has been published yet." />
      ) : (
        <div className="course-management-list">
          {clearances.map((clearance) => (
            <Card key={clearance._id}>
              <div className="exam-clearance-card">
                <div>
                  <div className="course-title-row">
                    <h3>
                      {clearance.academicYear} / Semester {clearance.semester}
                    </h3>
                    <StatusBadge status={clearance.status} />
                  </div>
                  <p>
                    <strong>Attendance:</strong>{" "}
                    {clearance.attendancePercentage ?? 0}% /{" "}
                    <strong>Financial Clearance:</strong>{" "}
                    <FinancialBadge status={clearance.financialClearanceStatus} />
                  </p>
                  <p>
                    <strong>Remarks:</strong>{" "}
                    {clearance.remarks || "No remarks provided."}
                  </p>
                  <p>
                    <strong>Reviewed By:</strong>{" "}
                    {clearance.reviewedBy?.name || "Not reviewed"} /{" "}
                    <strong>Reviewed At:</strong>{" "}
                    {formatDate(clearance.reviewedAt)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
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
    <span className={`review-status status-${status}`}>
      {formatLabel(status)}
    </span>
  );
}

function FinancialBadge({ status = "pending" }) {
  return (
    <span className={`review-status status-${status}`}>
      {formatLabel(status)}
    </span>
  );
}

function summarize(clearances) {
  return clearances.reduce(
    (acc, clearance) => {
      const status = clearance.status || "pending";
      acc.total += 1;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { total: 0, eligible: 0, not_eligible: 0, pending: 0 },
  );
}

function formatLabel(value = "") {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
