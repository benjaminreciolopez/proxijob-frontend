import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAdminAuth } from "../context/AdminAuthContext";
import Button from "../components/ui/Button";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { ok, error } = await login(email, password);

    if (ok) {
      toast.success("Acceso administrador concedido");
      navigate("/");
    } else {
      toast.error(error || "Error de autenticación");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl text-grey-800 text-center mb-6">
          Acceso Administrador
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-base border border-grey-300 rounded-md
              bg-white text-grey-800 placeholder:text-grey-400
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              transition-colors"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-base border border-grey-300 rounded-md
              bg-white text-grey-800 placeholder:text-grey-400
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              transition-colors"
          />
          <Button
            type="submit"
            variant="success"
            size="lg"
            fullWidth
            isLoading={loading}
          >
            {loading ? "Verificando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
