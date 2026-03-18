import React from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const RutaProtegida: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAdminAuth();

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin" replace />;
};

export default RutaProtegida;
