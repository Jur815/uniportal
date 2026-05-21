import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getDepartments, getFaculties, getPrograms } from "../../../api/academic.api";
import {
  getAdminCourses,
  updateCourse,
  updateCourseStatus,
} from "../../../api/courses.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const emptyEditForm = {
  title: "",
  code: "",
  creditHours: "",
  semester: "",
  level: "",
  facultyRef: "",
  departmentRef: "",
  programRef: "",
  department: "",
  program: "",
  isActive: true,
};

const initialFilters = {
  search: "",
  facultyRef: "",
  departmentRef: "",
  programRef: "",
  isActive: "",
};

export default function AdminCourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [editCourseId, setEditCourseId] = useState("");
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  const loadSetup = useCallback(async () => {
    const [facultyData, departmentData, programData] = await Promise.all([
      getFaculties(),
      getDepartments(),
      getPrograms(),
    ]);

    setFaculties(facultyData?.data?.faculties || []);
    setDepartments(departmentData?.data?.departments || []);
    setPrograms(programData?.data?.programs || []);
  }, []);

  const loadCourses = useCallback(async (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== ""),
    );
    const data = await getAdminCourses(cleanParams);
    setCourses(data?.data?.courses || []);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadSetup(), loadCourses(initialFilters)]);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [loadCourses, loadSetup]);

  const filteredDepartments = useMemo(() => {
    if (!filters.facultyRef) return departments;
    return departments.filter(
      (department) => getId(department.faculty) === filters.facultyRef,
    );
  }, [departments, filters.facultyRef]);

  const filteredPrograms = useMemo(() => {
    if (!filters.departmentRef) return programs;
    return programs.filter(
      (program) => getId(program.department) === filters.departmentRef,
    );
  }, [filters.departmentRef, programs]);

  const editDepartments = useMemo(() => {
    if (!editForm.facultyRef) return departments;
    return departments.filter(
      (department) => getId(department.faculty) === editForm.facultyRef,
    );
  }, [departments, editForm.facultyRef]);

  const editPrograms = useMemo(() => {
    if (!editForm.departmentRef) return programs;
    return programs.filter(
      (program) => getId(program.department) === editForm.departmentRef,
    );
  }, [editForm.departmentRef, programs]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "facultyRef"
        ? { departmentRef: "", programRef: "" }
        : {}),
      ...(name === "departmentRef" ? { programRef: "" } : {}),
    }));
  };

  const applyFilters = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      await loadCourses(filters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to filter courses");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    try {
      setFilters(initialFilters);
      setLoading(true);
      await loadCourses(initialFilters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset filters");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (course) => {
    setEditCourseId(course._id);
    setEditForm({
      title: course.title || "",
      code: course.code || "",
      creditHours: String(course.creditHours || ""),
      semester: String(course.semester || ""),
      level: String(course.level || ""),
      facultyRef: getId(course.facultyRef),
      departmentRef: getId(course.departmentRef),
      programRef: getId(course.programRef),
      department: course.department || "",
      program: course.program || "",
      isActive: Boolean(course.isActive),
    });
  };

  const cancelEdit = () => {
    setEditCourseId("");
    setEditForm(emptyEditForm);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "facultyRef"
        ? { departmentRef: "", programRef: "", department: "", program: "" }
        : {}),
      ...(name === "departmentRef" ? { programRef: "", program: "" } : {}),
    }));
  };

  const saveCourse = async (event) => {
    event.preventDefault();

    try {
      setSaving(editCourseId);
      const selectedDepartment = departments.find(
        (department) => department._id === editForm.departmentRef,
      );
      const selectedProgram = programs.find(
        (program) => program._id === editForm.programRef,
      );

      await updateCourse(editCourseId, {
        ...editForm,
        department: selectedDepartment?.name || editForm.department,
        program: selectedProgram?.name || editForm.program,
        creditHours: Number(editForm.creditHours),
        semester: Number(editForm.semester),
        level: Number(editForm.level),
      });

      toast.success("Course updated");
      cancelEdit();
      await loadCourses(filters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update course");
    } finally {
      setSaving("");
    }
  };

  const toggleStatus = async (course) => {
    try {
      setSaving(course._id);
      await updateCourseStatus(course._id, !course.isActive);
      toast.success(course.isActive ? "Course deactivated" : "Course activated");
      await loadCourses(filters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update course");
    } finally {
      setSaving("");
    }
  };

  if (loading) return <Loader text="Loading course management..." />;

  return (
    <div>
      <PageHeader
        title="Course Management"
        subtitle="Search, filter, edit, activate, and deactivate courses."
      />

      {error && <p className="error-text">{error}</p>}

      <Card>
        <form className="course-filter-bar" onSubmit={applyFilters}>
          <input
            name="search"
            placeholder="Search title or code"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select
            name="facultyRef"
            value={filters.facultyRef}
            onChange={handleFilterChange}
          >
            <option value="">All faculties</option>
            {faculties.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>
                {faculty.name}
              </option>
            ))}
          </select>
          <select
            name="departmentRef"
            value={filters.departmentRef}
            onChange={handleFilterChange}
          >
            <option value="">All departments</option>
            {filteredDepartments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
          <select
            name="programRef"
            value={filters.programRef}
            onChange={handleFilterChange}
          >
            <option value="">All programs</option>
            {filteredPrograms.map((program) => (
              <option key={program._id} value={program._id}>
                {program.name}
              </option>
            ))}
          </select>
          <select
            name="isActive"
            value={filters.isActive}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <Button type="submit">Apply</Button>
          <Button type="button" onClick={resetFilters}>
            Reset
          </Button>
        </form>
      </Card>

      <div className="course-management-list">
        {courses.length === 0 ? (
          <EmptyState title="No courses found." />
        ) : (
          courses.map((course) => (
            <Card key={course._id}>
              {editCourseId === course._id ? (
                <CourseEditForm
                  form={editForm}
                  faculties={faculties}
                  departments={editDepartments}
                  programs={editPrograms}
                  saving={saving === course._id}
                  onChange={handleEditChange}
                  onCancel={cancelEdit}
                  onSubmit={saveCourse}
                />
              ) : (
                <CourseReadOnly
                  course={course}
                  saving={saving === course._id}
                  onEdit={() => startEdit(course)}
                  onToggle={() => toggleStatus(course)}
                />
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function CourseReadOnly({ course, saving, onEdit, onToggle }) {
  return (
    <div className="course-management-item">
      <div>
        <div className="course-title-row">
          <h3>{course.title}</h3>
          <span className={course.isActive ? "status-active" : "status-muted"}>
            {course.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p>
          <strong>Code:</strong> {course.code} /{" "}
          <strong>Credits:</strong> {course.creditHours} /{" "}
          <strong>Semester:</strong> {course.semester} /{" "}
          <strong>Level:</strong> {course.level}
        </p>
        <p>
          <strong>Enrollments:</strong> {course.enrollmentCount ?? 0}
        </p>
        <p>
          <strong>Faculty:</strong> {course.facultyRef?.name || "N/A"} /{" "}
          <strong>Department:</strong>{" "}
          {course.departmentRef?.name || course.department || "N/A"} /{" "}
          <strong>Program:</strong>{" "}
          {course.programRef?.name || course.program || "N/A"}
        </p>
      </div>
      <div className="course-actions">
        <Link to={`/admin/courses/${course._id}`} className="btn">
          Details
        </Link>
        <Button onClick={onEdit} disabled={saving}>
          Edit
        </Button>
        <Button onClick={onToggle} disabled={saving}>
          {saving
            ? "Saving..."
            : course.isActive
              ? "Deactivate"
              : "Reactivate"}
        </Button>
      </div>
    </div>
  );
}

function CourseEditForm({
  form,
  faculties,
  departments,
  programs,
  saving,
  onChange,
  onCancel,
  onSubmit,
}) {
  return (
    <form className="form" onSubmit={onSubmit}>
      <input
        name="title"
        placeholder="Course title"
        value={form.title}
        onChange={onChange}
      />
      <input
        name="code"
        placeholder="Course code"
        value={form.code}
        onChange={onChange}
      />
      <input
        name="creditHours"
        type="number"
        placeholder="Credit hours"
        value={form.creditHours}
        onChange={onChange}
      />
      <input
        name="semester"
        type="number"
        placeholder="Semester"
        value={form.semester}
        onChange={onChange}
      />
      <input
        name="level"
        type="number"
        placeholder="Level"
        value={form.level}
        onChange={onChange}
      />
      <select name="facultyRef" value={form.facultyRef} onChange={onChange}>
        <option value="">Select faculty</option>
        {faculties.map((faculty) => (
          <option key={faculty._id} value={faculty._id}>
            {faculty.name}
          </option>
        ))}
      </select>
      <select
        name="departmentRef"
        value={form.departmentRef}
        onChange={onChange}
      >
        <option value="">Select department</option>
        {departments.map((department) => (
          <option key={department._id} value={department._id}>
            {department.name}
          </option>
        ))}
      </select>
      <select name="programRef" value={form.programRef} onChange={onChange}>
        <option value="">Select program</option>
        {programs.map((program) => (
          <option key={program._id} value={program._id}>
            {program.name}
          </option>
        ))}
      </select>
      <div className="course-actions">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Course"}
        </Button>
        <Button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function getId(value) {
  return typeof value === "string" ? value : value?._id || "";
}
