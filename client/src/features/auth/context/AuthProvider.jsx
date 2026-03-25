import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getMe } from "../../../api/auth.api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const data = await getMe();
        setUser(data?.data?.user || data?.user || null);
      } catch (error) {
        console.error("Auth bootstrap failed:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = (payload) => {
    const token = payload?.token;
    const loggedInUser = payload?.data?.user || payload?.user || null;

    if (token) {
      localStorage.setItem("token", token);
    }

    setUser(loggedInUser || null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      authLoading,
      isAuthenticated,
      login,
      logout,
    }),
    [user, authLoading, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
