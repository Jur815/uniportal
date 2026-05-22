import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCourses } from "../../../api/enrollments.api";
import CourseCard from "../components/CourseCard";
import Loader from "../../../components/ui/Loader";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";

const defaultSummary = {
  totalCourses: 0,
  totalCredits: 0,
  officialCourses: 0,
  officialCredits: 0,
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
        title="My Enrollments"
        subtitle="Track pending, approved, and rejected course enrollment requests."
      />

      <div style={{ marginBottom: "1rem" }}>
        <strong>Requests:</strong> {summary.totalCourses} |{" "}
        <strong>Requested Credits:</strong> {summary.totalCredits} |{" "}
        <strong>Official Courses:</strong> {summary.officialCourses} |{" "}
        <strong>Official Credits:</strong> {summary.officialCredits}
      </div>

      <div className="course-detail-actions">
        <Link className="btn btn-outline" to="/my-enrollments">
          View Enrollment Slips
        </Link>
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
