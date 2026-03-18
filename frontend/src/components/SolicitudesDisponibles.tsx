// src/components/SolicitudesDisponibles.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import { SkeletonList } from "./ui/Skeleton";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

interface Solicitud {
  id: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  requiere_profesional: boolean;
  created_at: string;
  usuario_id: string;
  estado: string;
}

interface Props {
  usuarioId: string;
}

const SolicitudesDisponibles: React.FC<Props> = ({ usuarioId }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [postulandoId, setPostulandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from("solicitudes")
        .select("*")
        .eq("estado", "pendiente")
        .neq("usuario_id", usuarioId)
        .order("created_at", { ascending: false });

      if (error) toast.error("Error cargando solicitudes");
      setSolicitudes(data || []);
      setCargando(false);
    };
    cargar();
  }, [usuarioId]);

  const postularse = async (solicitud: Solicitud) => {
    // Comprobar si ya existe una postulación del usuario para esta solicitud
    const { data: yaPostulado } = await supabase
      .from("postulaciones")
      .select("id")
      .eq("usuario_id", usuarioId)
      .eq("solicitud_id", solicitud.id)
      .maybeSingle();

    if (yaPostulado) {
      toast("Ya te has postulado a esta solicitud.");
      setPostulandoId(null);
      setMensaje("");
      return;
    }

    const { error } = await supabase.from("postulaciones").insert([
      {
        solicitud_id: solicitud.id,
        usuario_id: usuarioId,
        mensaje,
        estado: "pendiente",
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      toast.error("Error al postularte");
    } else {
      toast.success("Postulacion enviada!");
      setPostulandoId(null);
      setMensaje("");
    }
  };

  if (cargando) return <SkeletonList count={3} />;

  return (
    <div>
      <h3 className="text-lg font-semibold text-grey-800 mb-4">Solicitudes disponibles</h3>
      {solicitudes.length === 0 ? (
        <EmptyState
          icon="🔎"
          title="No hay solicitudes disponibles"
          description="No hay solicitudes publicas disponibles en este momento."
        />
      ) : (
        <div className="space-y-3">
          {solicitudes.map((s) => (
            <Card key={s.id} hover>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-grey-800">{s.categoria}</p>
                  <p className="text-sm text-grey-600 mt-1">{s.descripcion}</p>
                </div>
                {s.requiere_profesional && (
                  <Badge variant="warning">Requiere titulo</Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs text-grey-500">
                <span>📍 {s.ubicacion}</span>
                <span>🕓 {new Date(s.created_at).toLocaleString()}</span>
              </div>

              {postulandoId === s.id ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Mensaje para el cliente"
                    rows={2}
                    className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => postularse(s)}
                      disabled={!mensaje.trim()}
                    >
                      Enviar postulacion
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPostulandoId(null);
                        setMensaje("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setPostulandoId(s.id)}
                  >
                    Postularse
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolicitudesDisponibles;
