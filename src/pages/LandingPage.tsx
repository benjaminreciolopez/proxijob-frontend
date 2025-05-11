import React, { useState } from "react";
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<
    "oferente" | "cliente" | null
  >(null);

  const handleRoleClick = (rol: "oferente" | "cliente") => {
    setSelectedRole(rol);
    navigate(`/registro?rol=${rol}`);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>ProxiJob</h1>
        <div className={styles.nav}>
          <button
            className={`${styles.navButton} ${
              selectedRole === "oferente" ? styles.active : ""
            }`}
            onClick={() => handleRoleClick("oferente")}
          >
            Quiero ofrecer mis servicios
          </button>
          <button
            className={`${styles.navButton} ${
              selectedRole === "cliente" ? styles.active : ""
            }`}
            onClick={() => handleRoleClick("cliente")}
          >
            Busco a alguien para un trabajo
          </button>
          <button
            className={styles.loginButton}
            onClick={() => navigate("/login")}
          >
            Acceder
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <h2>Conecta con el talento que tienes cerca</h2>
        <p>Rápido, fácil, geolocalizado.</p>
        <button className={styles.cta} onClick={() => navigate("/registro")}>
          Empieza gratis
        </button>
      </section>

      <section className={styles.steps}>
        <h3>¿Cómo funciona?</h3>
        <ol>
          <li>1️⃣ Regístrate como Profesional o Cliente</li>
          <li>2️⃣ Crea tu perfil o publica tu necesidad</li>
          <li>3️⃣ ¡Recibe propuestas en minutos!</li>
        </ol>
      </section>

      <section className={styles.benefits}>
        <h3>Ventajas de usar ProxiJob</h3>
        <ul>
          <li>✔️ Trabajos cerca de ti</li>
          <li>✔️ Notificaciones en tiempo real</li>
          <li>✔️ Encuentra a quien necesitas, cuando lo necesitas</li>
        </ul>
      </section>

      <section className={styles.testimonials}>
        <h3>Lo que dicen nuestros usuarios</h3>
        <blockquote>
          "ProxiJob me ayudó a encontrar un profesional en minutos. ¡Increíble!"
          <cite>- Juan Pérez</cite>
        </blockquote>
        <blockquote>
          "La mejor plataforma para encontrar trabajos cerca de mí.
          ¡Recomendada!"
          <cite>- María López</cite>
        </blockquote>
      </section>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} ProxiJob</p>
        <div>
          <a href="#">Sobre nosotros</a> | <a href="#">Contacto</a> |{" "}
          <a href="#">Términos</a>
        </div>
        {localStorage.getItem("usuario_admin") && (
          <button
            onClick={() => {
              localStorage.removeItem("usuario_admin");
              toast.success("Sesión de administrador cerrada");
              window.location.reload(); // o navigate(0)
            }}
            style={{
              marginTop: "2rem",
              background: "#dc3545",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cerrar sesión admin
          </button>
        )}
      </footer>
    </div>
  );
};

export default LandingPage;
