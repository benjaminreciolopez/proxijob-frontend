import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAdminAuth } from "./context/AdminAuthContext";
import { Skeleton } from "./components/ui/Skeleton";

// Lazy-loaded pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const DashboardUniversal = lazy(() => import("./pages/DashboardUniversal"));
const Chat = lazy(() => import("./Chat"));
const CrearReseña = lazy(() => import("./pages/CrearReseña"));
const PerfilPublico = lazy(() => import("./pages/PerfilPublico"));
const Pagos = lazy(() => import("./pages/Pagos"));
const RutaProtegida = lazy(() => import("./components/RutaProtegida"));

const modoMantenimiento = import.meta.env.VITE_MODO_MANTENIMIENTO === "true";

const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-grey-50">
    <div className="w-full max-w-md p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-navy">
          Proxi<span className="text-primary">Job</span>
        </h2>
      </div>
      <Skeleton lines={4} />
    </div>
  </div>
);

const RutasProtegidas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated: isAdmin } = useAdminAuth();

  if (modoMantenimiento && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-center" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              modoMantenimiento ? (
                <RutaProtegida>
                  <LandingPage />
                </RutaProtegida>
              ) : (
                <LandingPage />
              )
            }
          />
          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <RutasProtegidas>
                <DashboardUniversal />
              </RutasProtegidas>
            }
          />
          <Route
            path="/crear-reseña"
            element={
              <RutasProtegidas>
                <CrearReseña />
              </RutasProtegidas>
            }
          />
          <Route
            path="/chat"
            element={
              <RutasProtegidas>
                <Chat />
              </RutasProtegidas>
            }
          />
          {/* Perfil público */}
          <Route path="/perfil/:id" element={<PerfilPublico />} />
          {/* Pagos */}
          <Route
            path="/pagos"
            element={
              <RutasProtegidas>
                <Pagos />
              </RutasProtegidas>
            }
          />
          {/* Redirección catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
