import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getDepartments, getFaculties, getPrograms } from "../../../api/academic.api";
import { createCourse } from "../../../api/courses.api";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

const initialState = { 
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
};

export default function CreateCoursePage() {
  const [formData, setFormData] = useState(initialState);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [setupLoading, setSetupLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAcademicOptions = async () => {
      try {
        setSetupLoading(true);
        const [facultyData, departmentData, programData] = await Promise.all([
          getFaculties({ isActive: true }),
          getDepartments({ isActive: true }),
          getPrograms({ isActive: true }),
        ]);

        setFaculties(facultyData?.data?.faculties || []);
        setDepartments(departmentData?.data?.departments || []);
        setPrograms(programData?.data?.programs || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load academic setup",
        );
      } finally {
        setSetupLoading(false);
      }
    };

    loadAcademicOptions();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (!formData.facultyRef) return departments;
    return departments.filter(
      (department) => getId(department.faculty) === formData.facultyRef,
    );
  }, [departments, formData.facultyRef]);

  const filteredPrograms = useMemo(() => {
    if (!formData.departmentRef) return programs;
    return programs.filter(
      (program) => getId(program.department) === formData.departmentRef,
    );
  }, [formData.departmentRef, programs]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "facultyRef"
        ? { departmentRef: "", programRef: "", department: "", program: "" }
        : {}),
      ...(name === "departmentRef" ? { programRef: "", program: "" } : {}),
    }));
  };

  const validate = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.code.trim()) return "Course code is required";
    if (!formData.creditHours) return "Credit hours are required";
    if (Number(formData.creditHours) <= 0) {
      return "Credit hours must be greater than 0";
    }
    if (!formData.semester) return "Semester is required";
    if (![1, 2].includes(Number(formData.semester))) {
      return "Semester must be 1 or 2";
    }
    if (!formData.level) return "Level is required";
    if (Number(formData.level) < 1 || Number(formData.level) > 6) {
      return "Level must be between 1 and 6";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const selectedDepartment = departments.find(
        (department) => department._id === formData.departmentRef,
      );
      const selectedProgram = programs.find(
        (program) => program._id === formData.programRef,
      );

      await createCourse({
        ...formData,
        department: selectedDepartment?.name || formData.department,
        program: selectedProgram?.name || formData.program,
        creditHours: Number(formData.creditHours),
        semester: Number(formData.semester),
        level: Number(formData.level),
      });

      setMessage("Course created successfully.");
      toast.success("Course created successfully.");
      setFormData(initialState);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to create course";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Course" subtitle="Add a new course." />

      <Card>
        <form className="form" onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Course title"
            value={formData.title}
            onChange={handleChange}
          />
          <input
            name="code"
            placeholder="Course code"
            value={formData.code}
            onChange={handleChange}
          />
          <input
            name="creditHours"
            type="number"
            placeholder="Credit hours"
            value={formData.creditHours}
            onChange={handleChange}
          />
          <input
            name="semester"
            type="number"
            placeholder="Semester"
            value={formData.semester}
            onChange={handleChange}
          />
          <input
            name="level"
            type="number"
            placeholder="Level"
            value={formData.level}
            onChange={handleChange}
          />
          <select
            name="facultyRef"
            value={formData.facultyRef}
            onChange={handleChange}
            disabled={setupLoading}
          >
            <option value="">Select faculty</option>
            {faculties.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>
                {faculty.name}
              </option>
            ))}
          </select>
          <select
            name="departmentRef"
            value={formData.departmentRef}
            onChange={handleChange}
            disabled={setupLoading}
          >
            <option value="">Select department</option>
            {filteredDepartments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
          <select
            name="programRef"
            value={formData.programRef}
            onChange={handleChange}
            disabled={setupLoading}
          >
            <option value="">Select program</option>
            {filteredPrograms.map((program) => (
              <option key={program._id} value={program._id}>
                {program.name}
              </option>
            ))}
          </select>

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function getId(value) {
  return typeof value === "string" ? value : value?._id || "";
}
