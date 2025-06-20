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

const RELACIONES = [
  "solicitud",
  "solicitudes",
  "postulaciones_solicitud_id_fkey1",
];

const MisPostulaciones: React.FC<Props> = ({ usuarioId }) => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nombreRelacion, setNombreRelacion] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);

      let ultimaErrorMsg = "";
      for (const relacion of RELACIONES) {
        const { data, error } = await supabase
          .from("postulaciones")
          .select(
            `
              id,
              mensaje,
              estado,
              created_at,
              ${relacion} (
                id,
                descripcion,
                categoria,
                ubicacion,
                requiere_profesional
              )
            `
          )
          .eq("usuario_id", usuarioId)
          .order("created_at", { ascending: false });

        if (!error) {
          setNombreRelacion(relacion);

          const normalizadas: Postulacion[] = (data ?? [])
            .map((raw: any) => {
              const solicitud = Array.isArray(raw[relacion])
                ? raw[relacion][0]
                : raw[relacion];
              if (!solicitud || !solicitud.id) return null;
              return {
                id: raw.id,
                mensaje: raw.mensaje,
                estado: raw.estado,
                created_at: raw.created_at,
                solicitud,
              } as Postulacion;
            })
            .filter((p): p is Postulacion => p !== null);

          setPostulaciones(normalizadas);
          setCargando(false);
          return;
        } else {
          ultimaErrorMsg = error.message;
          // Debug info para ti:
          // eslint-disable-next-line
          console.log(`Relación "${relacion}" → Error: ${error.message}`);
        }
      }
      // Si ninguna relación funciona
      toast.error(
        "No se ha podido cargar postulaciones (revisa relaciones en Supabase)"
      );
      setPostulaciones([]);
      setNombreRelacion(null);
      setCargando(false);
    };
    cargar();
  }, [usuarioId]);

  if (cargando) return <p>Cargando postulaciones...</p>;

  return (
    <div>
      <h3>📨 Mis postulaciones</h3>
      {nombreRelacion && (
        <div style={{ fontSize: "0.95em", color: "#888", marginBottom: 8 }}>
          <span>
            Relación usada: <b>{nombreRelacion}</b>
          </span>
        </div>
      )}
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
      {!nombreRelacion && (
        <div style={{ color: "#b02d2d", marginTop: 12 }}>
          ⚠️ No se pudo detectar relación válida para expandir solicitudes.
        </div>
      )}
    </div>
  );
};

export default MisPostulaciones;
