import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { getActiveAcademicSession } from "../../../api/academicSessions.api";
import { getAllCourses } from "../../../api/courses.api";
import { enrollInCourse, getMyCourses } from "../../../api/enrollments.api";
import { getMyProfile } from "../../../api/profile.api";
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
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");

  const enrollmentOpen =
    activeSession?.enrollmentStatus === "open" ||
    activeSession?.registrationOpen === true;

  const fetchCourses = useCallback(async (session, department = "") => {
    const params = session?.semester ? { semester: session.semester } : {};

    if (department) {
      const departmentData = await getAllCourses({ ...params, department });
      const departmentCourses = departmentData?.data?.courses || [];

      if (departmentCourses.length > 0) {
        return { courses: departmentCourses, departmentFilter: department };
      }
    }

    const data = await getAllCourses(params);
    return { courses: data?.data?.courses || [], departmentFilter: "" };
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
        const profileData =
          user?.role === "student" ? await getMyProfile() : null;
        const studentDepartment =
          profileData?.data?.profile?.department?.trim() || "";

        const [courseResult, myCourseIds] = await Promise.all([
          fetchCourses(session, studentDepartment),
          fetchMyCourseIds(session),
        ]);

        setCourses(courseResult.courses);
        setEnrolledIds(myCourseIds);
        setActiveSession(session);
        setDepartmentFilter(courseResult.departmentFilter);
      } catch (err) {
        console.error("Failed to load courses page:", err);
        setError(err?.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    bootstrapPage();
  }, [fetchCourses, fetchMyCourseIds, user?.role]);

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

      if (!enrollmentOpen) {
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
                enrollmentOpen ? "open" : "closed"
              }.${
                departmentFilter
                  ? ` Showing courses for ${departmentFilter}.`
                  : ""
              }`
            : "No active academic session has been configured."
        }
      />

      {!enrollmentOpen && (
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
              enrollmentDisabled={!enrollmentOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
