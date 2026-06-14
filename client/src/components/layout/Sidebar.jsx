import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";
  const pilotDashboardByRole = {
    finance: "/finance/dashboard",
    lecturer: "/lecturer/dashboard",
    dean_hod: "/dean/dashboard",
  };
  const pilotDashboard = pilotDashboardByRole[user.role];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img
          src="/branding/uniportal-logo.svg"
          alt="UniPortal"
          className="sidebar-logo"
        />
        <h3 className="sidebar-title">Navigation</h3>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        <NavLink to={pilotDashboard || "/dashboard"} className={getNavLinkClass}>
          Dashboard
        </NavLink>

        {user.role === "student" && (
          <>
            <NavLink to="/courses" className={getNavLinkClass}>
              Courses
            </NavLink>

            <NavLink to="/my-courses" className={getNavLinkClass}>
              My Courses
            </NavLink>

            <NavLink to="/my-enrollments" className={getNavLinkClass}>
              Enrollment Slips
            </NavLink>

            <NavLink to="/my-academic-records" className={getNavLinkClass}>
              Academic Records
            </NavLink>
            <NavLink to="/my-results" className={getNavLinkClass}>
              Released Results
            </NavLink>

            <NavLink to="/my-complaints" className={getNavLinkClass}>
              My Complaints
            </NavLink>

            <NavLink to="/my-timetable" className={getNavLinkClass}>
              My Timetable
            </NavLink>

            <NavLink to="/my-exam-clearance" className={getNavLinkClass}>
              Exam Clearance
            </NavLink>

            <NavLink to="/profile" className={getNavLinkClass}>
              Profile
            </NavLink>
          </>
        )}

        {user.role === "admin" && (
          <>
            <NavLink to="/registrar/dashboard" className={getNavLinkClass}>
              Registrar Dashboard
            </NavLink>
            <NavLink to="/admin/academic-setup" className={getNavLinkClass}>
              Academic Setup
            </NavLink>
            <NavLink to="/admin/faculties" className={getNavLinkClass}>
              Faculties
            </NavLink>
            <NavLink to="/admin/departments" className={getNavLinkClass}>
              Departments
            </NavLink>
            <NavLink to="/admin/academic-sessions" className={getNavLinkClass}>
              Academic Sessions
            </NavLink>
            <NavLink to="/admin/courses" className={getNavLinkClass}>
              Manage Courses
            </NavLink>
            <NavLink to="/admin/students" className={getNavLinkClass}>
              Students
            </NavLink>
            <NavLink to="/admin/students/new" className={getNavLinkClass}>
              Create Student
            </NavLink>
            <NavLink to="/admin/academic-records" className={getNavLinkClass}>
              Academic Records
            </NavLink>
            <NavLink to="/examinations" className={getNavLinkClass}>
              Examinations & Progression
            </NavLink>
            <NavLink to="/admin/complaints" className={getNavLinkClass}>
              Complaints
            </NavLink>
            <NavLink to="/admin/timetable" className={getNavLinkClass}>
              Timetable Management
            </NavLink>
            <NavLink to="/admin/exam-clearance" className={getNavLinkClass}>
              Exam Clearance
            </NavLink>
            <NavLink to="/admin/demo-readiness" className={getNavLinkClass}>
              Demo Readiness
            </NavLink>
            <NavLink to="/admin/enrollments" className={getNavLinkClass}>
              Enrollments
            </NavLink>
            <NavLink to="/admin/courses/new" className={getNavLinkClass}>
              Create Course
            </NavLink>
          </>
        )}

        {user.role === "registrar" && (
          <>
            <NavLink to="/registrar/dashboard" className={getNavLinkClass}>
              Registrar Dashboard
            </NavLink>
            <NavLink to="/admin/enrollments" className={getNavLinkClass}>
              Enrollments
            </NavLink>
            <NavLink to="/admin/academic-records" className={getNavLinkClass}>
              Academic Records
            </NavLink>
            <NavLink to="/examinations" className={getNavLinkClass}>
              Examinations & Progression
            </NavLink>
            <NavLink to="/admin/complaints" className={getNavLinkClass}>
              Complaints
            </NavLink>
            <NavLink to="/admin/timetable" className={getNavLinkClass}>
              Timetable Management
            </NavLink>
            <NavLink to="/admin/exam-clearance" className={getNavLinkClass}>
              Exam Clearance
            </NavLink>
          </>
        )}

        {["lecturer", "dean_hod"].includes(user.role) && (
          <NavLink to="/examinations" className={getNavLinkClass}>
            Examinations & Progression
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
