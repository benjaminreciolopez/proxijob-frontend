// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardCliente from "./pages/DashboardCliente";
import DashboardOferente from "./pages/DashboardOferente";
import Chat from "./Chat";
import { Toaster } from "react-hot-toast";
import EditarPerfil from "./components/oferente/EditarPerfil";
import AdminLogin from "./pages/AdminLogin"; // o la ruta correspondiente
import RutaProtegida from "./components/RutaProtegida";

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

        {/* Rutas protegidas por mantenimiento */}

        />
        <Route
          path="/dashboard/cliente"
          element={
            <RutasProtegidas>
              <DashboardCliente />
            </RutasProtegidas>
          }
        />
        <Route
          path="/dashboard/oferente"
          element={
            <RutasProtegidas>
              <DashboardOferente />
            </RutasProtegidas>
          }
        />
        <Route
          path="/chat"
          element={
            <RutasProtegidas>
              <Chat />
            </RutasProtegidas>
          }
        />
        <Route
          path="/editar-perfil"
          element={
            <RutasProtegidas>
              <EditarPerfil />
            </RutasProtegidas>
          }
        />
      </Routes>
    </>
  );
};

export default App;
