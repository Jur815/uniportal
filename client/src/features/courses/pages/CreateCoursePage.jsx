import { useState } from "react";

export default function CreateCoursePage() {
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    creditHours: "",
    semester: "",
    level: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Course created:", formData);

    setFormData({
      code: "",
      title: "",
      creditHours: "",
      semester: "",
      level: "",
    });
  };

  return (
    <div className="page">
      <h1>Create Course</h1>

      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Course Code
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g. CSC201"
            required
          />
        </label>

        <label>
          Course Title
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Data Structures"
            required
          />
        </label>

        <label>
          Credit Hours
          <input
            type="number"
            name="creditHours"
            value={formData.creditHours}
            onChange={handleChange}
            placeholder="e.g. 3"
            required
          />
        </label>

        <label>
          Semester
          <input
            type="number"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            placeholder="e.g. 1"
            required
          />
        </label>

        <label>
          Level
          <input
            type="text"
            name="level"
            value={formData.level}
            onChange={handleChange}
            placeholder="e.g. 100"
            required
          />
        </label>

        <button type="submit" className="btn">
          Create Course
        </button>
      </form>
    </div>
  );
}
