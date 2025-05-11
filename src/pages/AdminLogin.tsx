import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");

  const handleLogin = () => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const claveMaestra = import.meta.env.VITE_ADMIN_CLAVE;

    if (email === adminEmail && clave === claveMaestra) {
      localStorage.setItem("usuario_admin", adminEmail);
      toast.success("Acceso concedido como administrador");
      navigate("/");
    } else {
      toast.error("Credenciales incorrectas");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>🔐 Acceso Administrador</h2>
      <input
        type="email"
        placeholder="Correo administrador"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "1rem" }}
      />
      <input
        type="password"
        placeholder="Clave secreta"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "1rem" }}
      />
      <button
        onClick={handleLogin}
        style={{
          padding: "0.6rem 1.2rem",
          background: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Entrar
      </button>
    </div>
  );
};

export default AdminLogin;
