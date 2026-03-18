import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

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

  if (cargando) return <p>Cargando aceptadas...</p>;

  return (
    <div>
      <h3>✅ Solicitudes con profesional aceptado</h3>
      {aceptadas.length === 0 ? (
        <p>No tienes solicitudes con profesional aceptado.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {aceptadas.map((p) => (
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
              Profesional: <b>{p.usuario?.nombre || "Sin nombre"}</b>
              <br />
              📍 {p.solicitud?.ubicacion} | 🕓{" "}
              {new Date(p.solicitud?.created_at || "").toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MisSolicitudesAceptadas;
