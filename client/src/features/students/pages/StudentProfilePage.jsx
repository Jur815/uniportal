import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/context/useAuth";

export default function StudentProfilePage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // TODO: connect to API later
      console.log("Updating profile:", formData);

      // simulate success
      setTimeout(() => {
        setSuccess("Profile updated successfully");
        setLoading(false);
      }, 800);
    } catch (err) {
      setError("Failed to update profile");
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-6">Loading user...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      {/* STATUS */}
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded p-6 space-y-4"
      >
        {/* NAME */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* ROLE (READ ONLY) */}
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <input
            type="text"
            value={user.role}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
