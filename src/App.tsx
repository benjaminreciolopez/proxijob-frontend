import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardCliente from "./pages/DashboardCliente";
import DashboardOferente from "./pages/DashboardOferente";
import Chat from "./Chat";
import { Toaster } from "react-hot-toast";
import EditarPerfil from "./components/oferente/EditarPerfil";

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard/cliente" element={<DashboardCliente />} />
        <Route path="/dashboard/oferente" element={<DashboardOferente />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
        {/* Puedes agregar más rutas aquí */}
      </Routes>
    </>
  );
};

export default App;
