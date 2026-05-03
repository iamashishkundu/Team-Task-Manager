import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ttm_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await api.get("/auth/me");
        if (isMounted) {
          setUser(response.data.user);
          localStorage.setItem("ttm_user", JSON.stringify(response.data.user));
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          localStorage.removeItem("ttm_user");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();

    const logoutHandler = () => {
      setUser(null);
      localStorage.removeItem("ttm_user");
      navigate("/login");
    };

    window.addEventListener("auth:logout", logoutHandler);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:logout", logoutHandler);
    };
  }, [navigate]);

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);
    setUser(response.data.user);
    localStorage.setItem("ttm_user", JSON.stringify(response.data.user));
    return response.data.user;
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    setUser(response.data.user);
    localStorage.setItem("ttm_user", JSON.stringify(response.data.user));
    return response.data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      localStorage.removeItem("ttm_user");
      navigate("/login");
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
