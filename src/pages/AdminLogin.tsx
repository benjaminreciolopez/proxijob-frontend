import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAdminAuth } from "../context/AdminAuthContext";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [clave, setClave] = useState("");
  const { login } = useAdminAuth();

  const handleLogin = () => {
    const ok = login(clave);
    if (ok) {
      toast.success("Acceso administrador concedido");
      navigate("/");
    } else {
      toast.error("Credenciales incorrectas");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>🔐 Acceso Administrador</h2>
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
