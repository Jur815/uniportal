import React from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function CourseCard({
  course,
  showEnroll = false,
  onEnroll,
  loading = false,
  isEnrolled = false,
  enrollmentDisabled = false,
  showEnrollmentMeta = false,
}) {
  const facultyName = course.facultyRef?.name;
  const departmentName = course.departmentRef?.name || course.department;
  const programName = course.programRef?.name || course.program;

  const handleEnroll = () => {
    if (
      !loading &&
      !isEnrolled &&
      !enrollmentDisabled &&
      typeof onEnroll === "function"
    ) {
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

      {facultyName && (
        <p>
          <strong>Faculty:</strong> {facultyName}
        </p>
      )}

      {departmentName && (
        <p>
          <strong>Department:</strong> {departmentName}
        </p>
      )}

      {programName && (
        <p>
          <strong>Program:</strong> {programName}
        </p>
      )}

      {showEnrollmentMeta && (
        <>
          <p>
            <strong>Academic Year:</strong> {course.academicYear || "N/A"}
          </p>
          <p>
            <strong>Status:</strong> {course.enrollmentStatus || "N/A"}
          </p>
          {course.rejectionReason && (
            <p>
              <strong>Action Needed:</strong>{" "}
              {course.decisionReasonType
                ? `${course.decisionReasonType}: ${course.rejectionReason}`
                : course.rejectionReason}
            </p>
          )}
        </>
      )}

      {showEnroll && typeof onEnroll === "function" && (
        <Button
          onClick={handleEnroll}
          disabled={loading || isEnrolled || enrollmentDisabled}
        >
          {isEnrolled
            ? "Request Submitted"
            : loading
              ? "Submitting..."
              : enrollmentDisabled
                ? "Registration Closed"
                : "Request Enrollment"}
        </Button>
      )}
    </Card>
  );
}
