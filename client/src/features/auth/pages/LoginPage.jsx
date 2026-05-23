import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!formData.email.trim()) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "Enter a valid email address";
    }
    if (!formData.password.trim()) return "Password is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img
            src="/branding/uniportal-logo.svg"
            alt="UniPortal"
            className="login-logo"
          />
          <p>Institutional Student Information System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={loading} className="btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
