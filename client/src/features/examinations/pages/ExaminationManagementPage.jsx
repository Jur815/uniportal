import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  getExaminationRecords,
  getExaminationReports,
  getGradingPolicy,
  transitionResultWorkflow,
  updateGradingPolicy,
  updateResultMarks,
} from "../../../api/examinations.api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";
import { useAuth } from "../../auth/context/useAuth";

const defaultPolicy = {
  name: "Demo Policy - configurable per institution",
  gradeBands: [
    { minMark: 80, maxMark: 100, grade: "A", gradePoint: 4, isPass: true },
    { minMark: 70, maxMark: 79.99, grade: "B", gradePoint: 3, isPass: true },
    { minMark: 60, maxMark: 69.99, grade: "C", gradePoint: 2, isPass: true },
    { minMark: 50, maxMark: 59.99, grade: "D", gradePoint: 1, isPass: true },
    { minMark: 0, maxMark: 49.99, grade: "F", gradePoint: 0, isPass: false },
  ],
  promotionRules: {
    failedCourseThreshold: 1,
    carryOverThreshold: 2,
    repeatFailedCourseThreshold: 4,
    discontinueFailedCourseThreshold: 6,
    minimumGpa: 2,
    repeatGpaThreshold: 1.5,
    discontinueGpaThreshold: 1,
    minimumEarnedCredits: 12,
  },
};

