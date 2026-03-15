import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyProfile, updateMyProfile } from "../../../api/profile.api";
import Loader from "../../../components/ui/Loader";
import PageHeader from "../../../components/ui/PageHeader";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        const profile = data.data.profile;

        setFormData({
          phone: profile?.phone || "",
          address: profile?.address || "",
          dateOfBirth: profile?.dateOfBirth?.split("T")[0] || "",
          gender: profile?.gender || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    if (!formData.phone.trim()) return "Phone is required";
    if (!formData.address.trim()) return "Address is required";
    if (formData.phone.length < 7) return "Enter a valid phone number";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateMyProfile(formData);
      setMessage("Profile updated successfully");
      toast.success("Profile updated successfully");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading profile..." />;

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="View and update your profile information."
      />

      <Card>
        <form className="form" onSubmit={handleSubmit}>
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />

          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />

          <input
            name="gender"
            placeholder="Gender"
            value={formData.gender}
            onChange={handleChange}
          />

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Update Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
