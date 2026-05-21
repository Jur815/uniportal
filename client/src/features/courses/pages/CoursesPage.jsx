import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getActiveAcademicSession } from "../../../api/academicSessions.api";
import { getAllCourses } from "../../../api/courses.api";
import { enrollInCourse, getMyCourses } from "../../../api/enrollments.api";
import { useAuth } from "../../auth/context/useAuth";
import CourseCard from "../components/CourseCard";
import Loader from "../../../components/ui/Loader";
import EmptyState from "../../../components/ui/EmptyState";
import PageHeader from "../../../components/ui/PageHeader";

export default function CoursesPage() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");

  const fetchCourses = useCallback(async (session) => {
    const params = session?.semester ? { semester: session.semester } : {};
    const data = await getAllCourses(params);
    return data?.data?.courses || [];
  }, []);

  const fetchMyCourseIds = useCallback(async (session) => {
    if (user?.role !== "student") return [];

    const params = session?.academicYear
      ? { academicYear: session.academicYear, semester: session.semester }
      : {};
    const data = await getMyCourses(params);
    const myCourses = data?.data?.courses || [];
    return myCourses.map((course) => course._id);
  }, [user?.role]);

  useEffect(() => {
    const bootstrapPage = async () => {
      try {
        setLoading(true);
        setError("");

        const sessionData = await getActiveAcademicSession();
        const session = sessionData?.data?.session || null;
        const [allCourses, myCourseIds] = await Promise.all([
          fetchCourses(session),
          fetchMyCourseIds(session),
        ]);

        setCourses(allCourses);
        setEnrolledIds(myCourseIds);
        setActiveSession(session);
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
        toast.error("You already have an enrollment request for this course");
        return;
      }

      if (!activeSession?.registrationOpen) {
        toast.error("Registration is not open for the active academic session");
        return;
      }

      setActionLoadingId(course._id);

      await enrollInCourse({
        academicYear: activeSession.academicYear,
        semester: Number(activeSession.semester),
        courseId: course._id,
      });

      setEnrolledIds((prev) =>
        prev.includes(course._id) ? prev : [...prev, course._id],
      );

      toast.success("Enrollment request submitted");
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
        subtitle={
          activeSession
            ? `${activeSession.academicYear} / Semester ${activeSession.semester} registration ${
                activeSession.registrationOpen ? "open" : "closed"
              }.`
            : "No active academic session has been configured."
        }
      />

      {!activeSession?.registrationOpen && (
        <p className="error-text">
          Registration is closed. You can browse courses, but enrollment requests
          are disabled.
        </p>
      )}

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
              enrollmentDisabled={!activeSession?.registrationOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
