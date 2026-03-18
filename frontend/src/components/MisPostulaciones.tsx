import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
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
}

interface Postulacion {
  id: string;
  mensaje: string;
  estado: string;
  created_at: string;
  solicitud: Solicitud;
}

interface Props {
  usuarioId: string;
}

const MisPostulaciones: React.FC<Props> = ({ usuarioId }) => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);

      // 1. Obtener las postulaciones
      const { data: posts, error } = await supabase
        .from("postulaciones")
        .select("id, mensaje, estado, created_at, solicitud_id")
        .eq("usuario_id", usuarioId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error cargando postulaciones");
        setPostulaciones([]);
        setCargando(false);
        return;
      }
      if (!posts || posts.length === 0) {
        setPostulaciones([]);
        setCargando(false);
        return;
      }

      // 2. Obtener todas las solicitudes relacionadas
      const solicitudIds = posts
        .map((p: any) => p.solicitud_id)
        .filter((id, idx, arr) => id && arr.indexOf(id) === idx); // Sin duplicados ni nulls

      const { data: solicitudes, error: error2 } = await supabase
        .from("solicitudes")
        .select("id, descripcion, categoria, ubicacion, requiere_profesional")
        .in("id", solicitudIds);

      if (error2) {
        toast.error("Error cargando datos de solicitudes");
        setPostulaciones([]);
        setCargando(false);
        return;
      }

      // 3. Juntar datos
      const solicitudesMap = new Map(
        (solicitudes ?? []).map((s: any) => [s.id, s])
      );
      const normalizadas: Postulacion[] = posts.map((raw: any) => ({
        id: raw.id,
        mensaje: raw.mensaje,
        estado: raw.estado,
        created_at: raw.created_at,
        solicitud: solicitudesMap.get(raw.solicitud_id),
      }));

      setPostulaciones(normalizadas.filter((p) => !!p.solicitud));
      setCargando(false);
    };
    cargar();
  }, [usuarioId]);

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Badge variant="warning">Pendiente</Badge>;
      case "preseleccionado":
        return <Badge variant="info">Preseleccionado</Badge>;
      case "aceptado":
        return <Badge variant="success">Aceptado</Badge>;
      case "rechazado":
        return <Badge variant="error">Rechazado</Badge>;
      case "descartado":
        return <Badge>Descartado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  if (cargando) return <SkeletonList count={3} />;

  return (
    <div>
      <h3 className="text-lg font-semibold text-grey-800 mb-4">Mis postulaciones</h3>
      {postulaciones.length === 0 ? (
        <EmptyState
          icon="📨"
          title="Sin postulaciones"
          description="No has postulado a ninguna solicitud todavia."
        />
      ) : (
        <div className="space-y-3">
          {postulaciones.map((p) => (
            <Card key={p.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-grey-800">{p.solicitud?.categoria}</p>
                  <p className="text-sm text-grey-600 mt-0.5">{p.solicitud?.descripcion}</p>
                </div>
                {estadoBadge(p.estado)}
              </div>
              <div className="mt-3 space-y-1 text-sm text-grey-500">
                <p>Mensaje: <span className="text-grey-700">{p.mensaje}</span></p>
                <p className="text-xs">🕓 {new Date(p.created_at).toLocaleString()}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPostulaciones;
