import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdminCourseDetail } from "../../../api/courses.api";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

export default function AdminCourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAdminCourseDetail(courseId);
        setCourse(data?.data?.course || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  if (loading) return <Loader text="Loading course detail..." />;

  if (error) {
    return (
      <div>
        <PageHeader title="Course Detail" subtitle="Review course enrollment activity." />
        <p className="error-text">{error}</p>
        <Link to="/admin/courses" className="btn">
          Back to Courses
        </Link>
      </div>
    );
  }

  if (!course) return <EmptyState title="Course not found." />;

  const summary = course.enrollmentSummary || {};
  const recentEnrollments = course.recentEnrollments || [];

  return (
    <div>
      <PageHeader
        title={course.title}
        subtitle={`${course.code} / ${course.creditHours} credits / Semester ${course.semester}`}
      />

      <div className="course-detail-actions">
        <Link to="/admin/courses" className="btn">
          Back to Courses
        </Link>
      </div>

      <div className="course-detail-grid">
        <Card>
          <h2>Course Profile</h2>
          <div className="detail-list">
            <p>
              <strong>Status:</strong> {course.isActive ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Level:</strong> {course.level}
            </p>
            <p>
              <strong>Faculty:</strong> {course.facultyRef?.name || "N/A"}
            </p>
            <p>
              <strong>Department:</strong>{" "}
              {course.departmentRef?.name || course.department || "N/A"}
            </p>
            <p>
              <strong>Program:</strong>{" "}
              {course.programRef?.name || course.program || "N/A"}
            </p>
          </div>
        </Card>

        <Card>
          <h2>Enrollment Snapshot</h2>
          <div className="metric-grid">
            <Metric label="Total" value={summary.total || 0} />
            <Metric label="Pending" value={summary.pending || 0} />
            <Metric label="Approved" value={summary.approved || 0} />
            <Metric label="Rejected" value={summary.rejected || 0} />
          </div>
        </Card>
      </div>

      <Card>
        <h2>Recent Enrollments</h2>
        {recentEnrollments.length === 0 ? (
          <EmptyState title="No enrollments for this course yet." />
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Academic Year</th>
                  <th>Semester</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEnrollments.map((enrollment) => (
                  <tr key={enrollment._id}>
                    <td>{enrollment.student?.name || "Unknown student"}</td>
                    <td>{enrollment.student?.email || "N/A"}</td>
                    <td>{enrollment.academicYear}</td>
                    <td>{enrollment.semester}</td>
                    <td className="capitalize">{enrollment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
