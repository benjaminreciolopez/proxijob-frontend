import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import DashboardLayout, {
  Home,
  PlusCircle,
  ClipboardList,
  Inbox,
  User,
} from "../components/layout/DashboardLayout";
import type { NavItem } from "../components/layout/DashboardLayout";
import NuevaSolicitud from "../components/NuevaSolicitud";
import HistorialSolicitudes from "../components/HistorialSolicitudes";
import PostulacionesCliente from "../components/PostulacionesCliente";
import EditarPerfil from "../components/EditarPerfil";
import NotificacionFlotante from "../components/NotificacionFlotante";
import { AnimatePresence } from "framer-motion";

const DashboardCliente: React.FC = () => {
  const { t } = useTranslation();
  const { usuario } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const [actualizarHistorial, setActualizarHistorial] = useState(0);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [postulaciones, setPostulaciones] = useState<any[]>([]);

  if (!usuario) return null;

  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
  const aceptadas = solicitudes.filter((s) => s.estado === "aceptada").length;
  const propuestasRecibidas = postulaciones.filter((p) => p.estado === "pendiente").length;

  const navItems: NavItem[] = [
    { key: "home", label: t("dashboard.home"), icon: <Home className="w-4 h-4" /> },
    { key: "nueva", label: t("dashboard.newRequest"), icon: <PlusCircle className="w-4 h-4" /> },
    { key: "historial", label: t("dashboard.myRequests"), icon: <ClipboardList className="w-4 h-4" /> },
    { key: "propuestas", label: t("dashboard.proposalsReceived"), icon: <Inbox className="w-4 h-4" /> },
    { key: "perfil", label: t("dashboard.profile"), icon: <User className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {t("dashboard.welcomeClient", { name: usuario.nombre.split(" ")[0] })}
              </h1>
              <p className="text-gray-500">
                {t("dashboard.clientSummary", { pending: pendientes, accepted: aceptadas })}
              </p>
              {propuestasRecibidas > 0 && (
                <p className="text-blue-600 font-medium mt-1">
                  {propuestasRecibidas} {t("dashboard.proposalsReceived").toLowerCase()} {t("common.pending").toLowerCase()}
                </p>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("common.pending"), value: pendientes, color: "text-amber-600 bg-amber-50" },
                { label: t("common.accepted"), value: aceptadas, color: "text-emerald-600 bg-emerald-50" },
                { label: t("dashboard.proposalsReceived"), value: propuestasRecibidas, color: "text-blue-600 bg-blue-50" },
                { label: t("common.completed"), value: solicitudes.filter((s) => s.estado === "completado").length, color: "text-gray-600 bg-gray-50" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full ${stat.color}`}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick action */}
            <button
              onClick={() => setActiveSection("nueva")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-3.5 font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {t("dashboard.quickAction")}
            </button>
          </div>
        );

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
            onData={setSolicitudes}
          />
        );

      case "propuestas":
        return (
          <PostulacionesCliente
            usuarioId={usuario.id}
            onData={setPostulaciones}
          />
        );

      case "perfil":
        return <EditarPerfil usuario={usuario} />;

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      navItems={navItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderContent()}
      <AnimatePresence>
        {notificacion && (
          <NotificacionFlotante
            mensaje={notificacion}
            onClose={() => setNotificacion(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default DashboardCliente;
