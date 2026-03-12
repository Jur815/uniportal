import React, { createContext, useContext, useState } from "react";
import { loginUser } from "../../../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const isAuthenticated = !!localStorage.getItem("token");
  const authLoading = false;

  const login = async (email, password) => {
    const data = await loginUser({ email, password });

    localStorage.setItem("token", data.token);
    setUser(data.data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
