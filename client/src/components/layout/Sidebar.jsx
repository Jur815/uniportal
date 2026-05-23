import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Navigation</h3>
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar navigation">
        <NavLink to="/dashboard" className={getNavLinkClass}>
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
          </>
        )}
      </nav>
    </aside>
  );
}
