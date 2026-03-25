import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";
import Loader from "../../components/ui/Loader";

export default function ProtectedRoute({ allowedRoles = [] }) {
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

  return <Outlet />;
}
