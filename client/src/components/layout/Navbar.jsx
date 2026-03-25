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
            UniPortal
          </Link>
        </div>

        {user && (
          <nav className="navbar-links">
            {user.role === "student" && (
              <>
                <Link to="/courses">Courses</Link>
                <Link to="/my-courses">My Courses</Link>
              </>
            )}

            {user.role === "admin" && (
              <>
                <Link to="/courses">Courses</Link>
                <Link to="/admin/enrollments">Enrollments</Link>
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
