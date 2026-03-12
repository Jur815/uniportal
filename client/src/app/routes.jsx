import React from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "./App";

import ProtectedRoute from "../components/layout/ProtectedRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import CoursesPage from "../features/courses/pages/CoursesPage";
import MyCoursesPage from "../features/courses/pages/MyCoursesPage";
import CreateCoursePage from "../features/courses/pages/CreateCoursePage";
import ProfilePage from "../features/profile/pages/ProfilePage";

const HomePage = () => <div>Welcome to UniPortal</div>;
const UnauthorizedPage = () => <div>Unauthorized</div>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "courses",
        element: (
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <CoursesPage />
          </ProtectedRoute>
        ),
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
        path: "profile",
        element: (
          <ProtectedRoute allowedRoles={["student", "admin"]}>
            <ProfilePage />
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
]);
