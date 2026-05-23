import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getDepartments, getFaculties, getPrograms } from "../../../api/academic.api";
import { createStudent } from "../../../api/students.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  studentId: "",
  registrationNumber: "",
  faculty: "",
  department: "",
  program: "",
  level: "1",
  yearOfStudy: "1",
  intakeYear: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
};

export default function CreateStudentPage() {
  const [form, setForm] = useState(initialForm);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [createdStudent, setCreatedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSetup = async () => {
      try {
        setLoading(true);
        const [facultyData, departmentData, programData] = await Promise.all([
          getFaculties({ isActive: true }),
          getDepartments({ isActive: true }),
          getPrograms({ isActive: true }),
        ]);
        setFaculties(facultyData?.data?.faculties || []);
        setDepartments(departmentData?.data?.departments || []);
        setPrograms(programData?.data?.programs || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load academic setup");
      } finally {
        setLoading(false);
      }
    };

    loadSetup();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!form.faculty) return [];
    const selectedFaculty = faculties.find((faculty) => faculty.name === form.faculty);
    return selectedFaculty
      ? departments.filter((department) => getId(department.faculty) === selectedFaculty._id)
      : [];
  }, [departments, faculties, form.faculty]);

  const filteredPrograms = useMemo(() => {
    if (!form.department) return [];
    const selectedDepartment = departments.find(
      (department) => department.name === form.department,
    );
    return selectedDepartment
      ? programs.filter((program) => getId(program.department) === selectedDepartment._id)
      : [];
  }, [departments, form.department, programs]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "faculty" ? { department: "", program: "" } : {}),
      ...(name === "department" ? { program: "" } : {}),
      ...(name === "level" ? { yearOfStudy: value } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      const payload = {
        ...form,
        password: form.password.trim() || undefined,
        level: Number(form.level),
        yearOfStudy: Number(form.yearOfStudy || form.level),
        intakeYear: form.intakeYear ? Number(form.intakeYear) : undefined,
      };
      const data = await createStudent(payload);
      setCreatedStudent({
        student: data?.data?.student,
        temporaryPassword: data?.data?.temporaryPassword,
      });
      setForm(initialForm);
      toast.success("Student created successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create student");
      toast.error(err?.response?.data?.message || "Failed to create student");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading student creation form..." />;

  return (
    <div>
      <PageHeader
        title="Create Student"
        subtitle="Create a student account and academic profile for registration."
      />

      <div className="course-detail-actions">
        <Link className="btn btn-outline" to="/admin/students">
          Back to Students
        </Link>
      </div>

      {error && <p className="error-text">{error}</p>}

      {createdStudent?.student && (
        <Card>
          <h2>Student Created</h2>
          <div className="detail-list">
            <p>
              <strong>Name:</strong> {createdStudent.student.name}
            </p>
            <p>
              <strong>Email:</strong> {createdStudent.student.email}
            </p>
            <p>
              <strong>Student ID:</strong>{" "}
              {createdStudent.student.profile?.studentId || "N/A"}
            </p>
            {createdStudent.temporaryPassword && (
              <p>
                <strong>Temporary Password:</strong>{" "}
                {createdStudent.temporaryPassword}
              </p>
            )}
          </div>
        </Card>
      )}

      <Card>
        <form className="student-create-form" onSubmit={handleSubmit}>
          <section>
            <h2>Personal and Account Details</h2>
            <div className="form-grid">
              <label>
                Full Name
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to auto-generate"
                />
              </label>
              <label>
                Phone
                <input name="phone" value={form.phone} onChange={handleChange} />
              </label>
              <label>
                Gender
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Not specified</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                Date of Birth
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </label>
            </div>
            <label>
              Address
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
              />
            </label>
          </section>

          <section>
            <h2>Academic Identity</h2>
            <div className="form-grid">
              <label>
                Student ID
                <input
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Registration Number
                <input
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                />
              </label>
              <label>
                Faculty
                <select
                  name="faculty"
                  value={form.faculty}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select faculty</option>
                  {faculties.map((faculty) => (
                    <option key={faculty._id} value={faculty.name}>
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
                  onChange={handleChange}
                  required
                  disabled={!form.faculty}
                >
                  <option value="">Select department</option>
                  {filteredDepartments.map((department) => (
                    <option key={department._id} value={department.name}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Program
                <select
                  name="program"
                  value={form.program}
                  onChange={handleChange}
                  required
                  disabled={!form.department}
                >
                  <option value="">Select program</option>
                  {filteredPrograms.map((program) => (
                    <option key={program._id} value={program.name}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Level / Year
                <select name="level" value={form.level} onChange={handleChange}>
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <option key={level} value={level}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Intake Year
                <input
                  type="number"
                  name="intakeYear"
                  value={form.intakeYear}
                  onChange={handleChange}
                  placeholder="2026"
                />
              </label>
            </div>
          </section>

          <section>
            <h2>Guardian and Contact</h2>
            <div className="form-grid">
              <label>
                Guardian Name
                <input
                  name="guardianName"
                  value={form.guardianName}
                  onChange={handleChange}
                />
              </label>
              <label>
                Guardian Phone
                <input
                  name="guardianPhone"
                  value={form.guardianPhone}
                  onChange={handleChange}
                />
              </label>
            </div>
          </section>

          <div className="course-actions">
            <Button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Student"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function getId(value) {
  return typeof value === "string" ? value : value?._id || "";
}
