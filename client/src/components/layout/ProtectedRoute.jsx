import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";
import Loader from "../ui/Loader";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <Loader text="Checking authentication..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
