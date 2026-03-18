import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";

const Login: React.FC = () => {
  const navigate = useNavigate();
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error || !data.user) {
      toast.error("Correo o contrasena incorrectos.");
      setLoading(false);
      return;
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!perfil) {
      toast.error("No se pudo cargar tu perfil.");
      setLoading(false);
      return;
    }

    const saludo =
      perfil.tratamiento === "Sra"
        ? `!Bienvenida, ${perfil.nombre}!`
        : `!Bienvenido, ${perfil.nombre}!`;

    toast.success(saludo);
    localStorage.setItem("usuario", JSON.stringify(perfil));

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-grey-800 text-center mb-6">
          Iniciar sesion
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-grey-600 mb-1"
            >
              Correo electronico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 text-sm rounded-md border border-grey-300
                bg-grey-50 text-grey-800 placeholder-grey-400
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30
                transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-grey-600 mb-1"
            >
              Contrasena
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
                aria-label="Mostrar u ocultar contrasena"
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
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-grey-500 mt-6">
          No tienes cuenta?{" "}
          <a href="/register" className="text-primary hover:text-primary-dark font-medium">
            Registrate
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
