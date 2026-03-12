import React, { useEffect, useState } from "react";
import { getAllCourses } from "../../../api/courses.api";
import { enrollInCourse } from "../../../api/enrollments.api";
import { useAuth } from "../../auth/context/AuthContext";

export default function CoursesPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCourses(data.data.courses || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      setActionLoadingId(courseId);
      await enrollInCourse(courseId);
      alert("Enrolled successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Courses</h2>

      {courses.length === 0 ? (
        <p>No courses found.</p>
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

            {user?.role === "student" && (
              <button
                onClick={() => handleEnroll(course._id)}
                disabled={actionLoadingId === course._id}
              >
                {actionLoadingId === course._id ? "Enrolling..." : "Enroll"}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
