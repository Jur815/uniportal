import { useState } from "react";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "Peter Jur",
    registrationNumber: "UNI-2026-001",
    department: "Computer Science",
    phone: "",
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
    console.log("Profile updated:", formData);
  };

  return (
    <div className="page">
      <h1>Student Profile</h1>

      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Full Name
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
        </label>

        <label>
          Registration Number
          <input
            type="text"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
          />
        </label>

        <label>
          Department
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
        </label>

        <label>
          Phone
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </label>

        <button type="submit" className="btn">
          Update Profile
        </button>
      </form>
    </div>
  );
}
