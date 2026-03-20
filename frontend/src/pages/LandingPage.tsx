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
  Clock,
  ChevronRight,
  Droplets,
  Paintbrush,
  GraduationCap,
  Baby,
  Truck,
  Leaf,
  Plug,
  Timer,
  TrendingUp,
  Heart,
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
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reseñas" }, async () => {
        await cargarReseñas();
      })
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, []);

  const useCases = [
    { icon: Droplets, text: t("landing.useCase1"), cat: t("landing.useCase1cat"), time: t("landing.useCase1time"), color: "blue" },
    { icon: Sparkles, text: t("landing.useCase2"), cat: t("landing.useCase2cat"), time: t("landing.useCase2time"), color: "emerald" },
    { icon: GraduationCap, text: t("landing.useCase3"), cat: t("landing.useCase3cat"), time: t("landing.useCase3time"), color: "violet" },
    { icon: Wrench, text: t("landing.useCase4"), cat: t("landing.useCase4cat"), time: t("landing.useCase4time"), color: "amber" },
    { icon: Plug, text: t("landing.useCase5"), cat: t("landing.useCase5cat"), time: t("landing.useCase5time"), color: "red" },
    { icon: Baby, text: t("landing.useCase6"), cat: t("landing.useCase6cat"), time: t("landing.useCase6time"), color: "rose" },
    { icon: Truck, text: t("landing.useCase7"), cat: t("landing.useCase7cat"), time: t("landing.useCase7time"), color: "indigo" },
    { icon: Leaf, text: t("landing.useCase8"), cat: t("landing.useCase8cat"), time: t("landing.useCase8time"), color: "teal" },
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
    red: { bg: "bg-red-100", text: "text-red-600", ring: "ring-red-200" },
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ProxiJob
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#como-funciona" className="hover:text-blue-600 transition-colors">{t("landing.navHow")}</a>
            <a href="#servicios" className="hover:text-blue-600 transition-colors">{t("landing.navServices")}</a>
            <a href="#opiniones" className="hover:text-blue-600 transition-colors">{t("landing.navReviews")}</a>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={() => navigate("/login")} className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 cursor-pointer">
              {t("auth.login")}
            </button>
            <button onClick={() => navigate("/registro")} className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer">
              {t("landing.startFree")}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pt-28 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            {t("landing.badge")}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-4 leading-[1.1]">
            {t("landing.heroTitle1")}<br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("landing.heroTitle2")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t("landing.heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
            <button onClick={() => navigate("/registro")} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 cursor-pointer">
              {t("landing.ctaRegister")}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/registro")} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-8 py-4 rounded-xl transition-all cursor-pointer">
              <Briefcase className="w-4 h-4" />
              {t("landing.ctaPro")}
            </button>
          </div>
          <p className="text-sm text-gray-400">{t("landing.noCard")}</p>
        </div>
      </section>

      {/* ─── USE CASES — "Que necesitas hoy?" ─── */}
      <section id="servicios" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              {t("landing.useCasesTitle")}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t("landing.useCasesSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map((uc) => {
              const colors = colorMap[uc.color] || colorMap.blue;
              const Icon = uc.icon;
              return (
                <div
                  key={uc.text}
                  onClick={() => navigate("/registro")}
                  className="group bg-gray-50 rounded-2xl p-5 border border-transparent hover:border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                >
                  <div className={`w-10 h-10 ${colors.bg} rounded-xl ring-1 ${colors.ring} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 mb-1 leading-snug">"{uc.text}"</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      {uc.cat}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {uc.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            {t("landing.allServicesTitle")}. <span className="text-gray-500 font-medium">{t("landing.allServicesSubtitle")}</span>
          </p>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section id="como-funciona" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              {t("landing.howTitle")}
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">{t("landing.howSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "1", icon: FileText, title: t("landing.step1Title"), desc: t("landing.step1Desc"), color: "blue" },
              { num: "2", icon: Bell, title: t("landing.step2Title"), desc: t("landing.step2Desc"), color: "indigo" },
              { num: "3", icon: CheckCircle, title: t("landing.step3Title"), desc: t("landing.step3Desc"), color: "emerald" },
            ].map((step) => {
              const colors = colorMap[step.color];
              const Icon = step.icon;
              return (
                <div key={step.num} className="text-center">
                  <div className={`w-16 h-16 ${colors.bg} rounded-2xl ring-1 ${colors.ring} flex items-center justify-center mx-auto mb-5 relative`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── DUAL: CLIENTE / PROFESIONAL ─── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              {t("landing.dualTitle")}
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">{t("landing.dualSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CLIENT CARD */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("landing.clientTitle")}</h3>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">{t("landing.clientDesc")}</p>
              <ul className="space-y-2.5 mb-6">
                {[t("landing.clientBullet1"), t("landing.clientBullet2"), t("landing.clientBullet3"), t("landing.clientBullet4")].map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/registro")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                {t("landing.ctaRegister")} <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* PRO CARD */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("landing.proTitle")}</h3>
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">{t("landing.proDesc")}</p>
              <ul className="space-y-2.5 mb-6">
                {[t("landing.proBullet1"), t("landing.proBullet2"), t("landing.proBullet3"), t("landing.proBullet4")].map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate("/registro")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer">
                {t("landing.ctaPro")} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── POR QUE PROXIJOB ─── */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
              {t("landing.whyTitle")}
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">{t("landing.whySubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: t("landing.why1Title"), desc: t("landing.why1Desc"), color: "amber" },
              { icon: Globe, title: t("landing.why2Title"), desc: t("landing.why2Desc"), color: "blue" },
              { icon: MapPin, title: t("landing.why3Title"), desc: t("landing.why3Desc"), color: "indigo" },
              { icon: Shield, title: t("landing.why4Title"), desc: t("landing.why4Desc"), color: "emerald" },
            ].map((b) => {
              const colors = colorMap[b.color];
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-white rounded-2xl p-6 border border-transparent hover:border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1">
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

      {/* ─── STATS ─── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "+200", label: t("landing.stat1"), icon: Briefcase, color: "text-blue-600" },
              { value: "<10min", label: t("landing.stat2"), icon: Timer, color: "text-amber-600" },
              { value: "+190", label: t("landing.stat3"), icon: Globe, color: "text-indigo-600" },
              { value: "98%", label: t("landing.stat4"), icon: Heart, color: "text-rose-600" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="text-center">
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                  <p className="text-3xl md:text-4xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              );
            })}
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
            <p className="text-gray-500 max-w-xl mx-auto">{t("landing.reviewsSubtitle")}</p>
          </div>

          {reseñas.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400">{t("landing.noReviews")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reseñas.map((r, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.puntuacion ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">"{r.comentario}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(r.autor_nombre || "U")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.autor_nombre || "Usuario"}</p>
                      {r.destinatario_n && (
                        <p className="text-xs text-gray-400">{t("landing.reviewTo", { name: r.destinatario_n })}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.1),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                {t("landing.readyTitle")}
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                {t("landing.readySubtitle")}
              </p>
              <button onClick={() => navigate("/registro")} className="inline-flex items-center justify-center gap-2 text-base font-semibold text-blue-600 bg-white hover:bg-gray-50 px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer">
                {t("landing.readyCta")}
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-blue-200 text-sm mt-4">{t("landing.noCard")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{t("landing.footerAbout")}</h4>
              <ul className="space-y-2.5">
                {[t("landing.footerHelp"), t("landing.footerSecurity"), t("landing.footerLegal"), t("landing.footerPrivacy")].map((link) => (
                  <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{t("landing.footerCompany")}</h4>
              <ul className="space-y-2.5">
                {[t("landing.footerAboutUs"), t("landing.footerCareers"), t("landing.footerBlog")].map((link) => (
                  <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{t("landing.footerResources")}</h4>
              <ul className="space-y-2.5">
                {[t("landing.footerClientGuide"), t("landing.footerProGuide"), t("landing.footerFaq")].map((link) => (
                  <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">{t("landing.footerLegalSection")}</h4>
              <ul className="space-y-2.5">
                {[t("landing.footerCookies"), t("landing.footerTerms"), t("landing.footerSitemap")].map((link) => (
                  <li key={link}><a href="#" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ProxiJob</span>
              <span className="text-xs text-gray-400">© {new Date().getFullYear()} {t("landing.footerRights")}</span>
            </div>
            {isAdmin && (
              <button onClick={async () => { await adminLogout(); toast.success(t("landing.adminLogout")); window.location.reload(); }} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer">
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
