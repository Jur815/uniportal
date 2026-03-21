import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./features/auth/context/AuthContext";
import { useAuth } from "./features/auth/context/useAuth";

import LoginPage from "./features/auth/pages/LoginPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import CoursesPage from "./features/courses/pages/CoursesPage";
import MyCoursesPage from "./features/courses/pages/MyCoursesPage";
import StudentProfilePage from "./features/students/pages/StudentProfilePage";
import AdminEnrollmentsPage from "./features/enrollments/pages/AdminEnrollmentsPage";

import Loader from "./components/ui/Loader";
import Layout from "./components/layout/Layout";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <Loader text="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <Loader text="Loading..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Common */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<StudentProfilePage />} />

        {/* Student */}
        <Route
          path="courses"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <CoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="my-courses"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="admin/enrollments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminEnrollmentsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
