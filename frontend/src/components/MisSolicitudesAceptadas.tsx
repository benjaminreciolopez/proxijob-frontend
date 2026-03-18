import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import EmptyState from "./ui/EmptyState";
import { SkeletonList } from "./ui/Skeleton";
import Card from "./ui/Card";

interface Solicitud {
  id: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  requiere_profesional: boolean;
  created_at: string;
  usuario_id: string;
}

interface Usuario {
  nombre: string;
}

interface Postulacion {
  id: string;
  estado: string;
  usuario: Usuario | null;
  solicitud: Solicitud;
}

interface Props {
  usuarioId: string;
}

const MisSolicitudesAceptadas: React.FC<Props> = ({ usuarioId }) => {
  const [aceptadas, setAceptadas] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from("postulaciones")
        .select(
          `
          id,
          estado,
          usuario:usuario_id (
            nombre
          ),
          solicitud:solicitud_id (
            id,
            descripcion,
            categoria,
            ubicacion,
            requiere_profesional,
            usuario_id,
            created_at
          )
        `
        )
        .eq("estado", "aceptado")
        .order("created_at", { ascending: false });

      if (error) toast.error("Error cargando aceptadas");
      setAceptadas(
        (data || [])
          .filter(
            (p: any) => p.solicitud && p.solicitud.usuario_id === usuarioId
          )
          .map((p: any) => ({
            ...p,
            usuario: Array.isArray(p.usuario) ? p.usuario[0] : p.usuario,
            solicitud: Array.isArray(p.solicitud)
              ? p.solicitud[0]
              : p.solicitud,
          }))
      );
      setCargando(false);
    };
    cargar();
  }, [usuarioId]);

  if (cargando) return <SkeletonList count={3} />;

  return (
    <div>
      <h3 className="text-lg font-semibold text-grey-800 mb-4">Solicitudes con profesional aceptado</h3>
      {aceptadas.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Sin solicitudes aceptadas"
          description="No tienes solicitudes con profesional aceptado."
        />
      ) : (
        <div className="space-y-3">
          {aceptadas.map((p) => (
            <Card key={p.id}>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-grey-800">{p.solicitud?.categoria}</p>
                <p className="text-sm text-grey-600 mt-0.5">{p.solicitud?.descripcion}</p>
              </div>
              <div className="mt-3 space-y-1 text-sm text-grey-500">
                <p>Profesional: <span className="font-medium text-grey-800">{p.usuario?.nombre || "Sin nombre"}</span></p>
                <div className="flex items-center gap-4 text-xs">
                  <span>📍 {p.solicitud?.ubicacion}</span>
                  <span>🕓 {new Date(p.solicitud?.created_at || "").toLocaleString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisSolicitudesAceptadas;
