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
    <div className="p-6 space-y-6">
      <div className="bg-white shadow rounded-xl p-6 border">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Role: <span className="font-medium capitalize">{user.role}</span>
        </p>
        <p className="text-gray-600">
          Email: <span className="font-medium">{user.email}</span>
        </p>
      </div>

      {isStudent && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                Browse Courses
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                View available courses for your program and semester.
              </p>
              <Link
                to="/courses"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                Go to Courses
              </Link>
            </div>

            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                My Courses
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Check the courses you have already registered.
              </p>
              <Link
                to="/my-courses"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                View My Courses
              </Link>
            </div>

            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                My Profile
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Update your personal information and account details.
              </p>
              <Link
                to="/profile"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                Edit Profile
              </Link>
            </div>

            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                Enrollment Slips
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                View registration requests and print approved enrollment slips.
              </p>
              <Link
                to="/my-enrollments"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                View Slips
              </Link>
            </div>

            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                Academic Records
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                View generated academic records, grades, GPA, and remarks.
              </p>
              <Link
                to="/my-academic-records"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                View Records
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-blue-900">
              Student Quick Summary
            </h2>
            <p className="text-sm text-blue-800 mt-2">
              Use this dashboard to access course registration, review your
              enrolled courses, and keep your profile up to date.
            </p>
          </div>
        </>
      )}

      {(isAdmin || isRegistrar) && (
        <>
          {kpiError && <p className="error-text">{kpiError}</p>}

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

          <div className="grid md:grid-cols-3 gap-4">
            {isAdmin && (
              <div className="bg-white shadow rounded-xl p-5 border">
                <h2 className="text-lg font-semibold text-gray-800">
                  Academic Setup
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Manage faculties, departments, programs, and course structure.
                </p>
                <Link
                  to="/admin/academic-setup"
                  className="inline-block mt-4 text-blue-600 font-medium hover:underline"
                >
                  Academic Setup
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="bg-white shadow rounded-xl p-5 border">
                <h2 className="text-lg font-semibold text-gray-800">
                  Student Management
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Review student profiles and manage account status.
                </p>
                <Link
                  to="/admin/students"
                  className="inline-block mt-4 text-blue-600 font-medium hover:underline"
                >
                  View Students
                </Link>
              </div>
            )}

            <div className="bg-white shadow rounded-xl p-5 border">
              <h2 className="text-lg font-semibold text-gray-800">
                Enrollments
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Review and manage student enrollment requests.
              </p>
              <Link
                to="/admin/enrollments"
                className="inline-block mt-4 text-blue-600 font-medium hover:underline"
              >
                View Enrollments
              </Link>
            </div>

            {isAdmin && (
              <div className="bg-white shadow rounded-xl p-5 border">
                <h2 className="text-lg font-semibold text-gray-800">
                  Academic Sessions
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Open and close registration windows.
                </p>
                <Link
                  to="/admin/academic-sessions"
                  className="inline-block mt-4 text-blue-600 font-medium hover:underline"
                >
                  Manage Sessions
                </Link>
              </div>
            )}

            {isAdmin && (
              <div className="bg-white shadow rounded-xl p-5 border">
                <h2 className="text-lg font-semibold text-gray-800">
                  Demo Readiness
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Review completed modules, sample accounts, and demo steps.
                </p>
                <Link
                  to="/admin/demo-readiness"
                  className="inline-block mt-4 text-blue-600 font-medium hover:underline"
                >
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

          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-green-900">
              Admin Quick Summary
            </h2>
            <p className="text-sm text-green-800 mt-2">
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
