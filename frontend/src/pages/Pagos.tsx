import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Pago, Usuario } from "../types";
import { Button, EmptyState } from "../components/ui";
import { SkeletonList } from "../components/ui/Skeleton";
import PagoCard from "../components/pagos/PagoCard";
import { fetchPagosRealizados, fetchPagosRecibidos } from "../services/pagosService";

type Tab = "realizados" | "recibidos";

const Pagos: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("realizados");
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const raw = localStorage.getItem("usuario");
  const usuario: Usuario | null = raw ? JSON.parse(raw) : null;

  useEffect(() => {
    if (!usuario) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data =
          tab === "realizados"
            ? await fetchPagosRealizados(usuario!.id)
            : await fetchPagosRecibidos(usuario!.id);
        if (!cancelled) setPagos(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Error al cargar pagos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tab, usuario?.id]);

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl text-error mb-2">Acceso denegado</h2>
          <p className="text-grey-600 mb-6">Debes iniciar sesion para ver tus pagos.</p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Iniciar sesion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Header */}
      <div className="bg-white border-b border-grey-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-grey-800">Pagos</h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            Volver al panel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-grey-200">
        <div className="max-w-3xl mx-auto px-4 flex">
          <button
            onClick={() => setTab("realizados")}
            className={`
              px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer
              ${tab === "realizados"
                ? "border-primary text-primary"
                : "border-transparent text-grey-500 hover:text-grey-700"}
            `}
          >
            Pagos realizados
          </button>
          <button
            onClick={() => setTab("recibidos")}
            className={`
              px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer
              ${tab === "recibidos"
                ? "border-primary text-primary"
                : "border-transparent text-grey-500 hover:text-grey-700"}
            `}
          >
            Pagos recibidos
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <SkeletonList count={3} />
        ) : error ? (
          <div className="bg-error-light text-red-800 rounded-lg p-4 text-sm">
            {error}
          </div>
        ) : pagos.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No hay pagos aun"
            description="Los pagos apareceran aqui cuando se complete un trabajo."
          />
        ) : (
          <div className="space-y-4">
            {pagos.map((pago) => (
              <PagoCard
                key={pago.id}
                pago={pago}
                tipo={tab === "realizados" ? "realizado" : "recibido"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagos;
