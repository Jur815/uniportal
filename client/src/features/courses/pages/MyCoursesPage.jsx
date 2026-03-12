import React, { useEffect, useState } from "react";
import { getMyCourses } from "../../../api/enrollments.api";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const data = await getMyCourses();
        setCourses(data.data.courses || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load my courses");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  if (loading) return <div>Loading my courses...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>My Courses</h2>

      {courses.length === 0 ? (
        <p>You have not enrolled in any courses yet.</p>
      ) : (
        courses.map((course) => (
          <div
            key={course._id}
            style={{
              border: "1px solid #ddd",
              padding: "16px",
              marginBottom: "12px",
              borderRadius: "8px",
            }}
          >
            <h3>{course.title}</h3>
            <p>Code: {course.code}</p>
            <p>Credit Hours: {course.creditHours}</p>
            <p>Semester: {course.semester}</p>
          </div>
        ))
      )}
    </div>
  );
}
