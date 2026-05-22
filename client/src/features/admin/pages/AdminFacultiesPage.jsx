import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createFaculty,
  deactivateFaculty,
  getFaculties,
  updateFaculty,
} from "../../../api/faculties.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  isActive: true,
};

export default function AdminFacultiesPage() {
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadFaculties = async () => {
    const data = await getFaculties();
    setFaculties(data?.data?.faculties || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");
        await loadFaculties();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load faculties");
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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const submitFaculty = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      if (editingId) {
        await updateFaculty(editingId, form);
        toast.success("Faculty updated");
      } else {
        await createFaculty(form);
        toast.success("Faculty created");
      }
      resetForm();
      await loadFaculties();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save faculty");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (faculty) => {
    setEditingId(faculty._id);
    setForm({
      name: faculty.name || "",
      code: faculty.code || "",
      description: faculty.description || "",
      isActive: faculty.isActive !== false,
    });
  };

  const deactivate = async (faculty) => {
    try {
      await deactivateFaculty(faculty._id);
      toast.success("Faculty deactivated");
      await loadFaculties();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to deactivate faculty");
    }
  };

  if (loading) return <Loader text="Loading faculties..." />;

  return (
    <div>
      <PageHeader
        title="Faculty Management"
        subtitle="Manage university faculties used by departments and courses."
      />

      {error && <p className="error-text">{error}</p>}

      <div className="management-grid">
        <Card>
          <h2>{editingId ? "Edit Faculty" : "Create Faculty"}</h2>
          <form className="form" onSubmit={submitFaculty}>
            <input
              name="name"
              placeholder="Faculty name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="code"
              placeholder="Faculty code"
              value={form.code}
              onChange={handleChange}
            />
            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
            <label className="checkbox-row">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleChange}
              />
              Active
            </label>
            <div className="course-actions">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
              {editingId && (
                <Button type="button" onClick={resetForm} disabled={saving}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <h2>Faculties</h2>
          {faculties.length === 0 ? (
            <EmptyState title="No faculties yet." />
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculties.map((faculty) => (
                    <tr key={faculty._id}>
                      <td>{faculty.name}</td>
                      <td>{faculty.code}</td>
                      <td>
                        <span
                          className={
                            faculty.isActive === false
                              ? "status-muted"
                              : "status-active"
                          }
                        >
                          {faculty.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="course-actions">
                          <Button onClick={() => startEdit(faculty)}>Edit</Button>
                          <Button
                            onClick={() => deactivate(faculty)}
                            disabled={faculty.isActive === false}
                          >
                            Deactivate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
