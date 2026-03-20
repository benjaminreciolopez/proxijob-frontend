import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { obtenerReseñasPositivas } from "../api/reseñasApi";
import { supabase } from "../supabaseClient";
import { useAdminAuth } from "../context/AdminAuthContext";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
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
  Globe,
  Briefcase,
  Building2,
  Paintbrush,
  GraduationCap,
  Baby,
  Dog,
  Monitor,
  Truck,
  HardHat,
  Scissors,
  Camera,
  Heart,
  Scale,
  Leaf,
  Music,
  Dumbbell,
  Utensils,
  Stethoscope,
  PenTool,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
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
    { icon: Wrench, label: t("landing.catReformas"), color: "blue" },
    { icon: Sparkles, label: t("landing.catLimpieza"), color: "emerald" },
    { icon: GraduationCap, label: t("landing.catClases"), color: "violet" },
    { icon: Baby, label: t("landing.catNinos"), color: "rose" },
    { icon: Dog, label: t("landing.catMascotas"), color: "amber" },
    { icon: Monitor, label: t("landing.catTech"), color: "cyan" },
    { icon: Truck, label: t("landing.catTransporte"), color: "indigo" },
    { icon: HardHat, label: t("landing.catMantenimiento"), color: "teal" },
    { icon: Paintbrush, label: t("landing.catPintura") || "Pintura", color: "orange" },
    { icon: Scissors, label: t("landing.catPeluqueria") || "Peluqueria", color: "pink" },
    { icon: Camera, label: t("landing.catFotografia") || "Fotografia", color: "purple" },
    { icon: Heart, label: t("landing.catCuidados") || "Cuidados", color: "red" },
    { icon: Scale, label: t("landing.catLegal") || "Legal", color: "slate" },
    { icon: Leaf, label: t("landing.catJardineria") || "Jardineria", color: "lime" },
    { icon: Music, label: t("landing.catMusica") || "Musica", color: "fuchsia" },
    { icon: Dumbbell, label: t("landing.catFitness") || "Fitness", color: "sky" },
    { icon: Utensils, label: t("landing.catCocina") || "Cocina", color: "yellow" },
    { icon: Stethoscope, label: t("landing.catSalud") || "Salud", color: "emerald" },
    { icon: PenTool, label: t("landing.catDiseno") || "Diseno", color: "violet" },
    { icon: Building2, label: t("landing.catInmobiliaria") || "Inmobiliaria", color: "blue" },
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
    orange: { bg: "bg-orange-100", text: "text-orange-600", ring: "ring-orange-200" },
    pink: { bg: "bg-pink-100", text: "text-pink-600", ring: "ring-pink-200" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", ring: "ring-purple-200" },
    red: { bg: "bg-red-100", text: "text-red-600", ring: "ring-red-200" },
    slate: { bg: "bg-slate-100", text: "text-slate-600", ring: "ring-slate-200" },
    lime: { bg: "bg-lime-100", text: "text-lime-600", ring: "ring-lime-200" },
    fuchsia: { bg: "bg-fuchsia-100", text: "text-fuchsia-600", ring: "ring-fuchsia-200" },
    sky: { bg: "bg-sky-100", text: "text-sky-600", ring: "ring-sky-200" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600", ring: "ring-yellow-200" },
  };

  const steps = [
    {
      num: "01",
      icon: FileText,
      title: t("landing.step1Title"),
      desc: t("landing.step1Desc"),
      color: "blue",
    },
    {
      num: "02",
      icon: Search,
      title: t("landing.step2Title"),
      desc: t("landing.step2Desc"),
      color: "indigo",
    },
    {
      num: "03",
      icon: MessageCircle,
      title: t("landing.step3Title"),
      desc: t("landing.step3Desc"),
      color: "emerald",
    },
  ];

  const benefits = [
    {
      icon: Globe,
      title: t("landing.benefit1Title"),
      desc: t("landing.benefit1Desc"),
      color: "blue",
    },
    {
      icon: Bell,
      title: t("landing.benefit2Title"),
      desc: t("landing.benefit2Desc"),
      color: "indigo",
    },
    {
      icon: Shield,
      title: t("landing.benefit3Title"),
      desc: t("landing.benefit3Desc"),
      color: "emerald",
    },
    {
      icon: Zap,
      title: t("landing.benefit4Title"),
      desc: t("landing.benefit4Desc"),
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
            <a href="#como-funciona" className="hover:text-blue-600 transition-colors">{t("landing.navHowItWorks")}</a>
            <a href="#categorias" className="hover:text-blue-600 transition-colors">{t("landing.navCategories")}</a>
            <a href="#opiniones" className="hover:text-blue-600 transition-colors">{t("landing.navReviews")}</a>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 cursor-pointer"
            >
              {t("auth.login")}
            </button>
            <button
              onClick={() => navigate("/registro")}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              {t("landing.startFree")}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Globe className="w-4 h-4" />
            {t("landing.badge")}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
            {t("landing.heroTitle1")}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("landing.heroTitle2")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("landing.heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/registro")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3.5 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              {t("landing.ctaRegister")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-300 px-8 py-3.5 rounded-xl hover:shadow-md transition-all cursor-pointer"
            >
              {t("landing.ctaLogin")}
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            {t("landing.noCard")}
          </p>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section id="como-funciona" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              {t("landing.simpleAndFast")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              {t("landing.howItWorks")}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t("landing.howItWorksSubtitle")}
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
              {t("landing.whyProxijob")}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t("landing.whySubtitle")}
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

      {/* ─── CATEGORIAS ─── */}
      <section id="categorias" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            {t("landing.categories")}
          </h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            {t("landing.categoriesSubtitle")}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const colors = colorMap[cat.color] || colorMap.blue;
              const Icon = cat.icon;
              return (
                <div
                  key={cat.label}
                  className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5 border border-transparent hover:border-gray-200 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className={`w-9 h-9 ${colors.bg} rounded-lg ring-1 ${colors.ring} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors text-left">
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
                {t("landing.readyToStart")}
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                {t("landing.readyCta")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/registro")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-blue-600 bg-white hover:bg-gray-50 px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  {t("landing.createAccount")}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-medium text-white/90 hover:text-white border border-white/30 hover:border-white/50 px-8 py-3.5 rounded-xl transition-all cursor-pointer"
                >
                  {t("auth.login")}
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
              {t("landing.reviews")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              {t("landing.reviewsTitle")}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t("landing.reviewsSubtitle")}
            </p>
          </div>

          {reseñas.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">{t("landing.noReviews")}</p>
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
                          {t("landing.reviewTo", { name: r.destinatario_n })}
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
                {t("landing.secureReliable")}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-4">
                {t("landing.platformTitle")}
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                {t("landing.platformSubtitle")}
              </p>
              <ul className="space-y-3">
                {[
                  t("landing.feat1"),
                  t("landing.feat2"),
                  t("landing.feat3"),
                  t("landing.feat4"),
                  t("landing.feat5"),
                  t("landing.feat6"),
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
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("landing.mockNewRequest")}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{t("landing.mockPending")}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{t("landing.mockTitle")}</p>
                <p className="text-xs text-gray-500 mb-3">{t("landing.mockDesc")}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{t("landing.mockDistance")}</span>
                  </div>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">{t("landing.mockTime")}</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t("landing.mockProposal")}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{t("landing.mockAccepted")}</span>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    JR
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t("landing.mockProName")}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">4.9 (23)</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{t("landing.mockProDesc")}</p>
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
                {t("landing.footerAbout")}
              </h4>
              <ul className="space-y-2.5">
                {[t("landing.footerHelp"), t("landing.footerSecurity"), t("landing.footerLegal"), t("landing.footerPrivacy")].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {t("landing.footerCompany")}
              </h4>
              <ul className="space-y-2.5">
                {[t("landing.footerAboutUs"), t("landing.footerCareers"), t("landing.footerBlog")].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {t("landing.footerResources")}
              </h4>
              <ul className="space-y-2.5">
                {[t("landing.footerClientGuide"), t("landing.footerProGuide"), t("landing.footerFaq")].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                {t("landing.footerLegalSection")}
              </h4>
              <ul className="space-y-2.5">
                {[t("landing.footerCookies"), t("landing.footerTerms"), t("landing.footerSitemap")].map((link) => (
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
                © {new Date().getFullYear()} {t("landing.footerRights")}
              </span>
            </div>

            {isAdmin && (
              <button
                onClick={async () => {
                  await adminLogout();
                  toast.success(t("landing.adminLogout"));
                  window.location.reload();
                }}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer"
              >
                {t("landing.adminLogout")}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
