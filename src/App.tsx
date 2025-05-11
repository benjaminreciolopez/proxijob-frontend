import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import DashboardCliente from "./pages/DashboardCliente";
import DashboardOferente from "./pages/DashboardOferente";
import Chat from "./Chat";
import EditarPerfil from "./components/oferente/EditarPerfil";
import { Toaster } from "react-hot-toast";
import { supabase } from "./supabaseClient";

const App: React.FC = () => {
  const [permitido, setPermitido] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarAcceso = async () => {
      const modoMantenimiento =
        import.meta.env.VITE_MODO_MANTENIMIENTO === "true";
      const emailAdmin = import.meta.env.VITE_ADMIN_EMAIL;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (modoMantenimiento && user?.email !== emailAdmin) {
        setPermitido(false);
      } else {
        setPermitido(true);
      }
      setCargando(false);
    };

    verificarAcceso();
  }, []);

  if (cargando) return <p style={{ padding: "2rem" }}>Cargando...</p>;

  if (!permitido) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h1>🛠️ ProxiJob está en mantenimiento</h1>
        <p>Estamos haciendo mejoras. Vuelve a intentarlo más tarde.</p>
      </div>
    );
  }

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
      </Routes>
    </>
  );
};

export default App;