export default function ExaminationManagementPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [markRows, setMarkRows] = useState([]);
  const [remarks, setRemarks] = useState("");
  const [note, setNote] = useState("");
  const [standingOverride, setStandingOverride] = useState("");
  const [reports, setReports] = useState(null);
  const [policy, setPolicy] = useState(defaultPolicy);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const requests = [getExaminationRecords(), getGradingPolicy()];
    if (["admin", "registrar", "dean_hod"].includes(user.role)) {
      requests.push(getExaminationReports());
    }
    const [recordData, policyData, reportData] = await Promise.all(requests);
    const nextRecords = recordData?.data?.records || [];
    setRecords(nextRecords);
    setSelected((current) =>
      current
        ? nextRecords.find((record) => record._id === current._id) || null
        : nextRecords[0] || null,
    );
    setPolicy(policyData?.data?.policy || defaultPolicy);
    setReports(reportData?.data || null);
  }, [user.role]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        await load();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load examination results");
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [load]);

  useEffect(() => {
    setMarkRows(
      (selected?.courses || []).map((course) => ({
        course:
          typeof course.course === "string" ? course.course : course.course?._id,
        code: course.code,
        title: course.title,
        creditHours: course.creditHours,
        marks: course.marks ?? "",
        grade: course.grade || "",
        gradePoint: course.gradePoint ?? "",
        status: course.status,
      })),
    );
    setRemarks(selected?.remarks || "");
    setNote("");
    setStandingOverride(selected?.academicStanding || "");
  }, [selected]);

  const canEdit = useMemo(
    () =>
      ["admin", "registrar", "lecturer"].includes(user.role) &&
      ["draft", "returned"].includes(selected?.workflowStatus),
    [selected?.workflowStatus, user.role],
  );

  const workflowActions = useMemo(() => {
    if (!selected) return [];
    if (
      ["lecturer", "admin", "registrar"].includes(user.role) &&
      ["draft", "returned"].includes(selected.workflowStatus)
    ) {
      return [["submit", "Submit Marks"]];
    }
    if (
      ["dean_hod", "admin"].includes(user.role) &&
      selected.workflowStatus === "lecturer_submitted"
    ) {
      return [
        ["review", "Approve Review"],
        ["return", "Return for Correction"],
      ];
    }
    if (
      ["registrar", "admin"].includes(user.role) &&
      selected.workflowStatus === "dean_hod_reviewed"
    ) {
      return [
        ["finalize", "Finalize Results"],
        ["return", "Return for Correction"],
      ];
    }
    if (
      ["registrar", "admin"].includes(user.role) &&
      selected.workflowStatus === "registrar_finalized"
    ) {
      return [
        ["release", "Release to Student"],
        ["return", "Return for Correction"],
      ];
    }
    return [];
  }, [selected, user.role]);

  const saveMarks = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      const data = await updateResultMarks(selected._id, {
        courses: markRows.map(({ course, marks }) => ({ course, marks })),
        remarks,
        note,
      });
      replaceRecord(data?.data?.record);
      toast.success("Marks and calculated results updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update marks");
    } finally {
      setSaving(false);
    }
  };

  const runWorkflow = async (action) => {
    try {
      setSaving(true);
      const data = await transitionResultWorkflow(
        selected._id,
        action,
        note,
        action === "finalize" ? standingOverride : undefined,
      );
      replaceRecord(data?.data?.record);
      await load();
      toast.success("Result workflow updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Workflow action failed");
    } finally {
      setSaving(false);
    }
  };

  const replaceRecord = (updated) => {
    if (!updated) return;
    setRecords((current) =>
      current.map((record) => (record._id === updated._id ? updated : record)),
    );
    setSelected(updated);
  };

  const savePolicy = async () => {
    try {
      setSaving(true);
      const data = await updateGradingPolicy(policy);
      setPolicy(data?.data?.policy || policy);
      toast.success("Institutional grading policy updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update policy");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading examination workspace..." />;

  return (
    <div>
      <PageHeader
        title="Examinations & Academic Progression"
        subtitle="Enter course marks, review calculated results, approve progression, and release results."
      />

      <div className="examination-layout">
        <div className="result-record-list">
          {records.length === 0 ? (
            <EmptyState title="No academic records are ready for result entry." />
          ) : (
            records.map((record) => (
              <button
                className={`result-record-button ${
                  selected?._id === record._id ? "active" : ""
                }`}
                key={record._id}
                onClick={() => setSelected(record)}
                type="button"
              >
                <strong>{record.student?.name || "Student"}</strong>
                <span>
                  {record.academicYear} / Semester {record.semester}
                </span>
                <span>{formatLabel(record.workflowStatus)}</span>
              </button>
            ))
          )}
        </div>

        <Card>
          {!selected ? (
            <EmptyState title="Select a result record." />
          ) : (
            <div className="detail-list">
              <div className="review-card-header">
                <div>
                  <h2>{selected.student?.name}</h2>
                  <p>
                    {selected.studentProfile?.registrationNumber ||
                      selected.studentProfile?.studentId ||
                      "Registration number pending"}
                  </p>
                </div>
                <span className="review-status status-approved">
                  {formatLabel(selected.workflowStatus)}
                </span>
              </div>

              <WorkflowProgress status={selected.workflowStatus} />

              <div className="metric-grid">
                <Metric label="GPA" value={selected.GPA ?? 0} />
                <Metric label="CGPA" value={selected.CGPA ?? 0} />
                <Metric label="Credits Earned" value={selected.earnedCredits ?? 0} />
                <Metric label="Failed Courses" value={selected.failedCourseCount ?? 0} />
                <Metric
                  label="Supplementary"
                  value={selected.supplementaryCourses?.length ?? 0}
                />
                <Metric
                  label="Carry Over"
                  value={selected.carryOverCourses?.length ?? 0}
                />
                <Metric label="Standing" value={selected.academicStanding || "Pending"} />
              </div>

              <VerificationSummary verification={selected.resultVerification} />

              <div className="responsive-table">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Credits</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>Point</th>
                      <th>Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markRows.map((row, index) => (
                      <tr key={row.course}>
                        <td>
                          {row.code} / {row.title}
                        </td>
                        <td>{row.creditHours}</td>
                        <td>
                          <input
                            aria-label={`Marks for ${row.code}`}
                            disabled={!canEdit}
                            max="100"
                            min="0"
                            onChange={(event) =>
                              setMarkRows((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, marks: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            type="number"
                            value={row.marks}
                          />
                        </td>
                        <td>{row.grade || "Pending"}</td>
                        <td>{row.gradePoint === "" ? "Pending" : row.gradePoint}</td>
                        <td>{formatLabel(row.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <label>
                Remarks
                <textarea
                  disabled={!canEdit}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows="3"
                  value={remarks}
                />
              </label>
              <label>
                Workflow note
                <textarea
                  onChange={(event) => setNote(event.target.value)}
                  rows="2"
                  value={note}
                />
              </label>
              {["admin", "registrar"].includes(user.role) &&
                selected.workflowStatus === "dean_hod_reviewed" && (
                  <label>
                    Registrar academic standing
                    <select
                      onChange={(event) =>
                        setStandingOverride(event.target.value)
                      }
                      value={standingOverride}
                    >
                      {[
                        "Pass",
                        "Supplementary",
                        "Carry Over",
                        "Repeat",
                        "Discontinued",
                        "Suspended",
                      ].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

              <div className="result-actions">
                {canEdit && (
                  <Button disabled={saving} onClick={saveMarks}>
                    Save Marks
                  </Button>
                )}
                {workflowActions.map(([action, label]) => (
                  <Button
                    className={action === "return" ? "btn-secondary" : ""}
                    disabled={saving}
                    key={action}
                    onClick={() => runWorkflow(action)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {selected.auditLog?.length > 0 && (
                <details>
                  <summary>Result audit trail</summary>
                  <div className="audit-list">
                    {[...selected.auditLog].reverse().map((entry) => (
                      <p key={entry._id}>
                        <strong>{formatLabel(entry.action)}</strong> by{" "}
                        {entry.actor?.name || entry.actorRole} on{" "}
                        {new Date(entry.occurredAt).toLocaleString()}
                      </p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </Card>
      </div>

      {reports && <ResultReports reports={reports} />}
      {["admin", "registrar"].includes(user.role) && (
        <PolicyEditor
          readOnly={user.role !== "admin"}
          policy={policy}
          saving={saving}
          setPolicy={setPolicy}
          onSave={savePolicy}
        />
      )}
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

function WorkflowProgress({ status }) {
  const steps = [
    ["lecturer_submitted", "Lecturer Submitted"],
    ["dean_hod_reviewed", "Dean/HOD Reviewed"],
    ["registrar_finalized", "Registrar Approved"],
    ["released", "Released"],
  ];
  const statusIndex = steps.findIndex(([value]) => value === status);

  return (
    <div className="result-workflow" aria-label="Result approval workflow">
      {steps.map(([value, label], index) => (
        <div
          className={`result-workflow-step ${
            status === "released" || index <= statusIndex ? "complete" : ""
          }`}
          key={value}
        >
          <span>{index + 1}</span>
          <strong>{label}</strong>
        </div>
      ))}
    </div>
  );
}

function VerificationSummary({ verification }) {
  if (!verification) return null;
  const labels = {
    completeMarks: "Complete marks",
    GPA: "GPA",
    CGPA: "CGPA",
    earnedCredits: "Earned credits",
    failedCourses: "Failed courses",
    supplementaryCourses: "Supplementary courses",
    carryOverCourses: "Carry-over courses",
  };

  return (
    <div
      className={`verification-callout ${
        verification.isValid ? "verified" : "attention"
      }`}
    >
      <strong>
        {verification.isValid
          ? "Result calculations verified"
          : "Result requires verification before release"}
      </strong>
      <div className="verification-checks">
        {Object.entries(verification.checks || {}).map(([key, passed]) => (
          <span key={key}>
            {passed ? "Verified" : "Check"}: {labels[key] || formatLabel(key)}
          </span>
        ))}
      </div>
    </div>
  );
}

function ResultReports({ reports }) {
  const lists = [
    ["Pass", reports.passList],
    ["Supplementary", reports.supplementaryList],
    ["Carry Over", reports.carryOverList],
    ["Repeat / Discontinued", reports.repeatDiscontinuedList],
  ];
  return (
    <Card>
      <h2>Released Result Reports</h2>
      <div className="metric-grid">
        {lists.map(([label, rows]) => (
          <Metric key={label} label={label} value={rows?.length || 0} />
        ))}
      </div>
      <div className="report-list-grid">
        <ReportList
          title="Supplementary List"
          rows={reports.supplementaryList}
        />
        <ReportList title="Carry-Over List" rows={reports.carryOverList} />
        <ReportList
          title="Repeat / Discontinued List"
          rows={reports.repeatDiscontinuedList}
        />
      </div>
      <h3>Department Performance Summary</h3>
      <div className="responsive-table">
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Students</th>
              <th>Average GPA</th>
              <th>Pass</th>
              <th>Supplementary</th>
              <th>Carry Over</th>
              <th>Repeat / Discontinued</th>
            </tr>
          </thead>
          <tbody>
            {(reports.departmentPerformance || []).map((row) => (
              <tr key={row.department}>
                <td>{row.department}</td>
                <td>{row.students}</td>
                <td>{row.averageGpa}</td>
                <td>{row.pass}</td>
                <td>{row.supplementary}</td>
                <td>{row.carryOver}</td>
                <td>{row.repeatOrDiscontinued}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReportList({ title, rows = [] }) {
  return (
    <div className="report-list">
      <h3>{title}</h3>
      {rows.length === 0 ? (
        <p>No released records in this category.</p>
      ) : (
        rows.slice(0, 6).map((record) => (
          <div key={record._id}>
            <strong>{record.student?.name || "Student"}</strong>
            <span>
              {record.studentProfile?.registrationNumber ||
                record.studentProfile?.studentId ||
                "Registration pending"}
            </span>
            <span>
              GPA {record.GPA} / {record.failedCourseCount} failed
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function PolicyEditor({ policy, setPolicy, saving, onSave, readOnly }) {
  const updateRule = (key, value) =>
    setPolicy((current) => ({
      ...current,
      promotionRules: {
        ...current.promotionRules,
        [key]: Number(value),
      },
    }));
  return (
    <Card>
      <div className="policy-heading">
        <div>
          <p className="demo-kicker">Institutional Policy Configuration</p>
          <h2>Demo Policy — configurable per institution</h2>
        </div>
        <span>{readOnly ? "Registrar view" : "Administrator edit access"}</span>
      </div>
      <p>
        This demonstration baseline is not a University of Juba policy.
        Grading and promotion rules are configured with each institution and
        captured as a result snapshot when marks are calculated.
      </p>
      <div className="responsive-table">
        <table>
          <thead>
            <tr>
              <th>Grade</th>
              <th>Minimum</th>
              <th>Maximum</th>
              <th>Point</th>
              <th>Pass</th>
            </tr>
          </thead>
          <tbody>
            {(policy.gradeBands || []).map((band, index) => (
              <tr key={`${band.grade}-${index}`}>
                {["grade", "minMark", "maxMark", "gradePoint"].map((field) => (
                  <td key={field}>
                    <input
                      disabled={readOnly}
                      onChange={(event) =>
                        setPolicy((current) => ({
                          ...current,
                          gradeBands: current.gradeBands.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  [field]:
                                    field === "grade"
                                      ? event.target.value
                                      : Number(event.target.value),
                                }
                              : item,
                          ),
                        }))
                      }
                      type={field === "grade" ? "text" : "number"}
                      value={band[field]}
                    />
                  </td>
                ))}
                <td>{band.isPass ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="policy-rule-grid">
        {Object.entries(policy.promotionRules || {}).map(([key, value]) => (
          <label key={key}>
            {formatLabel(key)}
            <input
              disabled={readOnly}
              onChange={(event) => updateRule(key, event.target.value)}
              step="0.01"
              type="number"
              value={value}
            />
          </label>
        ))}
      </div>
      {!readOnly && (
        <Button disabled={saving} onClick={onSave}>
          Save Policy
        </Button>
      )}
    </Card>
  );
}

function formatLabel(value = "") {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
