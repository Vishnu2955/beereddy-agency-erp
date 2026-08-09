import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user: contextUser, token: contextToken } = useAuth();

  const token = contextToken || getToken();
  let user = contextUser || getUser();

  console.log(
    "[ProtectedRoute] Checking Auth -> Token:",
    token ? "PRESENT" : "MISSING",
    "User:",
    user ? user.phone || user.email : "MISSING"
  );

  // Restore user object from localStorage if needed
  if (token && !user) {
    user = getUser();
    console.log("[ProtectedRoute] Restored user object from localStorage:", user);
  }

  if (!token) {
    console.warn("[ProtectedRoute] Authentication failed (No token). Redirecting to login page.");
    return <Navigate to="/" replace />;
  }

  // Render nested routes via Outlet so Router controls child mounting
  return <Outlet />;
};

export default ProtectedRoute;