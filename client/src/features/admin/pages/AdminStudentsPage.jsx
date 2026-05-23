import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getDepartments, getFaculties, getPrograms } from "../../../api/academic.api";
import {
  getStudents,
  updateStudentAcademicVerification,
  updateStudentStatus,
} from "../../../api/students.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const initialFilters = {
  search: "",
  faculty: "",
  department: "",
  program: "",
  status: "",
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
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

  const loadStudents = useCallback(async (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== ""),
    );
    const data = await getStudents(cleanParams);
    const nextStudents = data?.data?.students || [];
    setStudents(nextStudents);
    setSelectedStudent((current) =>
      current
        ? nextStudents.find((student) => student.id === current.id) || current
        : null,
    );
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadSetup(), loadStudents(initialFilters)]);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [loadSetup, loadStudents]);

  const filteredDepartments = useMemo(() => {
    if (!filters.faculty) return departments;
    const selectedFaculty = faculties.find(
      (faculty) => faculty.name === filters.faculty,
    );
    return selectedFaculty
      ? departments.filter(
          (department) => getId(department.faculty) === selectedFaculty._id,
        )
      : departments;
  }, [departments, faculties, filters.faculty]);

  const filteredPrograms = useMemo(() => {
    if (!filters.department) return programs;
    const selectedDepartment = departments.find(
      (department) => department.name === filters.department,
    );
    return selectedDepartment
      ? programs.filter(
          (program) => getId(program.department) === selectedDepartment._id,
        )
      : programs;
  }, [departments, filters.department, programs]);

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
      await loadStudents(filters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to filter students");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = async () => {
    try {
      setFilters(initialFilters);
      setLoading(true);
      await loadStudents(initialFilters);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset filters");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (student) => {
    const nextStatus = student.status === "suspended" ? "active" : "suspended";

    try {
      setSavingId(student.id);
      const data = await updateStudentStatus(student.id, nextStatus);
      const updatedStudent = data?.data?.student;
      setStudents((current) =>
        current.map((item) =>
          item.id === student.id ? updatedStudent || item : item,
        ),
      );
      setSelectedStudent((current) =>
        current?.id === student.id ? updatedStudent || current : current,
      );
      toast.success(
        nextStatus === "suspended"
          ? "Student account suspended"
          : "Student account activated",
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update student");
    } finally {
      setSavingId("");
    }
  };

  const toggleVerification = async (student) => {
    const nextValue = !student.profile?.academicVerified;

    try {
      setSavingId(student.id);
      const data = await updateStudentAcademicVerification(student.id, nextValue);
      const updatedStudent = data?.data?.student;
      setStudents((current) =>
        current.map((item) =>
          item.id === student.id ? updatedStudent || item : item,
        ),
      );
      setSelectedStudent((current) =>
        current?.id === student.id ? updatedStudent || current : current,
      );
      toast.success(nextValue ? "Academic fields verified" : "Verification removed");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update verification",
      );
    } finally {
      setSavingId("");
    }
  };

  if (loading) return <Loader text="Loading students..." />;

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle="Search students, review academic profiles, and manage account status."
      />

      <div className="course-detail-actions">
        <Link className="btn" to="/admin/students/new">
          Create Student
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}

      <Card>
        <form className="course-filter-bar" onSubmit={applyFilters}>
          <input
            name="search"
            placeholder="Search name, email, student ID, or registration number"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select name="faculty" value={filters.faculty} onChange={handleFilterChange}>
            <option value="">All faculties</option>
            {faculties.map((faculty) => (
              <option key={faculty._id} value={faculty.name}>
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
              <option key={department._id} value={department.name}>
                {department.name}
              </option>
            ))}
          </select>
          <select name="program" value={filters.program} onChange={handleFilterChange}>
            <option value="">All programs</option>
            {filteredPrograms.map((program) => (
              <option key={program._id} value={program.name}>
                {program.name}
              </option>
            ))}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button type="submit">Apply</Button>
          <Button type="button" onClick={resetFilters}>
            Reset
          </Button>
        </form>
      </Card>

      <div className="student-management-grid">
        <div className="course-management-list">
          {students.length === 0 ? (
            <EmptyState title="No students found." />
          ) : (
            students.map((student) => (
              <Card key={student.id}>
                <div className="course-management-item">
                  <div>
                    <div className="course-title-row">
                      <h3>{student.name}</h3>
                      <span
                        className={
                          student.status === "suspended"
                            ? "status-muted"
                            : "status-active"
                        }
                      >
                        {student.status || "active"}
                      </span>
                    </div>
                    <p>
                      <strong>Email:</strong> {student.email}
                    </p>
                    <p>
                      <strong>Student ID:</strong>{" "}
                      {student.profile?.studentId || "N/A"}
                    </p>
                    <p>
                      <strong>Registration No:</strong>{" "}
                      {student.profile?.registrationNumber || "N/A"}
                    </p>
                    <p>
                      <strong>Program:</strong> {student.profile?.program || "N/A"}
                    </p>
                  </div>
                  <div className="course-actions">
                    <Button onClick={() => setSelectedStudent(student)}>
                      View
                    </Button>
                    <Button
                      onClick={() => toggleStatus(student)}
                      disabled={savingId === student.id}
                    >
                      {student.status === "suspended" ? "Activate" : "Suspend"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card>
          <h2>Student Profile</h2>
          {!selectedStudent ? (
            <EmptyState title="Select a student to view profile details." />
          ) : (
            <div className="detail-list">
              <p>
                <strong>Name:</strong> {selectedStudent.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedStudent.email}
              </p>
              <p>
                <strong>Status:</strong> {selectedStudent.status || "active"}
              </p>
              <p>
                <strong>Student ID:</strong>{" "}
                {selectedStudent.profile?.studentId || "N/A"}
              </p>
              <p>
                <strong>Registration No:</strong>{" "}
                {selectedStudent.profile?.registrationNumber || "N/A"}
              </p>
              <p>
                <strong>Faculty:</strong> {selectedStudent.profile?.faculty || "N/A"}
              </p>
              <p>
                <strong>Department:</strong>{" "}
                {selectedStudent.profile?.department || "N/A"}
              </p>
              <p>
                <strong>Program:</strong> {selectedStudent.profile?.program || "N/A"}
              </p>
              <p>
                <strong>Level:</strong> {selectedStudent.profile?.level || "N/A"}
              </p>
              <p>
                <strong>Year of Study:</strong>{" "}
                {selectedStudent.profile?.yearOfStudy || "N/A"}
              </p>
              <p>
                <strong>Intake Year:</strong>{" "}
                {selectedStudent.profile?.intakeYear || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedStudent.profile?.phone || "N/A"}
              </p>
              <p>
                <strong>Guardian Name:</strong>{" "}
                {selectedStudent.profile?.guardianName || "N/A"}
              </p>
              <p>
                <strong>Guardian Phone:</strong>{" "}
                {selectedStudent.profile?.guardianPhone || "N/A"}
              </p>
              <p>
                <strong>Academic Verified:</strong>{" "}
                {selectedStudent.profile?.academicVerified ? "Yes" : "No"}
              </p>
              <div className="course-actions">
                <Button
                  onClick={() => toggleVerification(selectedStudent)}
                  disabled={savingId === selectedStudent.id}
                >
                  {selectedStudent.profile?.academicVerified
                    ? "Unlock Academic Fields"
                    : "Verify Academic Fields"}
                </Button>
                <Link
                  className="btn btn-outline"
                  to={`/admin/students/${selectedStudent.id}/academic-records`}
                >
                  Academic Records
                </Link>
              </div>
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
