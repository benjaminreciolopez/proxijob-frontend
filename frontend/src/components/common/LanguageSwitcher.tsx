import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith("en") ? "en" : "es";

  const toggle = () => {
    i18n.changeLanguage(currentLang === "es" ? "en" : "es");
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-all cursor-pointer ${className}`}
      aria-label="Change language"
    >
      <span className={currentLang === "es" ? "font-bold" : "text-gray-400"}>ES</span>
      <span className="text-gray-300">/</span>
      <span className={currentLang === "en" ? "font-bold" : "text-gray-400"}>EN</span>
    </button>
  );
};

export default LanguageSwitcher;
