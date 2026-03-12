import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ padding: "16px", borderBottom: "1px solid #ddd" }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/my-courses">My Courses</Link>
        <Link to="/profile">Profile</Link>

        {user?.role === "admin" && (
          <Link to="/admin/courses/new">Create Course</Link>
        )}

        <div style={{ marginLeft: "auto" }}>
          {user ? (
            <>
              <span style={{ marginRight: "12px" }}>
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
