import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { obtenerReseñasPositivas } from "../api/reseñasApi";
import { supabase } from "../supabaseClient";
import { useAdminAuth } from "../context/AdminAuthContext";
import Button from "../components/ui/Button";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated: isAdmin, logout: adminLogout } = useAdminAuth();
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const [reseñas, setReseñas] = useState<any[]>([]);

  const cargarReseñas = async () => {
    const data = await obtenerReseñasPositivas();
    setReseñas(data);
  };

  useEffect(() => {
    cargarReseñas();

    const canal = supabase
      .channel("reseñas_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reseñas" },
        async () => {
          await cargarReseñas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const categories = [
    { icon: "🛠️", label: "Reformas" },
    { icon: "🧹", label: "Limpieza" },
    { icon: "👩‍🏫", label: "Clases particulares" },
    { icon: "🧒", label: "Cuidado de niños" },
    { icon: "🐶", label: "Paseo de mascotas" },
    { icon: "💻", label: "Soporte informático" },
    { icon: "🚗", label: "Transporte" },
    { icon: "🏠", label: "Viviendas" },
    { icon: "🪄", label: "Mantenimiento" },
    { icon: "🧬", label: "Cuidado de animales" },
  ];

  const steps = [
    { num: "01", title: "Regístrate", desc: "Crea tu cuenta gratis en segundos." },
    { num: "02", title: "Crea tu perfil", desc: "Publica tu necesidad o muestra tus habilidades." },
    { num: "03", title: "Conecta", desc: "Recibe propuestas en minutos y elige al mejor." },
  ];

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-grey-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy cursor-pointer"
            onClick={() => navigate("/")}
          >
            Proxi<span className="text-primary">Job</span>
          </h1>
          <nav className="flex items-center gap-2 sm:gap-3">
            {!showRoleOptions ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoleOptions(true)}
                >
                  Registrarse
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Acceder
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate("/registro")}
                >
                  Registrarme como usuario
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRoleOptions(false)}
                >
                  ← Volver
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-indigo to-primary py-20 sm:py-28 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              Conecta con profesionales{" "}
              <span className="text-warning">cerca de ti</span>
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-2">
              Encuentra y contrata en minutos. 100% local, 100% confiable.
            </p>
            <p className="text-base text-white/60 mb-8">
              Trabajo local geolocalizado.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <Button
                variant="success"
                size="lg"
                onClick={() => navigate("/registro")}
                className="shadow-lg hover:shadow-xl"
              >
                Empieza gratis
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate("/login")}
                className="text-white/90 hover:text-white hover:bg-white/10"
              >
                Ya tengo cuenta
              </Button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="/ilustracion.svg"
              alt="Ilustración ProxiJob"
              className="w-full max-w-xs sm:max-w-sm drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Steps - How it works */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-dark mb-2">
            ¿Cómo funciona?
          </h3>
          <p className="text-grey-500 mb-12 max-w-xl mx-auto">
            Tres sencillos pasos para empezar a trabajar o contratar.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative bg-grey-50 rounded-xl p-8 border border-grey-200 hover:border-primary hover:shadow-lg transition-all duration-300 group"
              >
                <span className="inline-block text-4xl font-extrabold text-primary/20 group-hover:text-primary/40 transition-colors mb-4">
                  {step.num}
                </span>
                <h4 className="text-lg font-bold text-dark mb-2">{step.title}</h4>
                <p className="text-grey-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-b from-primary-light to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-dark mb-12">
            Ventajas de usar ProxiJob
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "📍", title: "Trabajos cerca de ti", desc: "Encuentra oportunidades en tu zona sin desplazarte lejos." },
              { icon: "🔔", title: "Notificaciones en tiempo real", desc: "Recibe alertas instantáneas cuando surjan nuevas oportunidades." },
              { icon: "⚡", title: "Rápido y sencillo", desc: "Encuentra a quien necesitas, cuando lo necesitas." },
            ].map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-grey-100"
              >
                <span className="text-3xl mb-4 block">{b.icon}</span>
                <h4 className="text-lg font-semibold text-dark mb-2">{b.title}</h4>
                <p className="text-grey-500 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-dark mb-2">
            Especialidades populares
          </h3>
          <p className="text-grey-500 mb-10 max-w-xl mx-auto">
            Explora las categorías más solicitadas por nuestros usuarios.
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {categories.map((cat) => (
              <span
                key={cat.label}
                className="inline-flex items-center gap-2 bg-grey-50 border border-grey-200 rounded-lg px-4 py-2.5 text-sm font-medium text-grey-700 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer select-none"
              >
                <span className="text-lg">{cat.icon}</span>
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 px-4 bg-grey-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-dark mb-2">
            Lo que dicen nuestros usuarios
          </h3>
          <p className="text-grey-500 mb-10">
            Opiniones reales de personas que ya usan ProxiJob.
          </p>
          {reseñas.length === 0 ? (
            <p className="text-grey-400 italic">Aún no hay reseñas.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reseñas.map((r, idx) => (
                <blockquote
                  key={idx}
                  className="bg-white rounded-xl p-6 shadow-sm border border-grey-100 text-left hover:shadow-md transition-shadow"
                >
                  <div className="mb-3 text-lg">
                    {Array.from({ length: r.puntuacion }, (_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                  <p className="text-grey-700 italic mb-4">"{r.comentario}"</p>
                  <cite className="block text-sm text-grey-500 not-italic font-medium">
                    — {r.autor_nombre || "Usuario anónimo"}
                    {r.destinatario_n ? ` (a ${r.destinatario_n})` : ""}
                  </cite>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-r from-primary to-indigo text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            ¿Listo para empezar?
          </h3>
          <p className="text-white/80 text-lg mb-8">
            Regístrate gratis y encuentra oportunidades cerca de ti.
          </p>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/registro")}
            className="bg-white text-primary hover:bg-grey-100 font-semibold shadow-lg hover:shadow-xl"
          >
            Crear mi cuenta gratis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-grey-300 pt-12 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Nosotros
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Ayuda</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Seguridad</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Condiciones legales</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Política de Privacidad</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Uso del servicio</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Política de cookies</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Mapa web</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Sobre ProxiJob
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Quiénes somos</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Trabaja con nosotros</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Ofertas activas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Recursos
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Academia ProxiJob</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Blog</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Guías para clientes</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Guías para profesionales</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Prensa
              </h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Notas de prensa</a></li>
                <li><a href="#" className="text-grey-400 hover:text-white text-sm transition-colors">Contacto de medios</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-grey-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-grey-500 text-xs">
              &copy; {new Date().getFullYear()} ProxiJob. Todos los derechos reservados.
            </p>
            {isAdmin && (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  await adminLogout();
                  toast.success("Sesión de administrador cerrada");
                  window.location.reload();
                }}
              >
                Cerrar sesión admin
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
