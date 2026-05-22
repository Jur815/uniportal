import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  createDepartment,
  deactivateDepartment,
  getDepartments,
  updateDepartment,
} from "../../../api/departments.api";
import { getFaculties } from "../../../api/faculties.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const emptyForm = {
  name: "",
  code: "",
  faculty: "",
  description: "",
  isActive: true,
};

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    const [facultyData, departmentData] = await Promise.all([
      getFaculties(),
      getDepartments(),
    ]);
    setFaculties(facultyData?.data?.faculties || []);
    setDepartments(departmentData?.data?.departments || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");
        await loadData();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load departments");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!facultyFilter) return departments;
    return departments.filter(
      (department) => getId(department.faculty) === facultyFilter,
    );
  }, [departments, facultyFilter]);

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

  const submitDepartment = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      if (editingId) {
        await updateDepartment(editingId, form);
        toast.success("Department updated");
      } else {
        await createDepartment(form);
        toast.success("Department created");
      }
      resetForm();
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save department");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (department) => {
    setEditingId(department._id);
    setForm({
      name: department.name || "",
      code: department.code || "",
      faculty: getId(department.faculty),
      description: department.description || "",
      isActive: department.isActive !== false,
    });
  };

  const deactivate = async (department) => {
    try {
      await deactivateDepartment(department._id);
      toast.success("Department deactivated");
      await loadData();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to deactivate department",
      );
    }
  };

  if (loading) return <Loader text="Loading departments..." />;

  return (
    <div>
      <PageHeader
        title="Department Management"
        subtitle="Manage departments and connect them to faculties."
      />

      {error && <p className="error-text">{error}</p>}

      <div className="management-grid">
        <Card>
          <h2>{editingId ? "Edit Department" : "Create Department"}</h2>
          <form className="form" onSubmit={submitDepartment}>
            <select name="faculty" value={form.faculty} onChange={handleChange}>
              <option value="">Select faculty</option>
              {faculties.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </option>
              ))}
            </select>
            <input
              name="name"
              placeholder="Department name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="code"
              placeholder="Department code"
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
          <div className="review-toolbar">
            <div>
              <h2>Departments</h2>
              <p>Filter departments by faculty for quick administration.</p>
            </div>
            <select
              value={facultyFilter}
              onChange={(event) => setFacultyFilter(event.target.value)}
            >
              <option value="">All faculties</option>
              {faculties.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>

          {filteredDepartments.length === 0 ? (
            <EmptyState title="No departments found." />
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Faculty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((department) => (
                    <tr key={department._id}>
                      <td>{department.name}</td>
                      <td>{department.code}</td>
                      <td>{department.faculty?.name || "N/A"}</td>
                      <td>
                        <span
                          className={
                            department.isActive === false
                              ? "status-muted"
                              : "status-active"
                          }
                        >
                          {department.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="course-actions">
                          <Button onClick={() => startEdit(department)}>
                            Edit
                          </Button>
                          <Button
                            onClick={() => deactivate(department)}
                            disabled={department.isActive === false}
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

function getId(value) {
  return typeof value === "string" ? value : value?._id || "";
}
