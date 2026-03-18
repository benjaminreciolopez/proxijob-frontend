// src/components/SolicitudesDisponibles.tsx
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
      toast.success("¡Postulación enviada!");
      setPostulandoId(null);
      setMensaje("");
    }
  };

  if (cargando) return <p>Cargando solicitudes...</p>;

  return (
    <div>
      <h3>🔎 Solicitudes disponibles</h3>
      {solicitudes.length === 0 ? (
        <p>No hay solicitudes públicas disponibles.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {solicitudes.map((s) => (
            <li
              key={s.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                background: "#f8f8fa",
              }}
            >
              <strong>{s.categoria}</strong> — {s.descripcion}
              <br />
              📍 {s.ubicacion} | 🕓 {new Date(s.created_at).toLocaleString()}
              <br />
              {s.requiere_profesional && (
                <span style={{ color: "blue" }}>
                  ⚠️ Requiere titulación/acreditación
                </span>
              )}
              <br />
              {postulandoId === s.id ? (
                <div style={{ marginTop: 8 }}>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Mensaje para el cliente"
                    rows={2}
                    style={{ width: "100%", marginBottom: 8 }}
                  />
                  <button
                    onClick={() => postularse(s)}
                    style={{ marginRight: 8 }}
                    disabled={!mensaje.trim()}
                  >
                    ✅ Enviar postulación
                  </button>
                  <button
                    onClick={() => {
                      setPostulandoId(null);
                      setMensaje("");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  style={{ marginTop: 8 }}
                  onClick={() => setPostulandoId(s.id)}
                >
                  Postularse
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SolicitudesDisponibles;
