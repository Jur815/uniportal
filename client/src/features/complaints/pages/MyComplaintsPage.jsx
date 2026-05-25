import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  createComplaint,
  getMyComplaints,
} from "../../../api/complaints.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const COMPLAINT_TYPES = [
  { value: "registration_issue", label: "Registration issue" },
  { value: "course_issue", label: "Course issue" },
  { value: "academic_record_issue", label: "Academic record issue" },
  { value: "profile_issue", label: "Profile issue" },
  { value: "technical_issue", label: "Technical issue" },
  { value: "general_inquiry", label: "General inquiry" },
];

const initialForm = {
  complaintType: "registration_issue",
  subject: "",
  description: "",
};

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getMyComplaints();

        if (!isMounted) return;
        setComplaints(response?.data?.complaints || []);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message || "Failed to load your complaints",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadComplaints();

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => summarizeComplaints(complaints), [complaints]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Subject and description are required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await createComplaint({
        complaintType: form.complaintType,
        subject: form.subject,
        description: form.description,
      });
      const complaint = response?.data?.complaint;

      if (complaint) {
        setComplaints((current) => [complaint, ...current]);
      }

      setForm(initialForm);
      toast.success("Complaint submitted");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to submit complaint",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading helpdesk history..." />;
  if (error) return <EmptyState title={error} />;

  return (
    <div>
      <PageHeader
        title="My Complaints"
        subtitle="Submit registration or academic issues and track the response from the institution."
      />

      <div className="metric-grid enrollment-summary-grid">
        <Metric label="Total Cases" value={summary.total} />
        <Metric label="Open" value={summary.open} />
        <Metric label="In Review" value={summary.in_review} />
        <Metric label="Resolved or Closed" value={summary.resolvedClosed} />
      </div>

      <Card>
        <form className="student-create-form complaint-form" onSubmit={handleSubmit}>
          <section>
            <h2>Submit New Complaint</h2>
            <div className="form-grid">
              <label>
                Complaint type
                <select
                  name="complaintType"
                  value={form.complaintType}
                  onChange={handleChange}
                >
                  {COMPLAINT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Subject
                <input
                  name="subject"
                  value={form.subject}
                  maxLength={120}
                  onChange={handleChange}
                  placeholder="Brief issue summary"
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                maxLength={1200}
                rows={5}
                onChange={handleChange}
                placeholder="Describe the registration or academic issue clearly."
              />
            </label>

            <div className="course-actions">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </div>
          </section>
        </form>
      </Card>

      {complaints.length === 0 ? (
        <EmptyState title="No complaints submitted yet." />
      ) : (
        <Card>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Institution Response</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>{formatDate(complaint.createdAt)}</td>
                    <td>{formatLabel(complaint.complaintType)}</td>
                    <td>{complaint.subject}</td>
                    <td>
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td>{complaint.response || "Awaiting response"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
      acc.resolvedClosed = acc.resolved + acc.closed;
      return acc;
    },
    {
      total: 0,
      open: 0,
      in_review: 0,
      resolved: 0,
      closed: 0,
      resolvedClosed: 0,
    },
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
