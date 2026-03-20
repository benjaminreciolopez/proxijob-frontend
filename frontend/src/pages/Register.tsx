import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import { Search, Briefcase, ArrowLeft, MapPin } from "lucide-react";

type Step = "role" | "form";

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("role");
  const [verPassword, setVerPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    tratamiento: "",
    rol: "" as "cliente" | "profesional" | "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error(t("auth.allFieldsRequired"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t("auth.invalidEmail"));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t("auth.passwordTooShort"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t("auth.passwordsMismatch"));
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error || !data.user) {
      setIsLoading(false);
      if (error?.status === 422) {
        toast.error(t("auth.emailAlreadyUsed"));
      } else {
        toast.error(t("auth.errorRegister"));
        console.error(error?.message);
      }
      return;
    }

    const { error: errorInsert } = await supabase.from("usuarios").insert([
      {
        id: data.user.id,
        nombre: formData.nombre,
        email: formData.email,
        descripcion: "",
        especialidad: "",
        tratamiento: formData.tratamiento,
        rol: formData.rol || "cliente",
      },
    ]);

    if (errorInsert) {
      setIsLoading(false);
      toast.error(t("auth.errorSaveUser"));
      console.error(errorInsert.message);
      return;
    }

    localStorage.setItem(
      "usuario",
      JSON.stringify({
        id: data.user.id,
        nombre: formData.nombre,
        email: formData.email,
        tratamiento: formData.tratamiento,
        rol: formData.rol || "cliente",
      })
    );

    setIsLoading(false);
    toast.success(t("auth.registerSuccess"));
    navigate("/login");
  };

  const inputClasses =
    "w-full rounded-md border border-grey-300 bg-white px-4 py-2.5 text-sm text-grey-800 placeholder-grey-400 transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

  // ─── STEP 1: ROLE SELECTION ───
  if (step === "role") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.back")}
            </button>
            <LanguageSwitcher />
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ProxiJob
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t("auth.selectRole")}
            </h1>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client */}
            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, rol: "cliente" }));
                setStep("form");
              }}
              className={`group relative bg-white rounded-2xl border-2 p-6 text-left transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                formData.rol === "cliente"
                  ? "border-blue-500 shadow-lg shadow-blue-100"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {t("auth.roleClient")}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t("auth.roleClientDesc")}
              </p>
            </button>

            {/* Professional */}
            <button
              onClick={() => {
                setFormData((prev) => ({ ...prev, rol: "profesional" }));
                setStep("form");
              }}
              className={`group relative bg-white rounded-2xl border-2 p-6 text-left transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                formData.rol === "profesional"
                  ? "border-emerald-500 shadow-lg shadow-emerald-100"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {t("auth.roleProfessional")}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t("auth.roleProfessionalDesc")}
              </p>
            </button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            {t("auth.noCardRequired")}
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            {t("auth.hasAccount")}{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              {t("auth.loginLink")}
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ─── STEP 2: REGISTRATION FORM ───
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        {/* Back to role selection */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setStep("role")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("common.back")}
          </button>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            formData.rol === "cliente"
              ? "bg-blue-100 text-blue-700"
              : "bg-emerald-100 text-emerald-700"
          }`}>
            {formData.rol === "cliente" ? t("roles.client") : t("roles.professional")}
          </span>
        </div>

        <h2 className="mb-6 text-center text-2xl font-bold text-grey-800">
          {t("auth.register")}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tratamiento */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tratamiento" className="text-sm font-medium text-grey-600">
              {t("auth.treatment")}
            </label>
            <select
              id="tratamiento"
              name="tratamiento"
              value={formData.tratamiento}
              onChange={handleSelectChange}
              required
              className={`${inputClasses} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10`}
            >
              <option value="">{t("auth.treatmentSelect")}</option>
              <option value="Sr">{t("auth.treatmentMr")}</option>
              <option value="Sra">{t("auth.treatmentMs")}</option>
            </select>
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nombre" className="text-sm font-medium text-grey-600">
              {t("auth.fullName")}
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder={t("auth.fullNamePlaceholder")}
              value={formData.nombre}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-grey-600">
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
              className={inputClasses}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-grey-600">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={verPassword ? "text" : "password"}
                name="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className={`${inputClasses} pr-10`}
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent p-0 text-lg leading-none text-grey-400 transition-colors hover:text-grey-600"
                aria-label={t("auth.showPassword")}
              >
                {verPassword ? "\u{1F648}" : "\u{1F441}\uFE0F"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-grey-600">
              {t("auth.confirmPassword")}
            </label>
            <input
              id="confirmPassword"
              type={verPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t("auth.confirmPasswordPlaceholder")}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className={inputClasses}
            />
          </div>

          {/* Buttons */}
          <div className="mt-2 flex flex-col gap-3">
            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              {t("auth.registerButton")}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-grey-500 mt-6">
          {t("auth.hasAccount")}{" "}
          <a href="/login" className="text-primary hover:text-primary-dark font-medium">
            {t("auth.loginLink")}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
