import React from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function CourseCard({
  course,
  showEnroll = false,
  onEnroll,
  loading = false,
}) {
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

      {showEnroll && (
        <Button onClick={() => onEnroll(course._id)} disabled={loading}>
          {loading ? "Enrolling..." : "Enroll"}
        </Button>
      )}
    </Card>
  );
}
