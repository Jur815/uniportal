import React, { useState } from "react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setFormData(initialState);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
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
            placeholder="Credit hours"
            value={formData.creditHours}
            onChange={handleChange}
          />
          <input
            name="semester"
            placeholder="Semester"
            value={formData.semester}
            onChange={handleChange}
          />
          <input
            name="level"
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
