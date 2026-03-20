import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import DashboardLayout, {
  Home,
  Search,
  Send,
  CheckCircle,
  User,
} from "../components/layout/DashboardLayout";
import type { NavItem } from "../components/layout/DashboardLayout";
import SolicitudesDisponibles from "../components/SolicitudesDisponibles";
import MisPostulaciones from "../components/MisPostulaciones";
import MisSolicitudesAceptadas from "../components/MisSolicitudesAceptadas";
import EditarPerfil from "../components/EditarPerfil";
import Documentos from "../components/Documentos";
import ZonasTrabajo from "../components/ZonasTrabajo";
import NotificacionFlotante from "../components/NotificacionFlotante";
import { AnimatePresence } from "framer-motion";

const DashboardProfesional: React.FC = () => {
  const { t } = useTranslation();
  const { usuario } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const [propuestas, setPropuestas] = useState<any[]>([]);

  if (!usuario) return null;

  const propuestasPendientes = propuestas.filter((p) => p.estado === "pendiente").length;
  const propuestasAceptadas = propuestas.filter((p) => p.estado === "aceptado").length;

  const navItems: NavItem[] = [
    { key: "home", label: t("dashboard.home"), icon: <Home className="w-4 h-4" /> },
    { key: "disponibles", label: t("dashboard.availableJobs"), icon: <Search className="w-4 h-4" /> },
    { key: "mispropuestas", label: t("dashboard.myProposals"), icon: <Send className="w-4 h-4" /> },
    { key: "aceptados", label: t("dashboard.acceptedJobs"), icon: <CheckCircle className="w-4 h-4" /> },
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
                {t("dashboard.welcomePro", { name: usuario.nombre.split(" ")[0] })}
              </h1>
              <p className="text-gray-500">
                {t("dashboard.proSummary", { proposals: propuestasPendientes, accepted: propuestasAceptadas })}
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("common.pending"), value: propuestasPendientes, color: "text-amber-600 bg-amber-50" },
                { label: t("common.accepted"), value: propuestasAceptadas, color: "text-emerald-600 bg-emerald-50" },
                { label: t("common.rejected"), value: propuestas.filter((p) => p.estado === "rechazado").length, color: "text-red-600 bg-red-50" },
                { label: t("dashboard.statsProposals"), value: propuestas.length, color: "text-blue-600 bg-blue-50" },
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
              onClick={() => setActiveSection("disponibles")}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl py-3.5 font-semibold text-base hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {t("dashboard.quickActionPro")}
            </button>
          </div>
        );

      case "disponibles":
        return <SolicitudesDisponibles usuarioId={usuario.id} />;

      case "mispropuestas":
        return <MisPostulaciones usuarioId={usuario.id} />;

      case "aceptados":
        return <MisSolicitudesAceptadas usuarioId={usuario.id} />;

      case "perfil":
        return (
          <div className="space-y-6">
            <EditarPerfil usuario={usuario} />
            <Documentos usuarioId={usuario.id} />
            <ZonasTrabajo usuarioId={usuario.id} />
          </div>
        );

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

export default DashboardProfesional;
