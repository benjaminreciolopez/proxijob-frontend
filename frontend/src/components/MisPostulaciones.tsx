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
