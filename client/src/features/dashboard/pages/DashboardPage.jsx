import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboardKpis } from "../../../api/admin.api";
import { useAuth } from "../../auth/context/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [kpiError, setKpiError] = useState("");
  const isAdmin = user?.role === "admin";
  const isRegistrar = user?.role === "registrar";
  const isStudent = user?.role === "student";
  const enrollmentTotal = Number(kpis?.totalEnrollments || 0);
  const approvedTotal = Number(kpis?.approvedEnrollments || 0);
  const approvalRate =
    enrollmentTotal > 0 ? Math.round((approvedTotal / enrollmentTotal) * 100) : 0;

  useEffect(() => {
    if (!isAdmin && !isRegistrar) return;

    const loadKpis = async () => {
      try {
        const data = await getAdminDashboardKpis();
        setKpis(data?.data?.kpis || null);
      } catch (err) {
        setKpiError(
          err?.response?.data?.message || "Failed to load admin dashboard KPIs",
        );
      }
    };

    loadKpis();
  }, [isAdmin, isRegistrar]);

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <p className="demo-kicker">UniPortal Command Center</p>
          <h1>University Management System</h1>
          <p>
            Welcome, {user.name}. You are signed in as{" "}
            <strong className="capitalize">{user.role}</strong>.
          </p>
        </div>
        <div className="hero-actions">
          {isAdmin && (
            <Link className="btn btn-light" to="/admin/demo-readiness">
              Demo Command Center
            </Link>
          )}
          {isRegistrar && (
            <Link className="btn btn-light" to="/admin/enrollments">
              Review Enrollments
            </Link>
          )}
          {isStudent && (
            <Link className="btn btn-light" to="/courses">
              Start Registration
            </Link>
          )}
        </div>
      </div>

      {isStudent && (
        <>
          <div className="command-grid">
            <div className="command-card">
              <span>Registration</span>
              <h2>Browse Courses</h2>
              <p>View available courses for your program and semester.</p>
              <Link to="/courses">
                Go to Courses
              </Link>
            </div>

            <div className="command-card">
              <span>Student Record</span>
              <h2>My Courses</h2>
              <p>Check the courses you have already registered.</p>
              <Link to="/my-courses">
                View My Courses
              </Link>
            </div>

            <div className="command-card">
              <span>Identity</span>
              <h2>My Profile</h2>
              <p>Update your personal information and account details.</p>
              <Link to="/profile">
                Edit Profile
              </Link>
            </div>

            <div className="command-card">
              <span>Official Slip</span>
              <h2>Enrollment Slips</h2>
              <p>View registration requests and print approved enrollment slips.</p>
              <Link to="/my-enrollments">
                View Slips
              </Link>
            </div>

            <div className="command-card">
              <span>Results</span>
              <h2>Academic Records</h2>
              <p>View generated academic records, grades, GPA, and remarks.</p>
              <Link to="/my-academic-records">
                View Records
              </Link>
            </div>
          </div>

          <div className="insight-panel">
            <h2>Student Quick Summary</h2>
            <p>
              Use this dashboard to access course registration, review your
              enrolled courses, and keep your profile up to date.
            </p>
          </div>
        </>
      )}

      {(isAdmin || isRegistrar) && (
        <>
          {kpiError && <p className="error-text">{kpiError}</p>}

          <div className="dashboard-strip">
            <div>
              <span>Institutional Snapshot</span>
              <strong>
                {kpis?.activeAcademicSession
                  ? `${kpis.activeAcademicSession.academicYear} Semester ${kpis.activeAcademicSession.semester}`
                  : "No active session"}
              </strong>
            </div>
            <div>
              <span>Enrollment Status</span>
              <StatusBadge status={kpis?.enrollmentStatus || "closed"} />
            </div>
            <div>
              <span>Approval Rate</span>
              <strong>{approvalRate}%</strong>
            </div>
          </div>

          <div className="metric-grid">
            <DashboardMetric label="Students" value={kpis?.totalStudents} />
            <DashboardMetric label="Courses" value={kpis?.totalCourses} />
            <DashboardMetric label="Faculties" value={kpis?.totalFaculties} />
            <DashboardMetric
              label="Departments"
              value={kpis?.totalDepartments}
            />
            <DashboardMetric
              label="Total Enrollments"
              value={kpis?.totalEnrollments}
            />
            <DashboardMetric
              label="Pending Enrollments"
              value={kpis?.pendingEnrollments}
            />
            <DashboardMetric
              label="Approved Enrollments"
              value={kpis?.approvedEnrollments}
            />
            <DashboardMetric
              label="Rejected Enrollments"
              value={kpis?.rejectedEnrollments}
            />
            <DashboardMetric
              label="Returned"
              value={kpis?.correctionEnrollments}
            />
          </div>

          <div className="course-detail-grid">
            <div className="card">
              <h2>Active Academic Session</h2>
              {kpis?.activeAcademicSession ? (
                <div className="detail-list">
                  <p>
                    <strong>Academic Year:</strong>{" "}
                    {kpis.activeAcademicSession.academicYear}
                  </p>
                  <p>
                    <strong>Semester:</strong>{" "}
                    {kpis.activeAcademicSession.semester}
                  </p>
                  <p>
                    <strong>Enrollment:</strong>{" "}
                    <StatusBadge status={getEnrollmentStatus(kpis.activeAcademicSession)} />
                  </p>
                  {kpis.activeAcademicSession.notes && (
                    <p>
                      <strong>Notes:</strong> {kpis.activeAcademicSession.notes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="error-text">No active academic session configured.</p>
              )}
            </div>

            <div className="card">
              <h2>Academic Structure</h2>
              <div className="metric-grid">
                <DashboardMetric label="Programs" value={kpis?.totalPrograms} />
                <DashboardMetric label="Faculties" value={kpis?.totalFaculties} />
                <DashboardMetric
                  label="Departments"
                  value={kpis?.totalDepartments}
                />
              </div>
            </div>
          </div>

          <div className="command-grid">
            {isAdmin && (
              <div className="command-card">
                <span>Structure</span>
                <h2>Academic Setup</h2>
                <p>Manage faculties, departments, programs, and course structure.</p>
                <Link to="/admin/academic-setup">
                  Academic Setup
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="command-card">
                <span>Registry</span>
                <h2>Student Management</h2>
                <p>Review student profiles and manage account status.</p>
                <Link to="/admin/students">
                  View Students
                </Link>
              </div>
            )}

            <div className="command-card">
              <span>Registrar Queue</span>
              <h2>Enrollments</h2>
              <p>Review and manage student enrollment requests.</p>
              <Link to="/admin/enrollments">
                View Enrollments
              </Link>
            </div>

            {isAdmin && (
              <div className="command-card">
                <span>Calendar</span>
                <h2>Academic Sessions</h2>
                <p>Open and close registration windows.</p>
                <Link to="/admin/academic-sessions">
                  Manage Sessions
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="command-card command-card-highlight">
                <span>Presentation</span>
                <h2>Demo Command Center</h2>
                <p>Review completed modules, sample accounts, and demo steps.</p>
                <Link to="/admin/demo-readiness">
                  Open Demo Guide
                </Link>
              </div>
            )}
          </div>

          <div className="course-detail-grid">
            <RecentEnrollmentsTable
              enrollments={kpis?.recentActivity?.latestEnrollments || []}
            />
            <RecentList
              title="Recent Students"
              items={kpis?.recentActivity?.latestStudents || []}
              renderItem={(student) => (
                <>
                  <strong>{student.name}</strong>
                  <span>{student.email}</span>
                  <span>{student.status || "active"}</span>
                </>
              )}
            />
            <RecentList
              title="Recent Courses"
              items={kpis?.recentActivity?.latestCourses || []}
              renderItem={(course) => (
                <>
                  <strong>
                    {course.code} / {course.title}
                  </strong>
                  <span>
                    {course.departmentRef?.name || course.department || "No department"}
                  </span>
                  <span>
                    Semester {course.semester} / {course.creditHours} credits
                  </span>
                </>
              )}
            />
          </div>

          <div className="insight-panel">
            <h2>Institutional Operations Summary</h2>
            <p>
              Use this dashboard to manage courses, monitor enrollments, and
              oversee student academic operations.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardMetric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value ?? "..."}</strong>
    </div>
  );
}

function RecentEnrollmentsTable({ enrollments }) {
  return (
    <div className="card">
      <h2>Recent Enrollments</h2>
      {enrollments.length === 0 ? (
        <p>No enrollment activity yet.</p>
      ) : (
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Academic Year</th>
                <th>Semester</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => (
                <tr key={enrollment._id}>
                  <td>{enrollment.student?.name || "Unknown student"}</td>
                  <td>{enrollment.academicYear}</td>
                  <td>{enrollment.semester}</td>
                  <td>
                    <StatusBadge status={enrollment.status || "pending"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RecentList({ title, items, renderItem }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p>No recent records.</p>
      ) : (
        <div className="setup-list">
          {items.map((item) => (
            <div className="setup-list-item" key={item._id}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`review-status status-${status || "pending"}`}>
      {formatStatus(status || "pending")}
    </span>
  );
}

function getEnrollmentStatus(session) {
  return session.enrollmentStatus || (session.registrationOpen ? "open" : "closed");
}

function formatStatus(status = "pending") {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
