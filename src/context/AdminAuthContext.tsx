// src/context/AdminAuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const adminStored = localStorage.getItem("usuario_admin");
    const emailValido = adminStored === import.meta.env.VITE_ADMIN_EMAIL;
    setIsAuthenticated(emailValido);
  }, []);

  const login = (email: string, password: string) => {
    if (
      email === import.meta.env.VITE_ADMIN_EMAIL &&
      password === import.meta.env.VITE_ADMIN_CLAVE
    ) {
      localStorage.setItem("usuario_admin", email);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("usuario_admin");
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth debe usarse dentro de AdminAuthProvider");
  }
  return context;
};

export default AdminAuthProvider;
