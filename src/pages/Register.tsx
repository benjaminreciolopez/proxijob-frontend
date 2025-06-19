import React, { useState } from "react";
import styles from "./Register.module.css";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Register: React.FC = () => {
  const [verPassword, setVerPassword] = useState(false);
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

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error || !data.user) {
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
      toast.error("Error al guardar datos del usuario.");
      console.error(errorInsert.message);
      return;
    }

    // Guarda en localStorage solo lo necesario
    localStorage.setItem(
      "usuario",
      JSON.stringify({
        id: data.user.id,
        nombre: formData.nombre,
        email: formData.email,
        tratamiento: formData.tratamiento,
      })
    );

    toast.success("¡Registro exitoso! Puedes iniciar sesión.");
    navigate("/login");
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "500px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Registro de usuario</h2>

        <label>
          Tratamiento:
          <select
            name="tratamiento"
            value={formData.tratamiento}
            onChange={handleSelectChange}
            required
          >
            <option value="">Selecciona</option>
            <option value="Sr">Sr</option>
            <option value="Sra">Sra</option>
          </select>
        </label>

        <input
          type="text"
          name="nombre"
          placeholder="Nombre completo"
          value={formData.nombre}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Contraseña */}
        <div style={{ position: "relative" }}>
          <input
            type={verPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ paddingRight: "2.5rem" }}
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
              lineHeight: 1,
            }}
            aria-label="Mostrar u ocultar contraseña"
          >
            {verPassword ? "🙈" : "👁️"}
          </button>
        </div>

        {/* Confirmar contraseña */}
        <input
          type={verPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Repetir contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button type="submit" style={{ padding: "0.5rem", fontSize: "1rem" }}>
          Registrarme
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        >
          Volver
        </button>
      </form>
    </div>
  );
};

export default Register;
