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

        <NavLink to="/courses" className={getNavLinkClass}>
          Courses
        </NavLink>

        {user.role === "student" && (
          <>
            <NavLink to="/my-courses" className={getNavLinkClass}>
              My Courses
            </NavLink>

            <NavLink to="/profile" className={getNavLinkClass}>
              Profile
            </NavLink>
          </>
        )}

        {user.role === "admin" && (
          <>
            <NavLink to="/admin/enrollments" className={getNavLinkClass}>
              Enrollments
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
