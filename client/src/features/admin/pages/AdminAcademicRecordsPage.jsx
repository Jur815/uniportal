import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  generateAcademicRecord,
  getAcademicRecords,
  updateAcademicRecordGrades,
} from "../../../api/academicRecords.api";
import { getAllEnrollments } from "../../../api/enrollments.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";

const courseStatuses = ["in-progress", "passed", "failed", "incomplete"];

export default function AdminAcademicRecordsPage() {
  const { studentId } = useParams();
  const [records, setRecords] = useState([]);
  const [approvedEnrollments, setApprovedEnrollments] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [gradeRows, setGradeRows] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRecords = useCallback(async () => {
    const params = studentId ? { student: studentId } : {};
    const data = await getAcademicRecords(params);
    const nextRecords = data?.data?.records || [];

    setRecords(nextRecords);
    setSelectedRecord((current) =>
      current
        ? nextRecords.find((record) => record._id === current._id) || null
        : null,
    );
  }, [studentId]);

  const loadApprovedEnrollments = useCallback(async () => {
    if (studentId) return;

    const data = await getAllEnrollments({ status: "approved" });
    setApprovedEnrollments(data?.data?.enrollments || []);
  }, [studentId]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([loadRecords(), loadApprovedEnrollments()]);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load academic records",
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [loadApprovedEnrollments, loadRecords]);

  useEffect(() => {
    setGradeRows(
      (selectedRecord?.courses || []).map((course) => ({
        course: getCourseId(course),
        code: course.code,
        title: course.title,
        creditHours: course.creditHours,
        grade: course.grade || "",
        gradePoint: course.gradePoint ?? "",
        status: course.status || "in-progress",
      })),
    );
    setRemarks(selectedRecord?.remarks || "");
  }, [selectedRecord]);

  const generatedEnrollmentIds = useMemo(
    () => new Set(records.map((record) => String(record.enrollment?._id || record.enrollment))),
    [records],
  );

  const handleGenerate = async (enrollmentId) => {
    try {
      setSaving(true);
      await generateAcademicRecord(enrollmentId);
      await loadRecords();
      toast.success("Academic record generated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to generate academic record",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGradeChange = (courseId, field, value) => {
    setGradeRows((current) =>
      current.map((row) =>
        row.course === courseId ? { ...row, [field]: value } : row,
      ),
    );
  };

  const saveGrades = async (event) => {
    event.preventDefault();

    if (!selectedRecord) return;

    try {
      setSaving(true);
      const data = await updateAcademicRecordGrades(selectedRecord._id, {
        courses: gradeRows.map(({ course, grade, gradePoint, status }) => ({
          course,
          grade,
          gradePoint,
          status,
        })),
        remarks,
      });
      const updatedRecord = data?.data?.record;
      setRecords((current) =>
        current.map((record) =>
          record._id === updatedRecord?._id ? updatedRecord : record,
        ),
      );
      setSelectedRecord(updatedRecord);
      toast.success("Grades updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update grades");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading academic records..." />;

  return (
    <div>
      <PageHeader
        title="Academic Records"
        subtitle="Generate demo-level academic records from approved enrollments and update grades."
      />

      {error && <p className="error-text">{error}</p>}

      {!studentId && (
        <Card>
          <h2>Approved Enrollments</h2>
          {approvedEnrollments.length === 0 ? (
            <EmptyState title="No approved enrollments available." />
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Academic Year</th>
                    <th>Semester</th>
                    <th>Courses</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedEnrollments.map((enrollment) => {
                    const generated = generatedEnrollmentIds.has(
                      String(enrollment._id),
                    );

                    return (
                      <tr key={enrollment._id}>
                        <td>{enrollment.student?.name || "Unknown student"}</td>
                        <td>{enrollment.academicYear}</td>
                        <td>{enrollment.semester}</td>
                        <td>{enrollment.courses?.length || 0}</td>
                        <td>
                          <Button
                            onClick={() => handleGenerate(enrollment._id)}
                            disabled={saving || generated}
                          >
                            {generated ? "Generated" : "Generate Record"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <div className="student-management-grid">
        <div className="course-management-list">
          {records.length === 0 ? (
            <EmptyState title="No academic records found." />
          ) : (
            records.map((record) => (
              <Card key={record._id}>
                <div className="course-management-item">
                  <div>
                    <h3>{record.student?.name || "Unknown student"}</h3>
                    <p>
                      <strong>Academic Year:</strong> {record.academicYear}
                    </p>
                    <p>
                      <strong>Semester:</strong> {record.semester}
                    </p>
                    <p>
                      <strong>Credits:</strong> {record.totalCredits}
                    </p>
                    <p>
                      <strong>GPA:</strong> {record.GPA ?? 0}
                    </p>
                  </div>
                  <div className="course-actions">
                    <Button onClick={() => setSelectedRecord(record)}>
                      Update Grades
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card>
          <h2>Grade Entry</h2>
          {!selectedRecord ? (
            <EmptyState title="Select an academic record to update grades." />
          ) : (
            <form className="detail-list" onSubmit={saveGrades}>
              <p>
                <strong>Student:</strong> {selectedRecord.student?.name || "N/A"}
              </p>
              <p>
                <strong>Session:</strong> {selectedRecord.academicYear} /
                Semester {selectedRecord.semester}
              </p>
              <div className="responsive-table">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Credits</th>
                      <th>Grade</th>
                      <th>Point</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeRows.map((row) => (
                      <tr key={row.course}>
                        <td>
                          {row.code} / {row.title}
                        </td>
                        <td>{row.creditHours}</td>
                        <td>
                          <input
                            value={row.grade}
                            onChange={(event) =>
                              handleGradeChange(row.course, "grade", event.target.value)
                            }
                            placeholder="A"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.01"
                            value={row.gradePoint}
                            onChange={(event) =>
                              handleGradeChange(
                                row.course,
                                "gradePoint",
                                event.target.value,
                              )
                            }
                            placeholder="4.0"
                          />
                        </td>
                        <td>
                          <select
                            value={row.status}
                            onChange={(event) =>
                              handleGradeChange(row.course, "status", event.target.value)
                            }
                          >
                            {courseStatuses.map((status) => (
                              <option key={status} value={status}>
                                {formatStatus(status)}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <label>
                Remarks
                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows="3"
                />
              </label>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Grades"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

function getCourseId(course) {
  return typeof course.course === "string" ? course.course : course.course?._id;
}

function formatStatus(status = "") {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
