import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "../../features/auth/pages/LoginPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import CoursesPage from "../../features/courses/pages/CoursesPage";
import MyCoursesPage from "../../features/courses/pages/MyCoursesPage";
import CreateCoursePage from "../../features/courses/pages/CreateCoursePage";
import StudentProfilePage from "../../features/students/pages/StudentProfilePage";
import AdminEnrollmentsPage from "../../features/enrollments/pages/AdminEnrollmentsPage";
import AcademicSetupPage from "../../features/admin/pages/AcademicSetupPage";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import DashboardLayout from "../../components/layout/DashboardLayout";

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            element: <ProtectedRoute allowedRoles={["student", "admin"]} />,
            children: [
              {
                path: "courses",
                element: <CoursesPage />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["student"]} />,
            children: [
              {
                path: "my-courses",
                element: <MyCoursesPage />,
              },
              {
                path: "profile",
                element: <StudentProfilePage />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin"]} />,
            children: [
              {
                path: "admin/enrollments",
                element: <AdminEnrollmentsPage />,
              },
              {
                path: "admin/academic-setup",
                element: <AcademicSetupPage />,
              },
              {
                path: "admin/courses/new",
                element: <CreateCoursePage />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
