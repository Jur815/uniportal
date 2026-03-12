import React, { useEffect, useState } from "react";
import { getMyCourses } from "../../../api/enrollments.api";
import CourseCard from "../components/CourseCard";
import Loader from "../../../components/ui/Loader";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";

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

  if (loading) return <Loader text="Loading my courses..." />;
  if (error) return <EmptyState title={error} />;

  return (
    <div>
      <PageHeader title="My Courses" subtitle="Courses you are enrolled in." />

      {courses.length === 0 ? (
        <EmptyState title="You have not enrolled in any courses yet." />
      ) : (
        <div className="grid">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
