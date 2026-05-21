import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "../../features/auth/pages/LoginPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import CoursesPage from "../../features/courses/pages/CoursesPage";
import MyCoursesPage from "../../features/courses/pages/MyCoursesPage";
import CreateCoursePage from "../../features/courses/pages/CreateCoursePage";
import StudentProfilePage from "../../features/students/pages/StudentProfilePage";
import AdminEnrollmentsPage from "../../features/enrollments/pages/AdminEnrollmentsPage";
import EnrollmentDetailPage from "../../features/enrollments/pages/EnrollmentDetailPage";
import AcademicSetupPage from "../../features/admin/pages/AcademicSetupPage";
import AdminCourseManagementPage from "../../features/admin/pages/AdminCourseManagementPage";
import AdminCourseDetailPage from "../../features/admin/pages/AdminCourseDetailPage";
import AdminStudentsPage from "../../features/admin/pages/AdminStudentsPage";
import AcademicSessionsPage from "../../features/admin/pages/AcademicSessionsPage";

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
            element: <ProtectedRoute allowedRoles={["admin", "registrar"]} />,
            children: [
              {
                path: "admin/enrollments",
                element: <AdminEnrollmentsPage />,
              },
              {
                path: "admin/enrollments/:enrollmentId",
                element: <EnrollmentDetailPage />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["admin"]} />,
            children: [
              {
                path: "admin/students",
                element: <AdminStudentsPage />,
              },
              {
                path: "admin/academic-sessions",
                element: <AcademicSessionsPage />,
              },
              {
                path: "admin/academic-setup",
                element: <AcademicSetupPage />,
              },
              {
                path: "admin/courses",
                element: <AdminCourseManagementPage />,
              },
              {
                path: "admin/courses/:courseId",
                element: <AdminCourseDetailPage />,
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
