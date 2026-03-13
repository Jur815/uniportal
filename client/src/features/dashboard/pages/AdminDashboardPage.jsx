import React from "react";
import { useAuth } from "../../auth/context/useAuth";
import Card from "../../../components/ui/Card";
import PageHeader from "../../../components/ui/PageHeader";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name || "Admin"}`}
        subtitle="Manage courses and monitor the system."
      />

      <div className="grid">
        <Card>
          <h3>Create Course</h3>
          <p>Add a new course to the catalog.</p>
        </Card>

        <Card>
          <h3>View Courses</h3>
          <p>See all courses available in UniPortal.</p>
        </Card>
      </div>
    </div>
  );
}
