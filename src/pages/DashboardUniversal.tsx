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
import { AnimatePresence, motion } from "framer-motion";
import "../styles/dashboard.css";

const SECTIONS = [
  { key: "perfil", label: "👤 Perfil" },
  { key: "documentos", label: "📄 Documentos" },
  { key: "zonas", label: "🗺️ Zonas de trabajo" },
  { key: "nueva", label: "📝 Nueva Solicitud" },
  { key: "historial", label: "📚 Mis Solicitudes" },
  { key: "postulaciones", label: "💬 Postulaciones Recibidas" },
  { key: "disponibles", label: "🔍 Solicitudes Disponibles" },
  { key: "mispostulaciones", label: "📨 Mis Postulaciones" },
  { key: "aceptadas", label: "✅ Aceptadas" },
];

const Dashboard = () => {
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const [actualizarHistorial, setActualizarHistorial] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  const navigate = useNavigate();
  if (!usuario) {
    navigate("/login");
    return null;
  }

  // Alternar acordeón
  const handleSectionClick = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  // Asocia cada sección con su componente
  const renderSectionContent = (key: string) => {
    switch (key) {
      case "perfil":
        return <EditarPerfil usuario={usuario} />;
      case "documentos":
        return <Documentos usuarioId={usuario.id} />;
      case "zonas":
        return <ZonasTrabajo usuarioId={usuario.id} />;
      case "nueva":
        return (
          <NuevaSolicitud
            usuarioId={usuario.id}
            nombre={usuario.nombre}
            setNotificacion={setNotificacion}
            setActualizarHistorial={setActualizarHistorial}
          />
        );
      case "historial":
        return (
          <HistorialSolicitudes
            usuarioId={usuario.id}
            actualizar={actualizarHistorial}
          />
        );
      case "postulaciones":
        return <PostulacionesCliente usuarioId={usuario.id} />;
      case "disponibles":
        return <SolicitudesDisponibles usuarioId={usuario.id} />;
      case "mispostulaciones":
        return <MisPostulaciones usuarioId={usuario.id} />;
      case "aceptadas":
        return <MisSolicitudesAceptadas usuarioId={usuario.id} />;
      default:
        return null;
    }
  };

  return (
    <main className="dashboard-bg">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <img
            src={
              usuario.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${
                usuario.id || usuario.nombre
              }`
            }
            alt="avatar"
            className="dashboard-avatar"
            style={{ width: 54, height: 54, border: "2px solid #ececec" }}
          />
          <div>
            <h2 className="dashboard-title">
              👋 ¡Bienvenido,{" "}
              <span style={{ color: "#2d3987" }}>
                {usuario.nombre.split(" ")[0]}
              </span>
              !
            </h2>
            <p className="dashboard-desc">
              ¿Qué necesitas hoy? Publica, postula o consulta tu actividad.
            </p>
            {/* Resumen rápido opcional */}
            <div
              style={{
                marginTop: "8px",
                fontWeight: 600,
                color: "#4f46e5",
                fontSize: "1.07rem",
              }}
            >
              {/* Puedes cambiar esto por props/datos reales */}
              📊 <span>Tienes 3 solicitudes pendientes y 2 aceptadas</span>
            </div>
          </div>
        </div>

        <button className="cta-btn" onClick={() => setOpenSection("nueva")}>
          📢 Publicar nueva solicitud
        </button>

        <div className="dashboard-accordion">
          {SECTIONS.map((section) => (
            <div key={section.key} className="accordion-item">
              <button
                className={`accordion-header${
                  openSection === section.key ? " open" : ""
                }`}
                onClick={() => handleSectionClick(section.key)}
                aria-expanded={openSection === section.key}
              >
                {section.label}
                <span className="accordion-arrow">
                  {openSection === section.key ? "▲" : "▼"}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openSection === section.key && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.26,
                      ease: [0.39, 0.575, 0.565, 1],
                    }}
                    className="accordion-content"
                  >
                    <div style={{ padding: "0.6rem 0.3rem" }}>
                      {renderSectionContent(section.key)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
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
    </main>
  );
};

export default Dashboard;
