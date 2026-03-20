import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { MapPin } from "lucide-react";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [verPassword, setVerPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.ok) {
      toast.error(t(`auth.${result.error}`));
      setLoading(false);
      return;
    }

    const perfil = result.usuario!;
    const saludo =
      perfil.tratamiento === "Sra"
        ? t("auth.welcomeFemale", { name: perfil.nombre })
        : t("auth.welcomeMale", { name: perfil.nombre });

    toast.success(saludo);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ProxiJob
            </span>
          </div>
          <h2 className="text-2xl font-bold text-grey-800">
            {t("auth.login")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-grey-600 mb-1">
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder={t("auth.emailPlaceholder")}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 text-sm rounded-md border border-grey-300
                bg-grey-50 text-grey-800 placeholder-grey-400
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30
                transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-grey-600 mb-1">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={verPassword ? "text" : "password"}
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 pr-11 text-sm rounded-md border border-grey-300
                  bg-grey-50 text-grey-800 placeholder-grey-400
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30
                  transition-all"
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                  text-grey-400 hover:text-grey-600
                  bg-transparent border-none cursor-pointer p-0 text-lg
                  transition-colors"
                aria-label={t("auth.showPassword")}
              >
                {verPassword ? "\u{1F648}" : "\u{1F441}\uFE0F"}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mt-2"
          >
            {t("auth.loginButton")}
          </Button>
        </form>

        <p className="text-center text-sm text-grey-500 mt-6">
          {t("auth.noAccount")}{" "}
          <a href="/registro" className="text-primary hover:text-primary-dark font-medium">
            {t("auth.registerLink")}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
