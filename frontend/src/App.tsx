import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Skeleton } from "./components/ui/Skeleton";

// Lazy-loaded pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Chat = lazy(() => import("./Chat"));
const CrearReseña = lazy(() => import("./pages/CrearReseña"));
const PerfilPublico = lazy(() => import("./pages/PerfilPublico"));
const Pagos = lazy(() => import("./pages/Pagos"));
const RutaProtegidaRol = lazy(() => import("./components/RutaProtegidaRol"));

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

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-center" />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/perfil/:id" element={<PerfilPublico />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <RutaProtegidaRol>
                <Dashboard />
              </RutaProtegidaRol>
            }
          />
          <Route
            path="/crear-reseña"
            element={
              <RutaProtegidaRol>
                <CrearReseña />
              </RutaProtegidaRol>
            }
          />
          <Route
            path="/chat"
            element={
              <RutaProtegidaRol>
                <Chat />
              </RutaProtegidaRol>
            }
          />
          <Route
            path="/pagos"
            element={
              <RutaProtegidaRol>
                <Pagos />
              </RutaProtegidaRol>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
