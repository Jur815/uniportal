import React from "react";
import { useAuth } from "../../features/auth/context/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">UniPortal</div>

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
