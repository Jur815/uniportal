import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { getMyProfile, updateMyProfile } from "../../../api/profile.api";
import PageHeader from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const initialProfile = {
  studentId: "",
  faculty: "",
  department: "",
  program: "",
  level: "1",
  phone: "",
};

export default function StudentProfilePage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState(initialProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const response = await getMyProfile();
        const profile = response?.data?.profile;

        if (!isMounted) return;

        setFormData({
          studentId: profile?.studentId || "",
          faculty: profile?.faculty || "",
          department: profile?.department || "",
          program: profile?.program || "",
          level: String(profile?.level || 1),
          phone: profile?.phone || "",
        });
      } catch (err) {
        if (!isMounted) return;

        setFormData(initialProfile);
        setError(err?.response?.data?.message || "Failed to load profile");
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
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

      await updateMyProfile({
        ...formData,
        level: Number(formData.level),
      });
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

  if (profileLoading) {
    return <div className="loader">Loading profile...</div>;
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Keep your academic profile ready for course registration."
      />

      {success && (
        <p className="success-text" role="status">
          {success}
        </p>
      )}

      {error && <p className="error-text">{error}</p>}

      <Card>
        <div className="profile-summary">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <input
            name="studentId"
            placeholder="Student ID / Matric number"
            value={formData.studentId}
            onChange={handleChange}
          />
          <input
            name="faculty"
            placeholder="Faculty"
            value={formData.faculty}
            onChange={handleChange}
          />
          <input
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
          />
          <input
            name="program"
            placeholder="Program"
            value={formData.program}
            onChange={handleChange}
          />
          <input
            name="level"
            type="number"
            min="1"
            max="6"
            placeholder="Level"
            value={formData.level}
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
