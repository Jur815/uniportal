import React from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function CourseCard({
  course,
  showEnroll = false,
  onEnroll,
  loading = false,
  isEnrolled = false,
  showEnrollmentMeta = false,
}) {
  const handleEnroll = () => {
    if (!loading && !isEnrolled && typeof onEnroll === "function") {
      onEnroll(course);
    }
  };

  return (
    <Card>
      <h3>{course.title}</h3>

      <p>
        <strong>Code:</strong> {course.code}
      </p>

      <p>
        <strong>Credit Hours:</strong> {course.creditHours}
      </p>

      <p>
        <strong>Semester:</strong> {course.semester}
      </p>

      <p>
        <strong>Level:</strong> {course.level}
      </p>

      {showEnrollmentMeta && (
        <>
          <p>
            <strong>Academic Year:</strong> {course.academicYear || "N/A"}
          </p>
          <p>
            <strong>Status:</strong> {course.enrollmentStatus || "N/A"}
          </p>
        </>
      )}

      {showEnroll && typeof onEnroll === "function" && (
        <Button onClick={handleEnroll} disabled={loading || isEnrolled}>
          {isEnrolled ? "Enrolled ✅" : loading ? "Enrolling..." : "Enroll"}
        </Button>
      )}
    </Card>
  );
}
