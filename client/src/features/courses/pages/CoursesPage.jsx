import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllCourses } from "../../../api/courses.api";
import { enrollInCourse } from "../../../api/enrollments.api";
import { useAuth } from "../../auth/context/useAuth";
import CourseCard from "../components/CourseCard";
import Loader from "../../../components/ui/Loader";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";

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
      toast.success("Enrolled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Enrollment failed");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) return <Loader text="Loading courses..." />;
  if (error) return <EmptyState title={error} />;

  return (
    <div>
      <PageHeader title="Courses" subtitle="Browse all available courses." />

      {courses.length === 0 ? (
        <EmptyState title="No courses found." />
      ) : (
        <div className="grid">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              showEnroll={user?.role === "student"}
              onEnroll={handleEnroll}
              loading={actionLoadingId === course._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
