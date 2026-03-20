import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../common/LanguageSwitcher";
import {
  Home,
  PlusCircle,
  ClipboardList,
  Inbox,
  User,
  Search,
  Send,
  CheckCircle,
  LogOut,
  ArrowLeftRight,
  Menu,
  X,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  activeSection: string;
  onSectionChange: (key: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navItems,
  activeSection,
  onSectionChange,
}) => {
  const { t } = useTranslation();
  const { usuario, rol, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success(t("auth.logout"));
    navigate("/");
  };

  const handleSwitchRole = async () => {
    const newRole = rol === "cliente" ? t("roles.professional") : t("roles.client");
    if (window.confirm(t("roles.switchConfirm", { role: newRole }))) {
      await switchRole();
      toast.success(t("roles.switchTo", { role: newRole }));
    }
  };

  const rolLabel = rol === "cliente" ? t("roles.client") : t("roles.professional");
  const rolColor = rol === "cliente" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── MOBILE TOP BAR ─── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <span className="text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ProxiJob
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rolColor}`}>
            {rolLabel}
          </span>
          <LanguageSwitcher />
        </div>
      </header>

      {/* ─── MOBILE SLIDE-OVER SIDEBAR ─── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent
              navItems={navItems}
              activeSection={activeSection}
              onSectionChange={(key) => {
                onSectionChange(key);
                setSidebarOpen(false);
              }}
              usuario={usuario}
              rolLabel={rolLabel}
              rolColor={rolColor}
              onSwitchRole={handleSwitchRole}
              onLogout={handleLogout}
              t={t}
            />
          </div>
        </div>
      )}

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-gray-100 flex-col z-30">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-50">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ProxiJob
          </span>
        </div>

        <SidebarContent
          navItems={navItems}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          usuario={usuario}
          rolLabel={rolLabel}
          rolColor={rolColor}
          onSwitchRole={handleSwitchRole}
          onLogout={handleLogout}
          t={t}
        />
      </aside>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 h-16 flex items-center justify-around px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSectionChange(item.key)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className={isActive ? "scale-110" : ""}>{item.icon}</span>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ─── MAIN CONTENT ─── */}
      <main className="md:ml-60 pt-16 md:pt-4 pb-20 md:pb-4 px-4 md:px-8 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

// ─── SIDEBAR CONTENT (shared between mobile and desktop) ───
interface SidebarContentProps {
  navItems: NavItem[];
  activeSection: string;
  onSectionChange: (key: string) => void;
  usuario: any;
  rolLabel: string;
  rolColor: string;
  onSwitchRole: () => void;
  onLogout: () => void;
  t: (key: string) => string;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navItems,
  activeSection,
  onSectionChange,
  usuario,
  rolLabel,
  rolColor,
  onSwitchRole,
  onLogout,
  t,
}) => {
  return (
    <div className="flex flex-col flex-1 py-4">
      {/* User info */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={
              usuario?.avatar_url ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${usuario?.id || "default"}`
            }
            alt="avatar"
            className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-100"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {usuario?.nombre || "Usuario"}
            </p>
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${rolColor}`}>
              {rolLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSectionChange(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 mt-auto space-y-1 pt-4 border-t border-gray-100">
        <LanguageSwitcher className="w-full justify-center" />
        <button
          onClick={onSwitchRole}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-all cursor-pointer"
        >
          <ArrowLeftRight className="w-4 h-4" />
          {t("roles.switchTo").replace("{{role}}", "")}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          {t("auth.logout")}
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;

// Re-export icon components for use in dashboard pages
export { Home, PlusCircle, ClipboardList, Inbox, User, Search, Send, CheckCircle };
