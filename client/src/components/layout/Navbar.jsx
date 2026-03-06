import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/store/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link to="/">UniPortal</Link>
      </div>

      <div className="navbar__links">
        {!user && <Link to="/login">Login</Link>}

        {user?.role === "student" && (
          <>
            <Link to="/student/courses">Courses</Link>
            <Link to="/student/my-courses">My Courses</Link>
            <Link to="/student/profile">Profile</Link>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <Link to="/admin/courses">Courses</Link>
            <Link to="/admin/courses/create">Create Course</Link>
          </>
        )}

        {user && (
          <button onClick={logout} className="btn btn-danger">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
