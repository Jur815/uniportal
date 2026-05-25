import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  getComplaints,
  updateComplaint,
} from "../../../api/complaints.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const STATUS_OPTIONS = ["all", "open", "in_review", "resolved", "closed"];

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("open");
  const [responseDrafts, setResponseDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = statusFilter === "all" ? {} : { status: statusFilter };
      const response = await getComplaints(params);
      setComplaints(response?.data?.complaints || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const summary = useMemo(() => summarizeComplaints(complaints), [complaints]);

  const handleDraftChange = (complaintId, value) => {
    setResponseDrafts((current) => ({ ...current, [complaintId]: value }));
  };

  const handleUpdate = async (complaint, payload) => {
    const draft = responseDrafts[complaint._id];
    const responseText = draft !== undefined ? draft : complaint.response || "";

    try {
      setActionLoadingId(complaint._id);
      const result = await updateComplaint(complaint._id, {
        response: responseText,
        ...payload,
      });
      const updatedComplaint = result?.data?.complaint;

      setComplaints((current) =>
        current.map((item) =>
          item._id === complaint._id ? updatedComplaint || item : item,
        ),
      );
      setResponseDrafts((current) => ({
        ...current,
        [complaint._id]: updatedComplaint?.response || responseText,
      }));

      toast.success("Complaint updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update complaint",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) return <Loader text="Loading complaint dashboard..." />;

  if (error) {
    return (
      <div>
        <PageHeader
          title="Complaint Dashboard"
          subtitle="Review student registration and academic support cases."
        />
        <EmptyState title={error} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Complaint Dashboard"
        subtitle="Respond to student helpdesk cases and track registration or academic issues."
      />

      <div className="metric-grid enrollment-summary-grid">
        <Metric label="Cases" value={summary.total} />
        <Metric label="Open" value={summary.open} />
        <Metric label="In Review" value={summary.in_review} />
        <Metric label="Resolved" value={summary.resolved} />
        <Metric label="Closed" value={summary.closed} />
      </div>

      <div className="review-toolbar">
        <div>
          <h2>Helpdesk Queue</h2>
          <p>Filter, respond, and mark cases as resolved for the demo cycle.</p>
        </div>

        <div className="toolbar-actions">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
          <Button className="btn-outline" onClick={fetchComplaints}>
            Refresh
          </Button>
        </div>
      </div>

      {complaints.length === 0 ? (
        <EmptyState title="No complaints found for this filter." />
      ) : (
        <div className="complaint-card-list">
          {complaints.map((complaint) => {
            const disabled = actionLoadingId === complaint._id;
            const draft =
              responseDrafts[complaint._id] ?? complaint.response ?? "";

            return (
              <Card key={complaint._id}>
                <div className="complaint-card-header">
                  <div>
                    <p className="eyebrow">{formatLabel(complaint.complaintType)}</p>
                    <h2>{complaint.subject}</h2>
                    <p>{complaint.description}</p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>

                <div className="complaint-meta">
                  <span>{complaint.student?.name || "Student"}</span>
                  <span>{complaint.student?.email || "No email"}</span>
                  <span>{formatDate(complaint.createdAt)}</span>
                  <span>
                    Handled by {complaint.handledBy?.name || "Not assigned"}
                  </span>
                </div>

                <label className="complaint-response-field">
                  Response
                  <textarea
                    value={draft}
                    rows={4}
                    onChange={(event) =>
                      handleDraftChange(complaint._id, event.target.value)
                    }
                    placeholder="Write a clear institutional response for the student."
                  />
                </label>

                <div className="course-actions">
                  <Button
                    className="btn-outline"
                    disabled={disabled}
                    onClick={() => handleUpdate(complaint, {})}
                  >
                    Save Response
                  </Button>
                  <Button
                    className="btn-outline"
                    disabled={disabled}
                    onClick={() => handleUpdate(complaint, { status: "in_review" })}
                  >
                    Mark In Review
                  </Button>
                  <Button
                    disabled={disabled}
                    onClick={() => handleUpdate(complaint, { status: "resolved" })}
                  >
                    Mark Resolved
                  </Button>
                  <Button
                    className="btn-outline"
                    disabled={disabled}
                    onClick={() => handleUpdate(complaint, { status: "closed" })}
                  >
                    Close
                  </Button>
                </div>
              </Card>
            );
          })}
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

function StatusBadge({ status = "open" }) {
  return (
    <span className={`review-status status-${status}`}>{formatLabel(status)}</span>
  );
}

function summarizeComplaints(complaints) {
  return complaints.reduce(
    (acc, complaint) => {
      const status = complaint.status || "open";
      acc.total += 1;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { total: 0, open: 0, in_review: 0, resolved: 0, closed: 0 },
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
