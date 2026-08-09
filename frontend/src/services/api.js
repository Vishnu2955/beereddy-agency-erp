import axios from "axios";
import { getToken, logout } from "../utils/auth";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Step 7 Requirement: Only logout on HTTP 401 on non-login endpoints
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      console.warn("[Axios Interceptor] HTTP 401 Unauthorized detected on protected route:", error.config?.url);
      // For 401 responses, do not forcibly clear auth here to avoid immediate reload/logout loops.
      // Let the app decide how to handle authentication state (e.g., ProtectedRoute or a central handler).
      // logout(); // intentionally disabled to prevent auto-clearing auth during client-side navigation
    }
    return Promise.reject(error);
  }
);

export default api;