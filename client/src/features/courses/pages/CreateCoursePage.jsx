import React, { useState } from "react";
import { createCourse } from "../../../api/courses.api";

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

      setMessage("Course created successfully");
      setFormData(initialState);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px" }}>
      <h2>Create Course</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Course title"
          value={formData.title}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          name="code"
          placeholder="Course code"
          value={formData.code}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          name="creditHours"
          placeholder="Credit hours"
          value={formData.creditHours}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          name="semester"
          placeholder="Semester"
          value={formData.semester}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <input
          name="level"
          placeholder="Level"
          value={formData.level}
          onChange={handleChange}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
}
