import React, { useState, useEffect } from "react";
import styles from "./Register.module.css";
import { supabase } from "../supabaseClient";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Register: React.FC = () => {
  const [role, setRole] = useState<"oferente" | "cliente" | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.password) {
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

    // Paso 1: crear cuenta en Supabase Auth
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

    // Paso 2: guardar datos en tabla `usuarios`
    const { error: errorInsert } = await supabase.from("usuarios").insert([
      {
        id: data.user.id,
        nombre: formData.nombre,
        email: formData.email,
        rol: role,
        descripcion: "", // 👈 necesario para evitar error de constraint
        especialidad: "", // 👈 también si es obligatoria en la tabla
      },
    ]);

    if (errorInsert) {
      toast.error("Error al guardar datos del usuario.");
      console.error(errorInsert.message);
      return;
    }

    toast.success("¡Registro exitoso! Puedes iniciar sesión.");
    navigate("/login");
  };
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rolParam = searchParams.get("rol");

  useEffect(() => {
    if (rolParam === "oferente" || rolParam === "cliente") {
      setRole(rolParam);
    } else {
      navigate("/"); // vuelve a la landing si el parámetro es inválido
    }
  }, [rolParam]);

  return (
    <div className={styles.container}>
      {!role ? (
        <>
          <h2>¿Cómo quieres registrarte?</h2>
          <div className={styles.buttons}>
            <button onClick={() => setRole("oferente")}>
              Quiero ofrecer mis servicios
            </button>
            <button onClick={() => setRole("cliente")}>
              Busco a alguien para un trabajo
            </button>
          </div>
        </>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2>Registro como {role === "oferente" ? "Oferente" : "Cliente"}</h2>
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
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Registrarme</button>
          <button type="button" onClick={() => navigate("/")}>
            Volver
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;
