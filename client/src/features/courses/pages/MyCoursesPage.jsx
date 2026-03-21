import React, { useEffect, useState } from "react";
import { getMyCourses } from "../../../api/enrollments.api";
import CourseCard from "../components/CourseCard";
import Loader from "../../../components/ui/Loader";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";

const defaultSummary = {
  totalCourses: 0,
  totalCredits: 0,
};

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyCourses();

        if (!isMounted) return;

        setCourses(response?.data?.courses || []);
        setSummary(response?.summary || defaultSummary);
      } catch (err) {
        console.error("Failed to load my courses:", err);

        if (!isMounted) return;

        setError(err?.response?.data?.message || "Failed to load your courses");
        setCourses([]);
        setSummary(defaultSummary);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <Loader text="Loading your courses..." />;
  }

  if (error) {
    return <EmptyState title={error} />;
  }

  return (
    <div>
      <PageHeader
        title="My Courses"
        subtitle="View all courses you are currently enrolled in."
      />

      <div style={{ marginBottom: "1rem" }}>
        <strong>Total Courses:</strong> {summary.totalCourses} |{" "}
        <strong>Total Credits:</strong> {summary.totalCredits}
      </div>

      {courses.length === 0 ? (
        <EmptyState title="You are not enrolled in any courses yet." />
      ) : (
        <div className="grid">
          {courses.map((course) => (
            <CourseCard
              key={`${course.enrollmentId || "enrollment"}-${course._id}`}
              course={course}
              showEnrollmentMeta={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
