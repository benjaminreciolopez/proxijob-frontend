import React from "react";
import { useNavigate } from "react-router-dom";
import NuevaSolicitud from "../components/cliente/NuevaSolicitud";
import HistorialSolicitudes from "../components/cliente/HistorialSolicitudes";
import PostulacionesCliente from "../components/cliente/PostulacionesRecibidas";

interface Usuario {
  id: string;
  nombre: string;
}

const DashboardCliente: React.FC = () => {
  const navigate = useNavigate();

  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario: Usuario | null = usuarioGuardado
    ? JSON.parse(usuarioGuardado)
    : null;

  if (!usuario) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif", color: "red" }}>
        ❌ No se ha podido cargar tu usuario.
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>👤 {usuario.nombre}</h2>
      <p>Bienvenido. Desde aquí puedes gestionar tus solicitudes.</p>

      <div style={{ marginBottom: "2rem" }}>
        <NuevaSolicitud clienteId={usuario.id} nombre={usuario.nombre} />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <HistorialSolicitudes clienteId={usuario.id} />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <PostulacionesCliente clienteId={usuario.id} />
      </div>
    </div>
  );
};

export default DashboardCliente;
