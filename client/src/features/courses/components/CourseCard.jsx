import React from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function CourseCard({
  course,
  showEnroll = false,
  onEnroll,
  loading = false,
  isEnrolled = false,
  enrollmentStatus = "",
  enrollmentMeta = null,
  enrollmentDisabled = false,
  showEnrollmentMeta = false,
}) {
  const facultyName = course.facultyRef?.name;
  const departmentName = course.departmentRef?.name || course.department;
  const programName = course.programRef?.name || course.program;
  const hasEnrollmentRequest = Boolean(enrollmentStatus) || isEnrolled;
  const canRequestEnrollment =
    showEnroll &&
    typeof onEnroll === "function" &&
    !hasEnrollmentRequest &&
    !enrollmentDisabled &&
    course.isActive !== false;

  const handleEnroll = () => {
    if (
      !loading &&
      canRequestEnrollment
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

      {showEnroll && hasEnrollmentRequest && (
        <div className="course-enrollment-state">
          <span className={`review-status status-${enrollmentStatus || "pending"}`}>
            {formatStatus(enrollmentStatus || "pending")}
          </span>
          {enrollmentMeta?.rejectionReason && (
            <p>
              <strong>Action Needed:</strong>{" "}
              {enrollmentMeta.decisionReasonType
                ? `${enrollmentMeta.decisionReasonType}: ${enrollmentMeta.rejectionReason}`
                : enrollmentMeta.rejectionReason}
            </p>
          )}
        </div>
      )}

      {showEnroll && typeof onEnroll === "function" && !hasEnrollmentRequest && (
        <div className="course-enrollment-state">
          {enrollmentDisabled && (
            <p className="error-text">Registration is currently closed.</p>
          )}
          {course.isActive === false && (
            <p className="error-text">This course is currently inactive.</p>
          )}
          <Button
            onClick={handleEnroll}
            disabled={loading || !canRequestEnrollment}
          >
            {loading
              ? "Submitting..."
              : enrollmentDisabled
                ? "Registration Closed"
                : course.isActive === false
                  ? "Course Inactive"
                  : "Request Enrollment"}
          </Button>
        </div>
      )}
    </Card>
  );
}

function formatStatus(status = "pending") {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
