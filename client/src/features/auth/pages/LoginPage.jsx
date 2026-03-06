import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const fakeUser = {
      name: formData.role === "admin" ? "Admin User" : "Student User",
      email: formData.email,
      role: formData.role,
    };

    login(fakeUser);

    if (fakeUser.role === "admin") {
      navigate("/admin/courses");
    } else {
      navigate("/student/courses");
    }
  };

  return (
    <div className="page auth-page">
      <h1>Login</h1>

      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </label>

        <label>
          Role
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button type="submit" className="btn">
          Login
        </button>
      </form>
    </div>
  );
}
