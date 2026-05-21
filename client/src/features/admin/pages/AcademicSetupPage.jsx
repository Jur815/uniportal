import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  createDepartment,
  createFaculty,
  createProgram,
  getDepartments,
  getFaculties,
  getPrograms,
} from "../../../api/academic.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const initialFaculty = { name: "", code: "", description: "" };
const initialDepartment = {
  name: "",
  code: "",
  faculty: "",
  description: "",
};
const initialProgram = {
  name: "",
  code: "",
  faculty: "",
  department: "",
  description: "",
};

export default function AcademicSetupPage() {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [facultyForm, setFacultyForm] = useState(initialFaculty);
  const [departmentForm, setDepartmentForm] = useState(initialDepartment);
  const [programForm, setProgramForm] = useState(initialProgram);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");

  const loadAcademicSetup = async () => {
    try {
      setLoading(true);
      setError("");

      const [facultyData, departmentData, programData] = await Promise.all([
        getFaculties(),
        getDepartments(),
        getPrograms(),
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

  useEffect(() => {
    loadAcademicSetup();
  }, []);

  const filteredProgramDepartments = useMemo(() => {
    if (!programForm.faculty) return departments;
    return departments.filter(
      (department) => getId(department.faculty) === programForm.faculty,
    );
  }, [departments, programForm.faculty]);

  const updateFacultyForm = (event) => {
    const { name, value } = event.target;
    setFacultyForm((current) => ({ ...current, [name]: value }));
  };

  const updateDepartmentForm = (event) => {
    const { name, value } = event.target;
    setDepartmentForm((current) => ({ ...current, [name]: value }));
  };

  const updateProgramForm = (event) => {
    const { name, value } = event.target;
    setProgramForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "faculty") next.department = "";
      return next;
    });
  };

  const handleCreateFaculty = async (event) => {
    event.preventDefault();

    try {
      setSaving("faculty");
      await createFaculty(facultyForm);
      setFacultyForm(initialFaculty);
      toast.success("Faculty created");
      await loadAcademicSetup();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create faculty");
    } finally {
      setSaving("");
    }
  };

  const handleCreateDepartment = async (event) => {
    event.preventDefault();

    try {
      setSaving("department");
      await createDepartment(departmentForm);
      setDepartmentForm(initialDepartment);
      toast.success("Department created");
      await loadAcademicSetup();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create department");
    } finally {
      setSaving("");
    }
  };

  const handleCreateProgram = async (event) => {
    event.preventDefault();

    try {
      setSaving("program");
      await createProgram(programForm);
      setProgramForm(initialProgram);
      toast.success("Program created");
      await loadAcademicSetup();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create program");
    } finally {
      setSaving("");
    }
  };

  if (loading) return <Loader text="Loading academic setup..." />;

  return (
    <div>
      <PageHeader
        title="Academic Setup"
        subtitle="Build the university structure: faculties, departments, and programs."
      />

      {error && <p className="error-text">{error}</p>}

      <div className="setup-grid">
        <SetupSection
          title="Faculties"
          subtitle="Top-level academic divisions."
          form={
            <form className="form" onSubmit={handleCreateFaculty}>
              <input
                name="name"
                placeholder="Faculty name"
                value={facultyForm.name}
                onChange={updateFacultyForm}
              />
              <input
                name="code"
                placeholder="Code"
                value={facultyForm.code}
                onChange={updateFacultyForm}
              />
              <input
                name="description"
                placeholder="Description"
                value={facultyForm.description}
                onChange={updateFacultyForm}
              />
              <Button type="submit" disabled={saving === "faculty"}>
                {saving === "faculty" ? "Creating..." : "Create Faculty"}
              </Button>
            </form>
          }
          emptyTitle="No faculties yet."
          items={faculties.map((faculty) => ({
            id: faculty._id,
            title: faculty.name,
            meta: faculty.code,
          }))}
        />

        <SetupSection
          title="Departments"
          subtitle="Departments belong to a faculty."
          form={
            <form className="form" onSubmit={handleCreateDepartment}>
              <select
                name="faculty"
                value={departmentForm.faculty}
                onChange={updateDepartmentForm}
              >
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
                value={departmentForm.name}
                onChange={updateDepartmentForm}
              />
              <input
                name="code"
                placeholder="Code"
                value={departmentForm.code}
                onChange={updateDepartmentForm}
              />
              <input
                name="description"
                placeholder="Description"
                value={departmentForm.description}
                onChange={updateDepartmentForm}
              />
              <Button type="submit" disabled={saving === "department"}>
                {saving === "department"
                  ? "Creating..."
                  : "Create Department"}
              </Button>
            </form>
          }
          emptyTitle="No departments yet."
          items={departments.map((department) => ({
            id: department._id,
            title: department.name,
            meta: `${department.code} / ${department.faculty?.name || "Faculty"}`,
          }))}
        />

        <SetupSection
          title="Programs"
          subtitle="Programs belong to a department."
          form={
            <form className="form" onSubmit={handleCreateProgram}>
              <select
                name="faculty"
                value={programForm.faculty}
                onChange={updateProgramForm}
              >
                <option value="">Select faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
              <select
                name="department"
                value={programForm.department}
                onChange={updateProgramForm}
              >
                <option value="">Select department</option>
                {filteredProgramDepartments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
              <input
                name="name"
                placeholder="Program name"
                value={programForm.name}
                onChange={updateProgramForm}
              />
              <input
                name="code"
                placeholder="Code"
                value={programForm.code}
                onChange={updateProgramForm}
              />
              <input
                name="description"
                placeholder="Description"
                value={programForm.description}
                onChange={updateProgramForm}
              />
              <Button type="submit" disabled={saving === "program"}>
                {saving === "program" ? "Creating..." : "Create Program"}
              </Button>
            </form>
          }
          emptyTitle="No programs yet."
          items={programs.map((program) => ({
            id: program._id,
            title: program.name,
            meta: `${program.code} / ${program.department?.name || "Department"}`,
          }))}
        />
      </div>
    </div>
  );
}

function SetupSection({ title, subtitle, form, items, emptyTitle }) {
  return (
    <Card>
      <div className="setup-section-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {form}

      <div className="setup-list">
        {items.length === 0 ? (
          <EmptyState title={emptyTitle} />
        ) : (
          items.map((item) => (
            <div key={item.id} className="setup-list-item">
              <strong>{item.title}</strong>
              <span>{item.meta}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function getId(value) {
  return typeof value === "string" ? value : value?._id || "";
}
