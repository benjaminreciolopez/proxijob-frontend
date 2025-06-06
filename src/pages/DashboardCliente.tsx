import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NuevaSolicitud from "../components/cliente/NuevaSolicitud";
import HistorialSolicitudes from "../components/cliente/HistorialSolicitudes";
import PostulacionesCliente from "../components/cliente/PostulacionesCliente";
import NotificacionFlotante from "../components/NotificacionFlotante"; // arriba del todo
import { AnimatePresence } from "framer-motion"; // también
import "../styles/dashboard.css";

interface Usuario {
  id: string;
  nombre: string;
  tratamiento: string;
}

const DashboardCliente: React.FC = () => {
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const [actualizarHistorial, setActualizarHistorial] = useState(0);

  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario: Usuario | null = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  if (!usuario) {
    return (
      <div className="dashboard">❌ No se ha podido cargar tu usuario.</div>
    );
  }

  return (
    <div
      className="dashboard"
      style={{ width: "100%", boxSizing: "border-box" }}
    >
      <h2 style={{ textAlign: "center" }}>👤 {usuario.nombre}</h2>
      <p style={{ textAlign: "center" }}>
        {usuario.tratamiento === "Sra" ? "Bienvenida" : "Bienvenido"}. Desde
        aquí puedes gestionar tus solicitudes.
      </p>

      <div className="dashboard-section">
        <NuevaSolicitud
          clienteId={usuario.id}
          nombre={usuario.nombre}
          setNotificacion={setNotificacion}
          setActualizarHistorial={setActualizarHistorial}
        />
      </div>

      <div className="dashboard-section">
        <HistorialSolicitudes
          clienteId={usuario.id}
          actualizar={actualizarHistorial}
        />
      </div>

      <div className="dashboard-section">
        <PostulacionesCliente clienteId={usuario.id} />
      </div>

      <AnimatePresence>
        {notificacion && (
          <NotificacionFlotante
            mensaje={notificacion}
            onClose={() => setNotificacion(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardCliente;
