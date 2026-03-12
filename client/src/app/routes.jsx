import React from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import CoursesPage from "../features/courses/pages/CoursesPage";
import MyCoursesPage from "../features/courses/pages/MyCoursesPage";
import CreateCoursePage from "../features/courses/pages/CreateCoursePage";
import StudentDashboardPage from "../features/dashboard/pages/StudentDashboardPage";
import AdminDashboardPage from "../features/dashboard/pages/AdminDashboardPage";
import { useAuth } from "../features/auth/context/AuthContext";

function DashboardHome() {
  const { user } = useAuth();
  return user?.role === "admin" ? (
    <AdminDashboardPage />
  ) : (
    <StudentDashboardPage />
  );
}

const UnauthorizedPage = () => <div>You do not have permission.</div>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        element: (
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardHome />,
          },
          {
            path: "courses",
            element: <CoursesPage />,
          },
          {
            path: "my-courses",
            element: (
              <ProtectedRoute allowedRoles={["student"]}>
                <MyCoursesPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin/courses/new",
            element: (
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateCoursePage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
]);
