import React, { useEffect, useState } from "react";
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
import { supabase } from "../supabaseClient";
interface EditarPerfilProps {
  usuario: any; // Cambia esto por tu tipo real si lo tienes
}

  const EditarPerfil: React.FC<EditarPerfilProps> = ({ usuario }) => {
  const [categoriasAbierto, setCategoriasAbierto] = useState(false);
  const [listaCategorias, setListaCategorias] = useState<string[]>([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);

// Define los bloques
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

// Grupos para organización
const PERFIL_KEYS = ["perfil", "documentos", "zonas"];
const POSTULACIONES_KEYS = ["postulaciones", "mispostulaciones", "aceptadas"];
const SOLICITUDES_KEYS = ["nueva", "historial", "disponibles"];

function renderGroup(
  keys: string[],
  renderSectionContent: (key: string) => React.ReactNode
) {
  return keys.map((key: string) => {
    const section = SECTIONS.find((sec) => sec.key === key);
    if (!section) return null;
    return (
      <section key={key} style={{ marginBottom: 18 }}>
        <h4
          style={{
            fontSize: "1.07rem",
            margin: "0 0 0.45rem 0",
            color: "#4f46e5",
            fontWeight: 700,
            letterSpacing: ".01em",
          }}
        >
          {section.label}
        </h4>
        {renderSectionContent(key)}
      </section>
    );
  });
}

const Dashboard = () => {
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const [actualizarHistorial, setActualizarHistorial] = useState(0);
  const [solicitudes, setSolicitudes] = useState<any[]>([]); // Cambia any por tu tipo si lo tienes
  const usuarioGuardado = localStorage.getItem("usuario");
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
  const aceptadas = solicitudes.filter((s) => s.estado === "aceptada").length;
  const rechazada = solicitudes.filter((s) => s.estado === "rechazada").length;
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
 

  const navigate = useNavigate();
  if (!usuario) {
    navigate("/login");
    return null;
  }
useEffect(() => {
    const cargarCategorias = async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("nombre")
        .order("nombre", { ascending: true });

      if (!error && data) {
        setListaCategorias(data.map((c: any) => c.nombre));
      }
    };
    cargarCategorias();
  }, []);

   useEffect(() => {
    // Ejemplo: usuario.categoriasSeleccionadas
    if (usuario?.categoriasSeleccionadas) {
      setCategoriasSeleccionadas(usuario.categoriasSeleccionadas);
    }
  }, [usuario]);
  
  const handleCategoria = (cat: string) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

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
      case "postulaciones":
        return (
          <PostulacionesCliente
            usuarioId={usuario.id}
            onData={setPostulaciones} // <- Así capturas los datos
          />
        );
      case "historial":
        return (
          <HistorialSolicitudes
            usuarioId={usuario.id}
            actualizar={actualizarHistorial}
            onData={setSolicitudes}
          />
        );
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
      <div className="dashboard-card dashboard-card-wide">
        {/* Panel usuario */}
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
            <div style={{ marginTop: 24 }}>
              <div
                onClick={() => setCategoriasAbierto((abierto) => !abierto)}
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  userSelect: "none",
                  marginBottom: categoriasAbierto ? 8 : 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: 6 }}>
                  {categoriasAbierto ? "▼" : "▶"}
                </span>
                Categorías seleccionadas
              </div>
              {categoriasAbierto && (
                <div
                  style={{ maxHeight: 340, overflowY: "auto", paddingLeft: 6 }}
                >
                  {/* aquí va el listado de tus categorías con checkboxes */}
                  {listaCategorias.map((cat) => (
                    <div key={cat}>
                      <label>
                        <input
                          type="checkbox"
                          checked={categoriasSeleccionadas.includes(cat)}
                          onChange={() => handleCategoria(cat)}
                        />
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="dashboard-desc">
              ¿Qué necesitas hoy? Publica, postula o consulta tu actividad.
            </p>
            {/* Resumen de solicitudes */}
            <div
              style={{
                marginTop: "8px",
                fontWeight: 600,
                color: "#4f46e5",
                fontSize: "1.07rem",
              }}
            >
              📊{" "}
              <span>
                Tienes <b>{pendientes}</b> solicitudes pendientes y{" "}
                <b>{aceptadas}</b> aceptadas
              </span>
            </div>
            {/* Resumen de postulaciones recibidas */}
            <div
              style={{
                fontWeight: 500,
                color: "#2d3987",
                fontSize: "1.01rem",
                marginTop: "2px",
              }}
            >
              💬{" "}
              <span>
                Postulaciones recibidas:&nbsp;
                <b>
                  {postulaciones.filter((p) => p.estado === "pendiente").length}
                </b>{" "}
                pendientes,&nbsp;
                <b>
                  {postulaciones.filter((p) => p.estado === "aceptado").length}
                </b>{" "}
                aceptadas,&nbsp;
                <b>
                  {postulaciones.filter((p) => p.estado === "rechazado").length}
                </b>{" "}
                rechazadas
              </span>
            </div>
          </div>
        </div>

        {/* CTA rápida */}
        <button
          className="cta-btn"
          onClick={() => {
            const el = document.getElementById("solicitud-nueva-panel");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          📢 Publicar nueva solicitud
        </button>

        {/* Panel perfil */}
        <div className="dashboard-perfil-panel">
          {renderGroup(PERFIL_KEYS, renderSectionContent)}
        </div>

        {/* Layout columnas para escritorio */}
        <div className="dashboard-columns">
          <div className="dashboard-col">
            {/* POSTULACIONES */}
            {renderGroup(POSTULACIONES_KEYS, renderSectionContent)}
          </div>
          <div className="dashboard-col">
            {/* SOLICITUDES */}
            <div id="solicitud-nueva-panel">
              {renderGroup(SOLICITUDES_KEYS, renderSectionContent)}
            </div>
          </div>
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
