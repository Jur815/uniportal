import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link to="/">Dashboard</Link>
        <Link to="/courses">Courses</Link>

        {user?.role === "student" && <Link to="/my-courses">My Courses</Link>}
        {user?.role === "admin" && (
          <Link to="/admin/courses/new">Create Course</Link>
        )}
      </nav>
    </aside>
  );
}
