import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { getMyProfile, updateMyProfile } from "../../../api/profile.api";

export default function StudentProfilePage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!user) return;

      try {
        const response = await getMyProfile();
        const profile = response?.data?.profile;

        if (!isMounted) return;

        setFormData({
          name: profile?.name || user.name || "",
          email: profile?.email || user.email || "",
        });
      } catch (err) {
        if (!isMounted) return;

        setFormData({
          name: user.name || "",
          email: user.email || "",
        });
        setError(err?.response?.data?.message || "Failed to load profile");
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
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

      await updateMyProfile(formData);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
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
