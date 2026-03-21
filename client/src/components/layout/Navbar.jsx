import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <div className="navbar-brand">UniPortal</div>

        {user && (
          <nav className="navbar-links">
            {/* STUDENT */}
            {user.role === "student" && (
              <>
                <Link to="/courses">Courses</Link>
                <Link to="/my-courses">My Courses</Link>
              </>
            )}

            {/* ADMIN */}
            {user.role === "admin" && (
              <>
                <Link to="/courses">Courses</Link>
                <Link to="/create-course">Create Course</Link>
              </>
            )}
          </nav>
        )}
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        <span className="navbar-user">
          {user ? `${user.name} (${user.role})` : "Guest"}
        </span>

        {user && (
          <button className="btn btn-outline" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
