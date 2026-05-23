import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">
          <Link to={user ? "/dashboard" : "/"} className="navbar-brand-text">
            <img
              src="/branding/uniportal-mark.svg"
              alt=""
              className="navbar-logo-mark"
            />
            <span>UniPortal</span>
          </Link>
          <span className="navbar-brand-subtitle">
            Institutional Student Information System
          </span>
        </div>

        {user && (
          <nav className="navbar-links">
            {user.role === "student" && (
              <>
                <Link to="/courses">Courses</Link>
                <Link to="/my-courses">My Courses</Link>
                <Link to="/my-enrollments">Enrollment Slips</Link>
                <Link to="/my-academic-records">Academic Records</Link>
              </>
            )}

            {user.role === "admin" && (
              <>
                <Link to="/registrar/dashboard">Registrar Dashboard</Link>
                <Link to="/admin/academic-setup">Academic Setup</Link>
                <Link to="/admin/faculties">Faculties</Link>
                <Link to="/admin/departments">Departments</Link>
                <Link to="/admin/academic-sessions">Sessions</Link>
                <Link to="/admin/courses">Manage Courses</Link>
                <Link to="/admin/students">Students</Link>
                <Link to="/admin/students/new">Create Student</Link>
                <Link to="/admin/academic-records">Records</Link>
                <Link to="/admin/demo-readiness">Demo Readiness</Link>
                <Link to="/admin/courses/new">Create Course</Link>
                <Link to="/admin/enrollments">Enrollments</Link>
              </>
            )}

            {user.role === "registrar" && (
              <>
                <Link to="/registrar/dashboard">Registrar Dashboard</Link>
                <Link to="/admin/enrollments">Enrollments</Link>
                <Link to="/admin/academic-records">Records</Link>
              </>
            )}
          </nav>
        )} 
      </div>

      <div className="navbar-right">
        <div className="navbar-user-block">
          <span className="navbar-user-name">{user?.name || "Guest"}</span>
          <span className="navbar-user-role">
            {user?.role ? user.role.toUpperCase() : "NOT SIGNED IN"}
          </span>
        </div>

        {user && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
