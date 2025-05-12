import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [verPassword, setVerPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error || !data.user) {
      toast.error("Correo o contraseña incorrectos.");
      return;
    }

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!perfil) {
      toast.error("No se pudo cargar tu perfil.");
      return;
    }

    const saludo =
      perfil.tratamiento === "Sra"
        ? `¡Bienvenida, ${perfil.nombre}!`
        : `¡Bienvenido, ${perfil.nombre}!`;

    toast.success(saludo);
    localStorage.setItem("usuario", JSON.stringify(perfil));

    if (perfil.rol === "cliente") {
      navigate("/dashboard/cliente");
    } else if (perfil.rol === "oferente") {
      navigate("/dashboard/oferente");
    } else {
      toast.error("Rol no reconocido.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Iniciar sesión</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />

        <div style={{ position: "relative" }}>
          <input
            type={verPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
              width: "100%",
              boxSizing: "border-box",
              paddingRight: "2.5rem",
            }}
          />
          <button
            type="button"
            onClick={() => setVerPassword((v) => !v)}
            style={{
              position: "absolute",
              right: "0.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
              padding: 0,
            }}
            aria-label="Mostrar u ocultar contraseña"
          >
            {verPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button type="submit" style={{ padding: "0.5rem", fontSize: "1rem" }}>
          Entrar
        </button>
      </form>
    </div>
  );
};
export default Login;
