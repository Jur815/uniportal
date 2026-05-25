import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { getDepartments, getFaculties, getPrograms } from "../../../api/academic.api";
import { getAdminCourses } from "../../../api/courses.api";
import {
  createTimetableEntry,
  deactivateTimetableEntry,
  getTimetableEntries,
  updateTimetableEntry,
} from "../../../api/timetable.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptyForm = {
  course: "",
  faculty: "",
  department: "",
  program: "",
  academicYear: "",
  semester: "1",
  dayOfWeek: "Monday",
  startTime: "08:00",
  endTime: "10:00",
  venue: "",
  lecturerName: "",
  isActive: true,
};

const initialFilters = {
  faculty: "",
  department: "",
  program: "",
  semester: "",
  isActive: "true",
};

export default function AdminTimetablePage() {
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState(emptyForm);
  const [editEntryId, setEditEntryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  const loadSetup = useCallback(async () => {
    const [facultyData, departmentData, programData, courseData] =
      await Promise.all([
        getFaculties(),
        getDepartments(),
        getPrograms(),
        getAdminCourses({ isActive: "true" }),
      ]);

    setFaculties(facultyData?.data?.faculties || []);
    setDepartments(departmentData?.data?.departments || []);
    setPrograms(programData?.data?.programs || []);
    setCourses(courseData?.data?.courses || []);
  }, []);

  const loadEntries = useCallback(async (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== ""),
    );
    const response = await getTimetableEntries(cleanParams);
    setEntries(response?.data?.entries || []);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadSetup(), loadEntries(initialFilters)]);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load timetable management",
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [loadEntries, loadSetup]);

  const filteredDepartments = useMemo(() => {
    if (!filters.faculty) return departments;
    return departments.filter(
      (department) => getId(department.faculty) === filters.faculty,
    );
  }, [departments, filters.faculty]);

  const filteredPrograms = useMemo(() => {
    if (!filters.department) return programs;
    return programs.filter(
      (program) => getId(program.department) === filters.department,
    );
  }, [filters.department, programs]);

  const formDepartments = useMemo(() => {
    if (!form.faculty) return departments;
    return departments.filter(
      (department) => getId(department.faculty) === form.faculty,
    );
  }, [departments, form.faculty]);

  const formPrograms = useMemo(() => {
    if (!form.department) return programs;
    return programs.filter(
      (program) => getId(program.department) === form.department,
    );
  }, [form.department, programs]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "faculty" ? { department: "", program: "" } : {}),
      ...(name === "department" ? { program: "" } : {}),
    }));
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await loadEntries(filters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to filter timetable");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    try {
      setFilters(initialFilters);
      setLoading(true);
      await loadEntries(initialFilters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset filters");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "faculty" ? { department: "", program: "" } : {}),
      ...(name === "department" ? { program: "" } : {}),
    }));
  };

  const startEdit = (entry) => {
    setEditEntryId(entry._id);
    setForm({
      course: getId(entry.course),
      faculty: getId(entry.faculty),
      department: getId(entry.department),
      program: getId(entry.program),
      academicYear: entry.academicYear || "",
      semester: String(entry.semester || "1"),
      dayOfWeek: entry.dayOfWeek || "Monday",
      startTime: entry.startTime || "08:00",
      endTime: entry.endTime || "10:00",
      venue: entry.venue || "",
      lecturerName: entry.lecturerName || "",
      isActive: Boolean(entry.isActive),
    });
  };

  const resetForm = () => {
    setEditEntryId("");
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(editEntryId || "new");
      const payload = {
        ...form,
        semester: Number(form.semester),
      };

      if (editEntryId) {
        await updateTimetableEntry(editEntryId, payload);
        toast.success("Timetable entry updated");
      } else {
        await createTimetableEntry(payload);
        toast.success("Timetable entry created");
      }

      resetForm();
      await loadEntries(filters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save timetable");
    } finally {
      setSaving("");
    }
  };

  const deactivateEntry = async (entry) => {
    try {
      setSaving(entry._id);
      await deactivateTimetableEntry(entry._id);
      toast.success("Timetable entry deactivated");
      await loadEntries(filters);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to deactivate timetable entry",
      );
    } finally {
      setSaving("");
    }
  };

  if (loading) return <Loader text="Loading timetable management..." />;

  return (
    <div>
      <PageHeader
        title="Timetable Management"
        subtitle="Create and manage demo-level class schedules by faculty, department, program, and semester."
      />

      {error && <p className="error-text">{error}</p>}

      <Card>
        <form className="student-create-form" onSubmit={handleSubmit}>
          <section>
            <h2>{editEntryId ? "Edit Timetable Entry" : "Create Timetable Entry"}</h2>
            <div className="form-grid">
              <label>
                Course
                <select name="course" value={form.course} onChange={handleFormChange}>
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.title}
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
                Day
                <select
                  name="dayOfWeek"
                  value={form.dayOfWeek}
                  onChange={handleFormChange}
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Start time
                <input
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleFormChange}
                />
              </label>

              <label>
                End time
                <input
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleFormChange}
                />
              </label>

              <label>
                Venue
                <input
                  name="venue"
                  value={form.venue}
                  onChange={handleFormChange}
                  placeholder="Main Hall A"
                />
              </label>

              <label>
                Lecturer
                <input
                  name="lecturerName"
                  value={form.lecturerName}
                  onChange={handleFormChange}
                  placeholder="Lecturer name"
                />
              </label>

              <label>
                Faculty
                <select name="faculty" value={form.faculty} onChange={handleFormChange}>
                  <option value="">Use course faculty</option>
                  {faculties.map((faculty) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Department
                <select
                  name="department"
                  value={form.department}
                  onChange={handleFormChange}
                >
                  <option value="">Use course department</option>
                  {formDepartments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Program
                <select name="program" value={form.program} onChange={handleFormChange}>
                  <option value="">Use course program</option>
                  {formPrograms.map((program) => (
                    <option key={program._id} value={program._id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="checkbox-row">
              <input
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleFormChange}
              />
              Active timetable entry
            </label>

            <div className="course-actions">
              <Button type="submit" disabled={Boolean(saving)}>
                {saving
                  ? "Saving..."
                  : editEntryId
                    ? "Save Entry"
                    : "Create Entry"}
              </Button>
              {editEntryId && (
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
          <select name="faculty" value={filters.faculty} onChange={handleFilterChange}>
            <option value="">All faculties</option>
            {faculties.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>
                {faculty.name}
              </option>
            ))}
          </select>
          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
          >
            <option value="">All departments</option>
            {filteredDepartments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
          <select name="program" value={filters.program} onChange={handleFilterChange}>
            <option value="">All programs</option>
            {filteredPrograms.map((program) => (
              <option key={program._id} value={program._id}>
                {program.name}
              </option>
            ))}
          </select>
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
            name="isActive"
            value={filters.isActive}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <Button type="submit">Apply</Button>
          <Button type="button" className="btn-outline" onClick={resetFilters}>
            Reset
          </Button>
        </form>
      </Card>

      <div className="course-management-list">
        {entries.length === 0 ? (
          <EmptyState title="No timetable entries found." />
        ) : (
          entries.map((entry) => (
            <Card key={entry._id}>
              <TimetableEntryItem
                entry={entry}
                saving={saving === entry._id}
                onEdit={() => startEdit(entry)}
                onDeactivate={() => deactivateEntry(entry)}
              />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function TimetableEntryItem({ entry, saving, onEdit, onDeactivate }) {
  return (
    <div className="course-management-item">
      <div>
        <div className="course-title-row">
          <h3>
            {entry.course?.code || "Course"} - {entry.course?.title || "Untitled"}
          </h3>
          <span className={entry.isActive ? "status-active" : "status-muted"}>
            {entry.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p>
          <strong>Schedule:</strong> {entry.dayOfWeek}, {entry.startTime} -{" "}
          {entry.endTime} / <strong>Venue:</strong> {entry.venue}
        </p>
        <p>
          <strong>Lecturer:</strong> {entry.lecturerName || "To be assigned"} /{" "}
          <strong>Academic Year:</strong> {entry.academicYear} /{" "}
          <strong>Semester:</strong> {entry.semester}
        </p>
        <p>
          <strong>Faculty:</strong> {entry.faculty?.name || "N/A"} /{" "}
          <strong>Department:</strong> {entry.department?.name || "N/A"} /{" "}
          <strong>Program:</strong> {entry.program?.name || "N/A"}
        </p>
      </div>
      <div className="course-actions">
        <Button onClick={onEdit} disabled={saving}>
          Edit
        </Button>
        <Button className="btn-outline" onClick={onDeactivate} disabled={saving}>
          {saving ? "Saving..." : "Deactivate"}
        </Button>
      </div>
    </div>
  );
}

function getId(value) {
  return typeof value === "string" ? value : value?._id || "";
}
