import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user: contextUser, token: contextToken } = useAuth();
  
  const token = contextToken || getToken();
  let user = contextUser || getUser();

  console.log("[ProtectedRoute] Checking Auth -> Token:", token ? "PRESENT" : "MISSING", "User:", user ? user.phone || user.email : "MISSING");

  // Step 5 Requirement: If token exists but user is missing, restore user from localStorage
  if (token && !user) {
    user = getUser();
    console.log("[ProtectedRoute] Restored user object from localStorage:", user);
  }

  if (!token) {
    console.warn("[ProtectedRoute] Authentication failed (No token). Redirecting to login page.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;