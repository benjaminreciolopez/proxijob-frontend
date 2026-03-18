import React, { useEffect, useState } from "react";
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { obtenerReseñasPositivas } from "../api/reseñasApi";
import { supabase } from "../supabaseClient";
import { useAdminAuth } from "../context/AdminAuthContext";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated: isAdmin, logout: adminLogout } = useAdminAuth();
  const [showRoleOptions, setShowRoleOptions] = useState(false);
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>ProxiJob</h1>
        <div className={styles.nav}>
          {!showRoleOptions ? (
            <>
              <button
                className={styles.navButton}
                onClick={() => setShowRoleOptions(true)}
              >
                Registrarse
              </button>
              <button
                className={styles.loginButton}
                onClick={() => navigate("/login")}
              >
                Acceder
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.roleButton}
                onClick={() => navigate("/registro")}
              >
                Quiero registrarme como usuario
              </button>
              <button
                className={styles.volverButton}
                onClick={() => setShowRoleOptions(false)}
              >
                ← Volver
              </button>
            </>
          )}
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <h2>Conecta con profesionales cerca de ti</h2>
          <p>Encuentra y contrata en minutos. 100% local, 100% confiable.</p>
          <p>Trabajo local geolocalizado.</p>
        </div>
        <img
          src="/ilustracion.svg"
          className={styles.heroImage}
          style={{ maxWidth: "300px", height: "auto" }}
        />
      </section>

      <section className={styles.steps}>
        <h3>¿Cómo funciona?</h3>
        <ol>
          <li>1️⃣ Regístrate</li>
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
                  — {r.autor_nombre || "Usuario anónimo"}
                  {r.destinatario_n ? ` (a ${r.destinatario_n})` : ""}
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

      <footer className="footer">
        <div className="footerContent">
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
        <div className="footerSocial">
          {isAdmin && (
            <button
              onClick={async () => {
                await adminLogout();
                toast.success("Sesión de administrador cerrada");
                window.location.reload();
              }}
              style={{
                marginTop: "2rem",
                background: "#dc3545",
                color: "white",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cerrar sesión admin
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
