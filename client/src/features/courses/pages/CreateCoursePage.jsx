import React, { useState } from "react";
import toast from "react-hot-toast";
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
};

export default function CreateCoursePage() {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
    if (Number(formData.semester) <= 0) {
      return "Semester must be greater than 0";
    }
    if (!formData.level) return "Level is required";
    if (Number(formData.level) <= 0) {
      return "Level must be greater than 0";
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
      await createCourse({
        ...formData,
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
