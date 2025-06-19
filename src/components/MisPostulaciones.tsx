// src/components/MisPostulaciones.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

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
      const { data, error } = await supabase
        .from("postulaciones")
        .select(
          `
          id,
          mensaje,
          estado,
          created_at,
          solicitud:solicitud_id (
            id,
            descripcion,
            categoria,
            ubicacion,
            requiere_profesional
          )
        `
        )
        .eq("oferente_id", usuarioId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error cargando postulaciones");
        setCargando(false);
        return;
      }

      // 👇 Normalización aquí:
      const normalizadas: Postulacion[] = (data ?? [])
        .map((raw: any) => {
          const solicitud = Array.isArray(raw.solicitud)
            ? raw.solicitud[0]
            : raw.solicitud;
          if (!solicitud || !solicitud.id) return null;
          return {
            id: raw.id,
            mensaje: raw.mensaje,
            estado: raw.estado,
            created_at: raw.created_at,
            solicitud,
          } as Postulacion;
        })
        .filter((p): p is Postulacion => p !== null); // <--- ESTA LÍNEA ES LA CLAVE

      setPostulaciones(normalizadas);
      setCargando(false);
    };
    cargar();
  }, [usuarioId]);

  if (cargando) return <p>Cargando postulaciones...</p>;

  return (
    <div>
      <h3>📨 Mis postulaciones</h3>
      {postulaciones.length === 0 ? (
        <p>No has postulado a ninguna solicitud todavía.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {postulaciones.map((p) => (
            <li
              key={p.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                background: "#f8f8fa",
              }}
            >
              <strong>{p.solicitud?.categoria}</strong> —{" "}
              {p.solicitud?.descripcion}
              <br />
              Estado: <b>{p.estado}</b>
              <br />
              Mensaje: {p.mensaje}
              <br />
              🕓 {new Date(p.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisPostulaciones;
