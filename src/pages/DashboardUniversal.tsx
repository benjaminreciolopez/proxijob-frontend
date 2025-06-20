import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificacionFlotante from "../components/NotificacionFlotante";
import EditarPerfil from "../components/EditarPerfil";
import Documentos from "../components/Documentos";
import ZonasTrabajo from "../components/ZonasTrabajo";
import NuevaSolicitud from "../components/NuevaSolicitud";
import HistorialSolicitudes from "../components/HistorialSolicitudes";
import PostulacionesCliente from "../components/PostulacionesCliente";
import SolicitudesDisponibles from "../components/SolicitudesDisponibles";
import MisPostulaciones from "../components/MisPostulaciones";
import MisSolicitudesAceptadas from "../components/MisSolicitudesAceptadas";
import { AnimatePresence } from "framer-motion";
import "../styles/dashboard.css";

const SECTIONS = [
  { key: "perfil", label: "Perfil" },
  { key: "documentos", label: "Documentos" },
  { key: "zonas", label: "Zonas de trabajo" },
  { key: "nueva", label: "Nueva Solicitud" },
  { key: "historial", label: "Mis Solicitudes" },
  { key: "postulaciones", label: "Postulaciones Recibidas" },
  { key: "disponibles", label: "Solicitudes Disponibles" },
  { key: "mispostulaciones", label: "Mis Postulaciones" },
  { key: "aceptadas", label: "Aceptadas" },
];

const Dashboard = () => {
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const [actualizarHistorial, setActualizarHistorial] = useState(0);
  const [openTab, setOpenTab] = useState<string | null>(null);

  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const navigate = useNavigate();
  if (!usuario) {
    navigate("/login");
    return null;
  }

  // Función para alternar pestañas
  const handleTabClick = (key: string) => {
    setOpenTab((prev) => (prev === key ? null : key));
  };

  return (
    <main className="dashboard">
      <h2 style={{ textAlign: "center" }}>👤 {usuario.nombre}</h2>
      <div className="dashboard-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            className={openTab === s.key ? "active" : ""}
            onClick={() => handleTabClick(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {openTab === "perfil" && <EditarPerfil usuario={usuario} />}
        {openTab === "documentos" && <Documentos usuarioId={usuario.id} />}
        {openTab === "zonas" && <ZonasTrabajo usuarioId={usuario.id} />}
        {openTab === "nueva" && (
          <NuevaSolicitud
            usuarioId={usuario.id}
            nombre={usuario.nombre}
            setNotificacion={setNotificacion}
            setActualizarHistorial={setActualizarHistorial}
          />
        )}
        {openTab === "historial" && (
          <HistorialSolicitudes
            usuarioId={usuario.id}
            actualizar={actualizarHistorial}
          />
        )}
        {openTab === "postulaciones" && (
          <PostulacionesCliente usuarioId={usuario.id} />
        )}
        {openTab === "disponibles" && (
          <SolicitudesDisponibles usuarioId={usuario.id} />
        )}
        {openTab === "mispostulaciones" && (
          <MisPostulaciones usuarioId={usuario.id} />
        )}
        {openTab === "aceptadas" && (
          <MisSolicitudesAceptadas usuarioId={usuario.id} />
        )}
      </div>

      <AnimatePresence>
        {notificacion && (
          <NotificacionFlotante
            mensaje={notificacion}
            onClose={() => setNotificacion(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Dashboard;
