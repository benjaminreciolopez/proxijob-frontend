import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardCliente from "./DashboardCliente";
import DashboardProfesional from "./DashboardProfesional";
import { Skeleton } from "../components/ui/Skeleton";

const Dashboard: React.FC = () => {
  const { usuario, isLoading, rol } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">
          <Skeleton lines={4} />
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rol === "profesional") {
    return <DashboardProfesional />;
  }

  // Default: cliente (or admin viewing as client)
  return <DashboardCliente />;
};

export default Dashboard;
