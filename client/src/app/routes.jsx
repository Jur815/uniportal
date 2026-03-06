import React from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "./App";
import LoginPage from "../features/auth/pages/LoginPage";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import { ROLES } from "../constants/roles";

import CoursesPage from "../features/courses/pages/CoursesPage";
import MyCoursesPage from "../features/courses/pages/MyCoursesPage";
import CreateCoursePage from "../features/courses/pages/CreateCoursePage";
import ProfilePage from "../features/profile/pages/ProfilePage";

const Unauthorized = () => <div className="page">Unauthorized</div>;
const Home = () => <div className="page">Welcome to UniPortal</div>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <LoginPage /> },
      { path: "unauthorized", element: <Unauthorized /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: "student/courses", element: <CoursesPage /> },
          { path: "student/my-courses", element: <MyCoursesPage /> },
          { path: "student/profile", element: <ProfilePage /> },
        ],
      },

      {
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
        children: [
          { path: "admin/courses", element: <CoursesPage /> },
          { path: "admin/courses/create", element: <CreateCoursePage /> },
        ],
      },
    ],
  },
]);
