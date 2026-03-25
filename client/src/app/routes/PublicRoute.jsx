import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/context/useAuth";
import Loader from "../../components/ui/Loader";

export default function PublicRoute() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <Loader text="Loading..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
