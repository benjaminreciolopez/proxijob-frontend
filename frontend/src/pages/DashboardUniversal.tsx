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
import Card, { CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";

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
      <section key={key} className="mb-4">
        <h4 className="text-[1.07rem] mb-2 text-indigo font-bold tracking-tight">
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
  const [categoriasAbierto, setCategoriasAbierto] = useState(false);
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
    <main className="min-h-screen bg-gradient-to-br from-grey-50 to-[#e6e6fa] py-5">
      <Card className="w-full max-w-[600px] min-w-[340px] mx-auto mt-10 rounded-2xl shadow-lg px-4 pt-8 pb-6 transition-[max-width] duration-200
        max-sm:max-w-[98vw] max-sm:min-w-0 max-sm:px-[2vw] max-sm:py-3">
        {/* Panel usuario */}
        <div className="flex items-center gap-4 mb-2.5 max-sm:flex-col max-sm:gap-1.5">
          <img
            src={
              usuario.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${
                usuario.id || usuario.nombre
              }`
            }
            alt="avatar"
            className="w-[54px] h-[54px] rounded-full bg-grey-200 border-2 border-grey-200"
          />
          <div>
            <h2 className="text-xl font-black tracking-wide text-dark m-0 max-sm:text-lg">
              👋 ¡Bienvenido,{" "}
              <span className="text-navy">
                {usuario.nombre.split(" ")[0]}
              </span>
              !
            </h2>

            <p className="mt-0.5 text-grey-500 text-[1.06rem]">
              ¿Qué necesitas hoy? Publica, postula o consulta tu actividad.
            </p>
            {/* Resumen de solicitudes */}
            <div className="mt-2 font-semibold text-indigo text-[1.07rem]">
              📊{" "}
              <span>
                Tienes <b>{pendientes}</b> solicitudes pendientes y{" "}
                <b>{aceptadas}</b> aceptadas
              </span>
            </div>
            {/* Resumen de postulaciones recibidas */}
            <div className="font-medium text-navy text-[1.01rem] mt-0.5">
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
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="bg-navy hover:bg-[#4b48a3] rounded-2xl py-3 px-4 my-4 text-lg font-bold shadow-md"
          onClick={() => {
            const el = document.getElementById("solicitud-nueva-panel");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          📢 Publicar nueva solicitud
        </Button>

        {/* Panel perfil */}
        <div className="mt-3">
          {renderGroup(PERFIL_KEYS, renderSectionContent)}
        </div>

        {/* ---- NUEVA SOLICITUD FUERA DEL GRID ---- */}
        <div
          id="solicitud-nueva-panel"
          className="max-w-[530px] mx-auto mt-8 w-full"
        >
          {renderSectionContent("nueva")}
        </div>

        {/* ---- COLUMNA GRID SIN 'nueva' ---- */}
        <div className="flex gap-8 mt-10 max-sm:flex-col max-sm:gap-4
          min-[900px]:grid min-[900px]:grid-cols-2 min-[900px]:gap-10 min-[900px]:max-w-[1100px] min-[900px]:mx-auto min-[900px]:items-start">
          <Card className="flex-1 min-w-0 min-[900px]:min-h-[330px] min-[900px]:p-6 rounded-xl">
            {renderGroup(POSTULACIONES_KEYS, renderSectionContent)}
          </Card>
          <Card className="flex-1 min-w-0 min-[900px]:min-h-[330px] min-[900px]:p-6 rounded-xl">
            {/* SOLICITUDES (pero SIN la sección "nueva") */}
            {renderGroup(
              SOLICITUDES_KEYS.filter((k) => k !== "nueva"),
              renderSectionContent
            )}
          </Card>
        </div>

        <AnimatePresence>
          {notificacion && (
            <NotificacionFlotante
              mensaje={notificacion}
              onClose={() => setNotificacion(null)}
            />
          )}
        </AnimatePresence>
      </Card>
    </main>
  );
};

export default Dashboard;
