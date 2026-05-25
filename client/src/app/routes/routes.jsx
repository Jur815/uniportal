import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginPage from "../../features/auth/pages/LoginPage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import RegistrarDashboardPage from "../../features/dashboard/pages/RegistrarDashboardPage";
import InstitutionalRoleDashboardPage from "../../features/dashboard/pages/InstitutionalRoleDashboardPage";
import CoursesPage from "../../features/courses/pages/CoursesPage";
import MyCoursesPage from "../../features/courses/pages/MyCoursesPage";
import CreateCoursePage from "../../features/courses/pages/CreateCoursePage";
import StudentProfilePage from "../../features/students/pages/StudentProfilePage";
import AdminEnrollmentsPage from "../../features/enrollments/pages/AdminEnrollmentsPage";
import EnrollmentDetailPage from "../../features/enrollments/pages/EnrollmentDetailPage";
import MyEnrollmentsPage from "../../features/enrollments/pages/MyEnrollmentsPage";
import EnrollmentSlipPage from "../../features/enrollments/pages/EnrollmentSlipPage";
import MyAcademicRecordsPage from "../../features/enrollments/pages/MyAcademicRecordsPage";
import MyComplaintsPage from "../../features/complaints/pages/MyComplaintsPage";
import AdminComplaintsPage from "../../features/complaints/pages/AdminComplaintsPage";
import MyTimetablePage from "../../features/timetable/pages/MyTimetablePage";
import AdminTimetablePage from "../../features/timetable/pages/AdminTimetablePage";
import MyExamClearancePage from "../../features/exams/pages/MyExamClearancePage";
import AdminExamClearancePage from "../../features/exams/pages/AdminExamClearancePage";
import AcademicSetupPage from "../../features/admin/pages/AcademicSetupPage";
import AdminCourseManagementPage from "../../features/admin/pages/AdminCourseManagementPage";
import AdminCourseDetailPage from "../../features/admin/pages/AdminCourseDetailPage";
import CreateStudentPage from "../../features/admin/pages/CreateStudentPage";
import AdminStudentsPage from "../../features/admin/pages/AdminStudentsPage";
import AdminAcademicRecordsPage from "../../features/admin/pages/AdminAcademicRecordsPage";
import AdminDemoReadinessPage from "../../features/admin/pages/AdminDemoReadinessPage";
import AcademicSessionsPage from "../../features/admin/pages/AcademicSessionsPage";
import AdminFacultiesPage from "../../features/admin/pages/AdminFacultiesPage";
import AdminDepartmentsPage from "../../features/admin/pages/AdminDepartmentsPage";

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
                path: "my-enrollments",
                element: <MyEnrollmentsPage />,
              },
              {
                path: "my-enrollments/:enrollmentId",
                element: <EnrollmentSlipPage />,
              },
              {
                path: "my-academic-records",
                element: <MyAcademicRecordsPage />,
              },
              {
                path: "my-complaints",
                element: <MyComplaintsPage />,
              },
              {
                path: "my-timetable",
                element: <MyTimetablePage />,
              },
              {
                path: "my-exam-clearance",
                element: <MyExamClearancePage />,
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
                path: "registrar/dashboard",
                element: <RegistrarDashboardPage />,
              },
              {
                path: "admin/enrollments",
                element: <AdminEnrollmentsPage />,
              },
              {
                path: "admin/enrollments/:enrollmentId",
                element: <EnrollmentDetailPage />,
              },
              {
                path: "admin/academic-records",
                element: <AdminAcademicRecordsPage />,
              },
              {
                path: "admin/complaints",
                element: <AdminComplaintsPage />,
              },
              {
                path: "admin/timetable",
                element: <AdminTimetablePage />,
              },
              {
                path: "admin/exam-clearance",
                element: <AdminExamClearancePage />,
              },
              {
                path: "admin/students/:studentId/academic-records",
                element: <AdminAcademicRecordsPage />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["finance"]} />,
            children: [
              {
                path: "finance/dashboard",
                element: <InstitutionalRoleDashboardPage role="finance" />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["lecturer"]} />,
            children: [
              {
                path: "lecturer/dashboard",
                element: <InstitutionalRoleDashboardPage role="lecturer" />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["dean_hod"]} />,
            children: [
              {
                path: "dean/dashboard",
                element: <InstitutionalRoleDashboardPage role="dean_hod" />,
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
                path: "admin/students/new",
                element: <CreateStudentPage />,
              },
              {
                path: "admin/demo-readiness",
                element: <AdminDemoReadinessPage />,
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
                path: "admin/faculties",
                element: <AdminFacultiesPage />,
              },
              {
                path: "admin/departments",
                element: <AdminDepartmentsPage />,
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
