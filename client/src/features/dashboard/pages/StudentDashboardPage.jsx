import React from "react";
import { useAuth } from "../../auth/context/AuthContext";
import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name || "Student"}`}
        subtitle="Manage your courses and track your learning."
      />

      <div className="grid">
        <Card>
          <h3>Browse Courses</h3>
          <p>View available courses and enroll.</p>
        </Card>

        <Card>
          <h3>My Courses</h3>
          <p>Check the courses you have already enrolled in.</p>
        </Card>
      </div>
    </div>
  );
}
