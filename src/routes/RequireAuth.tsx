import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const loc = useLocation();
  if (!token) {
    return <Navigate to="/" replace state={{ from: loc }} />; // กลับหน้า Login
  }
  return <Outlet />;
}
