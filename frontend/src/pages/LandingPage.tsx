import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { obtenerReseñasPositivas } from "../api/reseñasApi";
import { supabase } from "../supabaseClient";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  MapPin,
  Search,
  Star,
  Shield,
  Zap,
  Bell,
  MessageCircle,
  FileText,
  Users,
  Wrench,
  Sparkles,
  ArrowRight,
  CheckCircle,
  ChevronRight,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated: isAdmin, logout: adminLogout } = useAdminAuth();
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
    { icon: Wrench, label: "Reformas", color: "blue" },
    { icon: Sparkles, label: "Limpieza", color: "emerald" },
    { icon: Users, label: "Clases particulares", color: "violet" },
    { icon: Users, label: "Cuidado de niños", color: "rose" },
    { icon: MapPin, label: "Paseo de mascotas", color: "amber" },
    { icon: Zap, label: "Soporte informático", color: "cyan" },
    { icon: MapPin, label: "Transporte", color: "indigo" },
    { icon: Shield, label: "Mantenimiento", color: "teal" },
  ];

  const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", ring: "ring-blue-200" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600", ring: "ring-indigo-200" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", ring: "ring-emerald-200" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", ring: "ring-amber-200" },
    violet: { bg: "bg-violet-100", text: "text-violet-600", ring: "ring-violet-200" },
    rose: { bg: "bg-rose-100", text: "text-rose-600", ring: "ring-rose-200" },
    cyan: { bg: "bg-cyan-100", text: "text-cyan-600", ring: "ring-cyan-200" },
    teal: { bg: "bg-teal-100", text: "text-teal-600", ring: "ring-teal-200" },
  };

  const steps = [
    {
      num: "01",
      icon: FileText,
      title: "Regístrate gratis",
      desc: "Crea tu cuenta en segundos. Sin compromiso, sin tarjeta de crédito.",
      color: "blue",
    },
    {
      num: "02",
      icon: Search,
      title: "Publica o busca",
      desc: "Describe lo que necesitas o muestra tus habilidades profesionales.",
      color: "indigo",
    },
    {
      num: "03",
      icon: MessageCircle,
      title: "Conecta y trabaja",
      desc: "Recibe propuestas en minutos, elige al mejor y empieza a trabajar.",
      color: "emerald",
    },
  ];

  const benefits = [
    {
      icon: MapPin,
      title: "Trabajo 100% local",
      desc: "Encuentra oportunidades geolocalizadas en tu zona. Sin desplazamientos innecesarios.",
      color: "blue",
    },
    {
      icon: Bell,
      title: "Notificaciones en tiempo real",
      desc: "Recibe alertas instantáneas cuando surjan nuevas oportunidades o te contacten.",
      color: "indigo",
    },
    {
      icon: Shield,
      title: "Confianza y reseñas",
      desc: "Sistema de valoraciones verificadas. Elige profesionales con la mejor reputación.",
      color: "emerald",
    },
    {
      icon: Zap,
      title: "Rápido y sencillo",
      desc: "Interfaz intuitiva. Publica una solicitud en menos de 2 minutos.",
      color: "amber",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ProxiJob
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#como-funciona" className="hover:text-blue-600 transition-colors">Cómo funciona</a>
            <a href="#categorias" className="hover:text-blue-600 transition-colors">Categorías</a>
            <a href="#opiniones" className="hover:text-blue-600 transition-colors">Opiniones</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => navigate("/registro")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Empieza gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-4 h-4" />
            Trabajo local geolocalizado
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
            Conecta con profesionales{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              cerca de ti
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            El marketplace de servicios por proximidad. Encuentra y contrata en minutos.
            100% local, 100% confiable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/registro")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3.5 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Crear cuenta gratis
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-300 px-8 py-3.5 rounded-xl hover:shadow-md transition-all cursor-pointer"
            >
              Ya tengo cuenta
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Sin tarjeta de crédito. Registro en 30 segundos.
          </p>
        </div>
      </section>

      {/* ─── CÓMO FUNCIONA ─── */}
      <section id="como-funciona" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              Sencillo y rápido
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              ¿Cómo funciona?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Tres sencillos pasos para empezar a trabajar o contratar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const colors = colorMap[step.color];
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative bg-gray-50 rounded-2xl p-8 border border-transparent hover:border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 group"
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl ring-1 ${colors.ring} flex items-center justify-center mb-5`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <span className="absolute top-6 right-6 text-4xl font-extrabold text-gray-100 group-hover:text-gray-200 transition-colors">
                    {step.num}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BENEFICIOS ─── */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              ¿Por qué ProxiJob?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Todo lo que necesitas para encontrar trabajo o contratar profesionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => {
              const colors = colorMap[b.color];
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-6 border border-transparent hover:border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl ring-1 ${colors.ring} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CATEGORÍAS ─── */}
      <section id="categorias" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            Especialidades populares
          </h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Explora las categorías más solicitadas por nuestros usuarios.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const colors = colorMap[cat.color];
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-transparent hover:border-gray-200 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className={`w-10 h-10 ${colors.bg} rounded-lg ring-1 ${colors.ring} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA CENTRAL ─── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.1),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                ¿Listo para empezar?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                Únete a la comunidad de profesionales y clientes que ya confían en ProxiJob.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/registro")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-blue-600 bg-white hover:bg-gray-50 px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Crear mi cuenta gratis
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-medium text-white/90 hover:text-white border border-white/30 hover:border-white/50 px-8 py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OPINIONES ─── */}
      <section id="opiniones" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <Star className="w-4 h-4" />
              Opiniones reales
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Valoraciones verificadas de personas que ya usan ProxiJob.
            </p>
          </div>

          {reseñas.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">Aún no hay reseñas. ¡Sé el primero!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reseñas.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < r.puntuacion ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                    "{r.comentario}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(r.autor_nombre || "U")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {r.autor_nombre || "Usuario"}
                      </p>
                      {r.destinatario_n && (
                        <p className="text-xs text-gray-400">
                          Reseña a {r.destinatario_n}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── FEATURES CHECKLIST ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                <Shield className="w-4 h-4" />
                Seguro y confiable
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                Todo lo que necesitas en una plataforma
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                ProxiJob te ofrece todas las herramientas para gestionar tus servicios de forma profesional.
              </p>
              <ul className="space-y-3">
                {[
                  "Geolocalización inteligente por zonas de trabajo",
                  "Chat en tiempo real entre cliente y profesional",
                  "Sistema de reseñas y valoraciones verificadas",
                  "Gestión de documentos y certificaciones",
                  "Notificaciones instantáneas de nuevas oportunidades",
                  "Perfiles públicos con historial de trabajos",
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock App Preview */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-xl">
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Solicitud nueva</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Pendiente</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Necesito un fontanero urgente</p>
                <p className="text-xs text-gray-500 mb-3">Fuga de agua en cocina. Zona centro, Madrid.</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>A 1.2 km de ti</span>
                  </div>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">Hace 3 min</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Postulación</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Aceptada</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    JR
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Juan Rodríguez</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">4.9 (23)</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Fontanero profesional con 8 años de experiencia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Nosotros
              </h4>
              <ul className="space-y-2.5">
                {["Ayuda", "Seguridad", "Condiciones legales", "Política de privacidad"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                ProxiJob
              </h4>
              <ul className="space-y-2.5">
                {["Quiénes somos", "Trabaja con nosotros", "Blog"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Recursos
              </h4>
              <ul className="space-y-2.5">
                {["Guía para clientes", "Guía para profesionales", "Preguntas frecuentes"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                {["Política de cookies", "Uso del servicio", "Mapa web"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ProxiJob
              </span>
              <span className="text-xs text-gray-400">
                © {new Date().getFullYear()} Todos los derechos reservados.
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={async () => {
                  await adminLogout();
                  toast.success("Sesión de administrador cerrada");
                  window.location.reload();
                }}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
              >
                Cerrar sesión admin
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
