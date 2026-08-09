import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, getUser, saveAuth, logout as logoutStorage } from "../utils/auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());

  // Keep state in sync with localStorage on mount if missing
  useEffect(() => {
    if (!token) {
      const currentToken = getToken();
      if (currentToken) setToken(currentToken);
    }
    if (!user) {
      const currentUser = getUser();
      if (currentUser) setUser(currentUser);
    }
  }, []);

  const login = (newToken, newUser) => {
    console.log("[AuthContext] login() called with token & user");
    saveAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
    console.log("[AuthContext] Verified state token:", newToken, "user:", newUser);
  };

  const logout = () => {
    console.log("[AuthContext] logout() called");
    logoutStorage();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        setUser,
        setToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};