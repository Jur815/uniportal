import React, { useEffect, useState } from "react";

import { getMyAcademicRecords } from "../../../api/academicRecords.api";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

export default function MyAcademicRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRecords = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyAcademicRecords();

        if (!isMounted) return;

        setRecords(data?.data?.records || []);
      } catch (err) {
        if (!isMounted) return;
        setError(
          err?.response?.data?.message || "Failed to load academic records",
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <Loader text="Loading academic records..." />;
  if (error) return <EmptyState title={error} />;

  return (
    <div>
      <PageHeader
        title="My Academic Records"
        subtitle="View generated academic records, grades, GPA, and remarks."
      />

      {records.length === 0 ? (
        <EmptyState title="No academic records available yet." />
      ) : (
        <div className="review-list">
          {records.map((record) => (
            <section className="card" key={record._id}>
              <div className="review-card-header">
                <div>
                  <h2>
                    {record.academicYear} / Semester {record.semester}
                  </h2>
                  <p>
                    Total Credits: {record.totalCredits} / GPA: {record.GPA ?? 0}
                  </p>
                </div>
                <span className="review-status status-approved">Generated</span>
              </div>

              <div className="responsive-table">
                <table>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Course</th>
                      <th>Credits</th>
                      <th>Grade</th>
                      <th>Point</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(record.courses || []).map((course) => (
                      <tr key={course.course || course.code}>
                        <td>{course.code}</td>
                        <td>{course.title}</td>
                        <td>{course.creditHours}</td>
                        <td>{course.grade || "Pending"}</td>
                        <td>{course.gradePoint ?? "Pending"}</td>
                        <td>{formatStatus(course.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {record.remarks && (
                <p>
                  <strong>Remarks:</strong> {record.remarks}
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function formatStatus(status = "in-progress") {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
