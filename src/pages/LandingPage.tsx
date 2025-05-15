import React, { useEffect, useState } from "react";
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { obtenerReseñasPositivas } from "../api/reseñasApi";
import { supabase } from "../supabaseClient";
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<
    "oferente" | "cliente" | null
  >(null);
  const [reseñas, setReseñas] = useState<any[]>([]);

  const cargarReseñas = async () => {
    const data = await obtenerReseñasPositivas();
    setReseñas(data);
  };

  useEffect(() => {
    cargarReseñas();

    const canal = supabase
      .channel("reseñas_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reseñas" },
        async () => {
          await cargarReseñas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
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
          <span>🚗 Transporte</span>
          <span>🏠 Viviendas</span>
          <span>🪄 Mantenimiento</span>
          <span>🧬 Cuidado de animales</span>
        </div>
      </section>

      <section className={styles.testimonials}>
        <h3>Lo que dicen nuestros usuarios</h3>
        {reseñas.length === 0 ? (
          <p>Aún no hay reseñas.</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {reseñas.map((r, idx) => (
              <blockquote
                key={idx}
                style={{
                  background: "#f1f1f1",
                  borderRadius: "8px",
                  padding: "1rem",
                  margin: 0,
                  fontStyle: "italic",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  {Array.from({ length: r.puntuacion }, (_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                “{r.comentario}”
                <br />
                <cite
                  style={{
                    display: "block",
                    marginTop: "0.5rem",
                    color: "#555",
                  }}
                >
                  — {r.nombre || "Usuario anónimo"}
                </cite>
              </blockquote>
            ))}
          </div>
        )}
      </section>

      <section className={styles.ctaSection}>
        <h3>¿Listo para empezar?</h3>
        <p>Regístrate gratis y encuentra oportunidades cerca de ti.</p>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div>
            <h4>Nosotros</h4>
            <ul>
              <li>
                <a href="#">Ayuda</a>
              </li>
              <li>
                <a href="#">Seguridad</a>
              </li>
              <li>
                <a href="#">Condiciones legales</a>
              </li>
              <li>
                <a href="#">Política de Privacidad</a>
              </li>
              <li>
                <a href="#">Uso del servicio</a>
              </li>
              <li>
                <a href="#">Política de cookies</a>
              </li>
              <li>
                <a href="#">Mapa web</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Sobre ProxiJob</h4>
            <ul>
              <li>
                <a href="#">Quiénes somos</a>
              </li>
              <li>
                <a href="#">Trabaja con nosotros</a>
              </li>
              <li>
                <a href="#">Ofertas activas</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Recursos</h4>
            <ul>
              <li>
                <a href="#">Academia ProxiJob</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Guías para clientes</a>
              </li>
              <li>
                <a href="#">Guías para profesionales</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Prensa</h4>
            <ul>
              <li>
                <a href="#">Notas de prensa</a>
              </li>
              <li>
                <a href="#">Contacto de medios</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} ProxiJob</p>
          <div className={styles.footerSocial}>
            <a href="#">
              <img src="/icons/facebook.svg" alt="Facebook" />
            </a>
            <a href="#">
              <img src="/icons/x-twitter.svg" alt="X" />
            </a>
            <a href="#">
              <img src="/icons/youtube.svg" alt="YouTube" />
            </a>
          </div>
          <div className={styles.footerApps}>
            <img src="/icons/google-play.png" alt="Google Play" height={32} />
            <img src="/icons/app-store.png" alt="App Store" height={32} />
          </div>
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
