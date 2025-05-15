import React, { useEffect, useState } from "react";
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { obtenerReseñasPositivas } from "../api/reseñasApi";
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<
    "oferente" | "cliente" | null
  >(null);
  const [reseñas, setReseñas] = useState<any[]>([]);

  useEffect(() => {
    const cargar = async () => {
      const data = await obtenerReseñasPositivas();
      setReseñas(data);
    };
    cargar();
  }, []);

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
        <div className={styles.heroText}>
          <h2>Conecta con profesionales cerca de ti</h2>
          <p>Encuentra y contrata en minutos. 100% local, 100% confiable.</p>
          <div className={styles.heroButtons}></div>
        </div>
        <img
          src="/images/hero-ilustracion.svg"
          alt="Trabajo local geolocalizado"
          className={styles.heroImage}
        />
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

      <section className={styles.categories}>
        <h3>Especialidades populares</h3>
        <div className={styles.categoryGrid}>
          <span>🛠️ Reformas</span>
          <span>🧹 Limpieza</span>
          <span>👩‍🏫 Clases particulares</span>
          <span>🧒 Cuidado de niños</span>
          <span>🐶 Paseo de mascotas</span>
          <span>💻 Soporte informático</span>
        </div>
      </section>

      <section className={styles.testimonials}>
        <h3>Lo que dicen nuestros usuarios</h3>
        {reseñas.length === 0 ? (
          <p>Aún no hay reseñas.</p>
        ) : (
          reseñas.map((r, idx) => (
            <blockquote key={idx}>
              "{r.mensaje}"
              <cite>- {r.usuarios?.nombre || "Usuario anónimo"}</cite>
            </blockquote>
          ))
        )}
      </section>

      <section className={styles.ctaSection}>
        <h3>¿Listo para empezar?</h3>
        <p>Regístrate gratis y encuentra oportunidades cerca de ti.</p>
        <button onClick={() => navigate("/registro")}>Comenzar ahora</button>
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
              window.location.reload();
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
