import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getAllCourses } from "../../../api/courses.api";
import { enrollInCourse, getMyCourses } from "../../../api/enrollments.api";
import { useAuth } from "../../auth/context/useAuth";
import CourseCard from "../components/CourseCard";
import Loader from "../../../components/ui/Loader";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";

const CURRENT_ACADEMIC_YEAR = "2025/2026";

export default function CoursesPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");

  const fetchCourses = useCallback(async () => {
    const data = await getAllCourses();
    return data?.data?.courses || [];
  }, []);

  const fetchMyCourseIds = useCallback(async () => {
    if (user?.role !== "student") return [];

    const data = await getMyCourses();
    const myCourses = data?.data?.courses || [];
    return myCourses.map((course) => course._id);
  }, [user?.role]);

  useEffect(() => {
    const bootstrapPage = async () => {
      try {
        setLoading(true);
        setError("");

        const [allCourses, myCourseIds] = await Promise.all([
          fetchCourses(),
          fetchMyCourseIds(),
        ]);

        setCourses(allCourses);
        setEnrolledIds(myCourseIds);
      } catch (err) {
        console.error("Failed to load courses page:", err);
        setError(err?.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    bootstrapPage();
  }, [fetchCourses, fetchMyCourseIds]);

  const handleEnroll = async (course) => {
    try {
      if (!course?._id) {
        toast.error("Invalid course selected");
        return;
      }

      if (enrolledIds.includes(course._id)) {
        toast.error("You are already enrolled in this course");
        return;
      }

      setActionLoadingId(course._id);

      await enrollInCourse({
        academicYear: CURRENT_ACADEMIC_YEAR,
        semester: Number(course.semester),
        courseId: course._id,
      });

      setEnrolledIds((prev) =>
        prev.includes(course._id) ? prev : [...prev, course._id],
      );

      toast.success("Enrolled successfully");
    } catch (err) {
      console.error("Enrollment failed:", err);
      toast.error(err?.response?.data?.message || "Enrollment failed");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) return <Loader text="Loading courses..." />;
  if (error) return <EmptyState title={error} />;

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Browse all available courses and enroll by semester."
      />

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
              isEnrolled={enrolledIds.includes(course._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
