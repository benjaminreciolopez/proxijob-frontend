import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificacionFlotante from "../components/NotificacionFlotante";
import NuevaSolicitud from "../components/NuevaSolicitud";
import HistorialSolicitudes from "../components/HistorialSolicitudes";
import PostulacionesCliente from "../components/PostulacionesCliente";
import SolicitudesDisponibles from "../components/SolicitudesDisponibles"; // Nuevo: muestra solicitudes cercanas
import MisPostulaciones from "../components/MisPostulaciones"; // Nuevo: tus postulaciones a solicitudes de otros
import MisSolicitudesAceptadas from "../components/MisSolicitudesAceptadas"; // Nuevo: solicitudes que te han aceptado
import Documentos from "../components/Documentos";
import ZonasTrabajo from "../components/ZonasTrabajo";
import EditarPerfil from "../components/EditarPerfil";
import { AnimatePresence } from "framer-motion";
import "../styles/dashboard.css";

interface Usuario {
  id: string;
  nombre: string;
  tratamiento: string;
}

const Dashboard: React.FC = () => {
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
        aquí puedes publicar solicitudes, postularte a trabajos, gestionar tus
        zonas y ver tu actividad.
      </p>

      {/* Sección de edición de perfil */}
      <EditarPerfil usuario={usuario} />

      {/* Documentos y zonas de trabajo */}
      <Documentos usuarioId={usuario.id} />
      <ZonasTrabajo usuarioId={usuario.id} />

      {/* Publicar nueva solicitud */}
      <div className="dashboard-section">
        <NuevaSolicitud
          usuarioId={usuario.id}
          nombre={usuario.nombre}
          setNotificacion={setNotificacion}
          setActualizarHistorial={setActualizarHistorial}
        />
      </div>

      {/* Historial de solicitudes publicadas */}
      <div className="dashboard-section">
        <HistorialSolicitudes
          usuarioId={usuario.id}
          actualizar={actualizarHistorial}
        />
      </div>

      {/* Postulaciones recibidas a mis solicitudes */}
      <div className="dashboard-section">
        <PostulacionesCliente usuarioId={usuario.id} />
      </div>

      {/* Solicitudes disponibles para postularme */}
      <div className="dashboard-section">
        <SolicitudesDisponibles usuarioId={usuario.id} />
      </div>

      {/* Mis postulaciones a solicitudes de otros */}
      <div className="dashboard-section">
        <MisPostulaciones usuarioId={usuario.id} />
      </div>

      {/* Solicitudes en las que fui aceptado */}
      <div className="dashboard-section">
        <MisSolicitudesAceptadas usuarioId={usuario.id} />
      </div>

      {/* Notificación flotante */}
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

export default Dashboard;
