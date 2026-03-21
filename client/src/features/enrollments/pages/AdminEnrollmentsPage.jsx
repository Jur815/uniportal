import React, { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getAllEnrollments,
  updateEnrollmentStatus,
} from "../../../api/enrollments.api";
import Loader from "../../../components/ui/Loader";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"];

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllEnrollments();
      setEnrollments(response?.data?.enrollments || []);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
      setError(err?.response?.data?.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  const handleStatusUpdate = async (enrollmentId, status) => {
    try {
      setActionLoadingId(enrollmentId);

      await updateEnrollmentStatus({ enrollmentId, status });

      setEnrollments((prev) =>
        prev.map((item) =>
          item._id === enrollmentId ? { ...item, status } : item,
        ),
      );

      toast.success(`Enrollment ${status} successfully`);
    } catch (err) {
      console.error(`Failed to ${status} enrollment:`, err);
      toast.error(
        err?.response?.data?.message || `Failed to ${status} enrollment`,
      );
    } finally {
      setActionLoadingId("");
    }
  };

  const filteredEnrollments = useMemo(() => {
    if (statusFilter === "all") return enrollments;
    return enrollments.filter(
      (item) => (item.status || "").toLowerCase() === statusFilter,
    );
  }, [enrollments, statusFilter]);

  const summary = useMemo(() => {
    return enrollments.reduce(
      (acc, item) => {
        const status = (item.status || "pending").toLowerCase();

        acc.total += 1;
        if (status === "pending") acc.pending += 1;
        if (status === "approved") acc.approved += 1;
        if (status === "rejected") acc.rejected += 1;

        return acc;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      },
    );
  }, [enrollments]);

  if (loading) {
    return <Loader text="Loading enrollments..." />;
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Enrollment Management"
          subtitle="Review, approve, and reject student enrollments"
        />

        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "flex-start",
            }}
          >
            <p style={{ color: "crimson", margin: 0 }}>{error}</p>
            <Button onClick={fetchEnrollments}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Enrollment Management"
        subtitle="Review, approve, and reject student course enrollments"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <SummaryCard label="Total Enrollments" value={summary.total} />
        <SummaryCard label="Pending" value={summary.pending} />
        <SummaryCard label="Approved" value={summary.approved} />
        <SummaryCard label="Rejected" value={summary.rejected} />
      </div>

      <Card>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>All Enrollment Requests</h3>
            <p style={{ margin: "0.35rem 0 0", opacity: 0.75 }}>
              Manage student enrollments across semesters and academic years
            </p>
          </div>

          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <label htmlFor="statusFilter" style={{ fontWeight: 600 }}>
              Filter:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                minWidth: "160px",
              }}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <Button onClick={fetchEnrollments}>Refresh</Button>
          </div>
        </div>

        {filteredEnrollments.length === 0 ? (
          <EmptyState
            title="No enrollments found"
            description="There are no enrollment records matching the selected filter."
          />
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {filteredEnrollments.map((enrollment) => {
              const isUpdating = actionLoadingId === enrollment._id;
              const currentStatus = (
                enrollment.status || "pending"
              ).toLowerCase();

              return (
                <div
                  key={enrollment._id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "1rem",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "260px" }}>
                      <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>
                        {enrollment?.student?.name || "Unknown Student"}
                      </h3>

                      <div style={{ display: "grid", gap: "0.35rem" }}>
                        <p style={{ margin: 0 }}>
                          <strong>Email:</strong>{" "}
                          {enrollment?.student?.email || "N/A"}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Matric No:</strong>{" "}
                          {enrollment?.student?.matricNo || "N/A"}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Academic Year:</strong>{" "}
                          {enrollment?.academicYear || "N/A"}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Semester:</strong>{" "}
                          {enrollment?.semester || "N/A"}
                        </p>
                        <p style={{ margin: 0 }}>
                          <strong>Status:</strong>{" "}
                          <StatusBadge status={currentStatus} />
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        onClick={() =>
                          handleStatusUpdate(enrollment._id, "approved")
                        }
                        disabled={isUpdating || currentStatus === "approved"}
                      >
                        {isUpdating && currentStatus !== "approved"
                          ? "Processing..."
                          : currentStatus === "approved"
                            ? "Approved"
                            : "Approve"}
                      </Button>

                      <Button
                        onClick={() =>
                          handleStatusUpdate(enrollment._id, "rejected")
                        }
                        disabled={isUpdating || currentStatus === "rejected"}
                      >
                        {isUpdating && currentStatus !== "rejected"
                          ? "Processing..."
                          : currentStatus === "rejected"
                            ? "Rejected"
                            : "Reject"}
                      </Button>
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <h4 style={{ marginBottom: "0.75rem" }}>Courses</h4>

                    {Array.isArray(enrollment?.courses) &&
                    enrollment.courses.length > 0 ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "0.75rem",
                        }}
                      >
                        {enrollment.courses.map((course) => (
                          <div
                            key={course._id}
                            style={{
                              border: "1px solid #e5e7eb",
                              borderRadius: "12px",
                              padding: "0.85rem",
                              background: "#f9fafb",
                            }}
                          >
                            <p style={{ margin: 0, fontWeight: 700 }}>
                              {course?.title || "Untitled Course"}
                            </p>
                            <p style={{ margin: "0.35rem 0 0" }}>
                              <strong>Code:</strong> {course?.code || "N/A"}
                            </p>
                            <p style={{ margin: "0.35rem 0 0" }}>
                              <strong>Credits:</strong>{" "}
                              {course?.creditHours ?? "N/A"}
                            </p>
                            <p style={{ margin: "0.35rem 0 0" }}>
                              <strong>Level:</strong> {course?.level || "N/A"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ margin: 0, opacity: 0.7 }}>
                        No courses attached to this enrollment.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <Card>
      <p style={{ margin: 0, opacity: 0.75 }}>{label}</p>
      <h2 style={{ margin: "0.5rem 0 0" }}>{value}</h2>
    </Card>
  );
}

function StatusBadge({ status }) {
  const normalized = (status || "pending").toLowerCase();

  const styles = {
    pending: {
      background: "#fff7ed",
      color: "#c2410c",
    },
    approved: {
      background: "#ecfdf5",
      color: "#047857",
    },
    rejected: {
      background: "#fef2f2",
      color: "#b91c1c",
    },
  };

  const badgeStyle = styles[normalized] || styles.pending;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.3rem 0.65rem",
        borderRadius: "999px",
        fontSize: "0.85rem",
        fontWeight: 700,
        ...badgeStyle,
      }}
    >
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}
