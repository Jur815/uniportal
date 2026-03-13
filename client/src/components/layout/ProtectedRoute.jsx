import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
