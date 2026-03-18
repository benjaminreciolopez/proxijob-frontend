import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";

const Register: React.FC = () => {
  const [verPassword, setVerPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    tratamiento: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nombre ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Todos los campos son obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Introduce un correo válido.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
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
        toast.error("Este correo ya está registrado.");
      } else {
        toast.error("Error al registrarse.");
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
      },
    ]);
    if (errorInsert) {
      setIsLoading(false);
      toast.error("Error al guardar datos del usuario.");
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
      })
    );

    setIsLoading(false);
    toast.success("¡Registro exitoso! Puedes iniciar sesión.");
    navigate("/login");
  };

  const inputClasses =
    "w-full rounded-md border border-grey-300 bg-white px-4 py-2.5 text-sm text-grey-800 placeholder-grey-400 transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-grey-800">
          Registro de usuario
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tratamiento */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="tratamiento"
              className="text-sm font-medium text-grey-600"
            >
              Tratamiento
            </label>
            <select
              id="tratamiento"
              name="tratamiento"
              value={formData.tratamiento}
              onChange={handleSelectChange}
              required
              className={`${inputClasses} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10`}
            >
              <option value="">Selecciona</option>
              <option value="Sr">Sr</option>
              <option value="Sra">Sra</option>
            </select>
          </div>

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="nombre"
              className="text-sm font-medium text-grey-600"
            >
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Tu nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-grey-600"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-grey-600"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={verPassword ? "text" : "password"}
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
                className={`${inputClasses} pr-10`}
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent p-0 text-lg leading-none text-grey-400 transition-colors hover:text-grey-600"
                aria-label="Mostrar u ocultar contraseña"
              >
                {verPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-grey-600"
            >
              Repetir contraseña
            </label>
            <input
              id="confirmPassword"
              type={verPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          {/* Botones */}
          <div className="mt-2 flex flex-col gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Registrarme
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              fullWidth
              onClick={() => navigate("/")}
            >
              Volver
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
