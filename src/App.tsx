// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardUniversal from "./pages/DashboardUniversal";
import Chat from "./Chat";
import { Toaster } from "react-hot-toast";
import AdminLogin from "./pages/AdminLogin";
import RutaProtegida from "./components/RutaProtegida";
import CrearReseña from "./pages/CrearReseña";

const modoMantenimiento = import.meta.env.VITE_MODO_MANTENIMIENTO === "true";
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

function isAdmin(): boolean {
  const user = localStorage.getItem("usuario_admin");
  return user === adminEmail;
}

const RutasProtegidas: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (modoMantenimiento && !isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            modoMantenimiento ? (
              <RutaProtegida>
                <LandingPage />
              </RutaProtegida>
            ) : (
              <LandingPage />
            )
          }
        />
        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <RutasProtegidas>
              <DashboardUniversal />
            </RutasProtegidas>
          }
        />
        <Route
          path="/crear-reseña"
          element={
            modoMantenimiento && !isAdmin() ? (
              <Navigate to="/" replace />
            ) : (
              <CrearReseña />
            )
          }
        />
        <Route
          path="/chat"
          element={
            modoMantenimiento && !isAdmin() ? (
              <Navigate to="/" replace />
            ) : (
              <Chat />
            )
          }
        />
        {/* Redirección catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
