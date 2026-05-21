import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createAcademicSession,
  getAcademicSessions,
  updateAcademicSession,
} from "../../../api/academicSessions.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const initialForm = {
  academicYear: "",
  semester: "1",
  registrationOpen: false,
  isActive: false,
  startDate: "",
  endDate: "",
};

export default function AcademicSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadSessions = async () => {
    const data = await getAcademicSessions();
    setSessions(data?.data?.sessions || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");
        await loadSessions();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitSession = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      await createAcademicSession({
        ...form,
        semester: Number(form.semester),
      });
      setForm(initialForm);
      await loadSessions();
      toast.success("Academic session created");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create session");
    } finally {
      setCreating(false);
    }
  };

  const updateSession = async (session, payload) => {
    try {
      setSavingId(session._id);
      await updateAcademicSession(session._id, payload);
      await loadSessions();
      toast.success("Academic session updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update session");
    } finally {
      setSavingId("");
    }
  };

  if (loading) return <Loader text="Loading academic sessions..." />;

  return (
    <div>
      <PageHeader
        title="Academic Sessions"
        subtitle="Control active semesters and student registration windows."
      />

      {error && <p className="error-text">{error}</p>}

      <div className="setup-grid">
        <Card>
          <div className="setup-section-header">
            <h2>Create Session</h2>
            <p>Define the academic year, semester, and registration status.</p>
          </div>
          <form className="form" onSubmit={submitSession}>
            <input
              name="academicYear"
              placeholder="2025/2026"
              value={form.academicYear}
              onChange={handleChange}
            />
            <select name="semester" value={form.semester} onChange={handleChange}>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
            />
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
            />
            <label className="checkbox-row">
              <input
                name="registrationOpen"
                type="checkbox"
                checked={form.registrationOpen}
                onChange={handleChange}
              />
              Registration open
            </label>
            <label className="checkbox-row">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
              />
              Active session
            </label>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Session"}
            </Button>
          </form>
        </Card>

        <Card>
          <div className="setup-section-header">
            <h2>Sessions</h2>
            <p>Open, close, or activate the current academic session.</p>
          </div>
          {sessions.length === 0 ? (
            <EmptyState title="No academic sessions created yet." />
          ) : (
            <div className="setup-list">
              {sessions.map((session) => (
                <div className="setup-list-item" key={session._id}>
                  <strong>
                    {session.academicYear} / Semester {session.semester}
                  </strong>
                  <span>
                    {session.isActive ? "Active" : "Inactive"} / Registration{" "}
                    {session.registrationOpen ? "Open" : "Closed"}
                  </span>
                  <span>
                    {formatDate(session.startDate)} - {formatDate(session.endDate)}
                  </span>
                  <div className="course-actions">
                    <Button
                      onClick={() =>
                        updateSession(session, {
                          registrationOpen: !session.registrationOpen,
                        })
                      }
                      disabled={savingId === session._id}
                    >
                      {session.registrationOpen ? "Close" : "Open"}
                    </Button>
                    <Button
                      onClick={() => updateSession(session, { isActive: true })}
                      disabled={savingId === session._id || session.isActive}
                    >
                      {session.isActive ? "Active" : "Set Active"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString();
}
