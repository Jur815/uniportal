import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  createExamClearance,
  getExamClearances,
  updateExamClearance,
} from "../../../api/examClearance.api";
import { getStudents } from "../../../api/students.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const emptyForm = {
  student: "",
  academicYear: "",
  semester: "1",
  status: "pending",
  attendancePercentage: "0",
  financialClearanceStatus: "pending",
  remarks: "",
};

const initialFilters = {
  academicYear: "",
  semester: "",
  status: "",
};

const CLEARANCE_STATUSES = ["pending", "eligible", "not_eligible"];
const FINANCIAL_STATUSES = ["pending", "cleared", "not_cleared"];

export default function AdminExamClearancePage() {
  const [clearances, setClearances] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState(emptyForm);
  const [editClearanceId, setEditClearanceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    const response = await getStudents({ status: "active" });
    setStudents(response?.data?.students || []);
  }, []);

  const loadClearances = useCallback(async (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== ""),
    );
    const response = await getExamClearances(cleanParams);
    setClearances(response?.data?.clearances || []);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadStudents(), loadClearances(initialFilters)]);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load exam clearance",
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [loadClearances, loadStudents]);

  const summary = useMemo(() => summarize(clearances), [clearances]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await loadClearances(filters);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to filter exam clearance",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    try {
      setFilters(initialFilters);
      setLoading(true);
      await loadClearances(initialFilters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset filters");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const startEdit = (clearance) => {
    setEditClearanceId(clearance._id);
    setForm({
      student: getId(clearance.student),
      academicYear: clearance.academicYear || "",
      semester: String(clearance.semester || "1"),
      status: clearance.status || "pending",
      attendancePercentage: String(clearance.attendancePercentage ?? 0),
      financialClearanceStatus:
        clearance.financialClearanceStatus || "pending",
      remarks: clearance.remarks || "",
    });
  };

  const resetForm = () => {
    setEditClearanceId("");
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(editClearanceId || "new");
      const payload = {
        ...form,
        semester: Number(form.semester),
        attendancePercentage: Number(form.attendancePercentage),
      };

      if (editClearanceId) {
        await updateExamClearance(editClearanceId, payload);
        toast.success("Exam clearance updated");
      } else {
        await createExamClearance(payload);
        toast.success("Exam clearance created");
      }

      resetForm();
      await loadClearances(filters);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save exam clearance",
      );
    } finally {
      setSaving("");
    }
  };

  if (loading) return <Loader text="Loading exam clearance..." />;

  return (
    <div>
      <PageHeader
        title="Exam Clearance"
        subtitle="Manage demo-level exam eligibility, attendance, and financial clearance records."
      />

      {error && <p className="error-text">{error}</p>}

      <div className="metric-grid enrollment-summary-grid">
        <Metric label="Records" value={summary.total} />
        <Metric label="Eligible" value={summary.eligible} />
        <Metric label="Not Eligible" value={summary.not_eligible} />
        <Metric label="Pending" value={summary.pending} />
      </div>

      <Card>
        <form className="student-create-form" onSubmit={handleSubmit}>
          <section>
            <h2>
              {editClearanceId
                ? "Edit Exam Clearance"
                : "Create Exam Clearance"}
            </h2>
            <div className="form-grid">
              <label>
                Student
                <select
                  name="student"
                  value={form.student}
                  onChange={handleFormChange}
                  disabled={Boolean(editClearanceId)}
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.email}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Academic year
                <input
                  name="academicYear"
                  value={form.academicYear}
                  onChange={handleFormChange}
                  placeholder="2026/2027"
                />
              </label>

              <label>
                Semester
                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleFormChange}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </label>

              <label>
                Eligibility status
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  {CLEARANCE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Attendance percentage
                <input
                  name="attendancePercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={form.attendancePercentage}
                  onChange={handleFormChange}
                />
              </label>

              <label>
                Financial clearance
                <select
                  name="financialClearanceStatus"
                  value={form.financialClearanceStatus}
                  onChange={handleFormChange}
                >
                  {FINANCIAL_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Remarks
              <textarea
                name="remarks"
                rows={4}
                value={form.remarks}
                onChange={handleFormChange}
                placeholder="Registrar or admin note for the student."
              />
            </label>

            <div className="course-actions">
              <Button type="submit" disabled={Boolean(saving)}>
                {saving
                  ? "Saving..."
                  : editClearanceId
                    ? "Save Clearance"
                    : "Create Clearance"}
              </Button>
              {editClearanceId && (
                <Button type="button" className="btn-outline" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </section>
        </form>
      </Card>

      <Card>
        <form className="course-filter-bar" onSubmit={applyFilters}>
          <input
            name="academicYear"
            value={filters.academicYear}
            onChange={handleFilterChange}
            placeholder="Academic year"
          />
          <select
            name="semester"
            value={filters.semester}
            onChange={handleFilterChange}
          >
            <option value="">All semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            {CLEARANCE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
          <Button type="submit">Apply</Button>
          <Button type="button" className="btn-outline" onClick={resetFilters}>
            Reset
          </Button>
        </form>
      </Card>

      <div className="course-management-list">
        {clearances.length === 0 ? (
          <EmptyState title="No exam clearance records found." />
        ) : (
          clearances.map((clearance) => (
            <Card key={clearance._id}>
              <ClearanceItem
                clearance={clearance}
                saving={saving === clearance._id}
                onEdit={() => startEdit(clearance)}
              />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function ClearanceItem({ clearance, saving, onEdit }) {
  return (
    <div className="course-management-item">
      <div>
        <div className="course-title-row">
          <h3>{clearance.student?.name || "Student"}</h3>
          <StatusBadge status={clearance.status} />
        </div>
        <p>
          <strong>Email:</strong> {clearance.student?.email || "N/A"} /{" "}
          <strong>Academic Year:</strong> {clearance.academicYear} /{" "}
          <strong>Semester:</strong> {clearance.semester}
        </p>
        <p>
          <strong>Attendance:</strong> {clearance.attendancePercentage ?? 0}% /{" "}
          <strong>Financial Clearance:</strong>{" "}
          <FinancialBadge status={clearance.financialClearanceStatus} />
        </p>
        <p>
          <strong>Remarks:</strong> {clearance.remarks || "No remarks provided."}
        </p>
        <p>
          <strong>Reviewed By:</strong>{" "}
          {clearance.reviewedBy?.name || "Not reviewed"} /{" "}
          <strong>Reviewed At:</strong> {formatDate(clearance.reviewedAt)}
        </p>
      </div>
      <div className="course-actions">
        <Button onClick={onEdit} disabled={saving}>
          Edit
        </Button>
      </div>
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

function getId(value) {
  return typeof value === "string" ? value : value?._id || "";
}
