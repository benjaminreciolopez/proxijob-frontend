import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

interface Props {
  clienteId: string;
  actualizar: number;
}

interface Solicitud {
  id: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  requiere_profesional: boolean;
  created_at: string;
}

const HistorialSolicitudes: React.FC<Props> = ({ clienteId, actualizar }) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    descripcion: "",
    categoria: "",
    ubicacion: "",
    requiere_profesional: false,
  });

  const fetchSolicitudes = async () => {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar el historial.");
      console.error(error.message);
    } else {
      setSolicitudes(data || []);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, [clienteId, actualizar]);

  const eliminarSolicitud = async (id: string) => {
    const confirmar = confirm("¿Seguro que quieres eliminar esta solicitud?");
    if (!confirmar) return;

    const { error } = await supabase.from("solicitudes").delete().eq("id", id);

    if (error) {
      toast.error("No se pudo eliminar.");
    } else {
      toast.success("Solicitud eliminada.");
      fetchSolicitudes();
    }
  };

  const iniciarEdicion = (s: Solicitud) => {
    setEditandoId(s.id);
    setFormData({
      descripcion: s.descripcion,
      categoria: s.categoria,
      ubicacion: s.ubicacion,
      requiere_profesional: s.requiere_profesional,
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormData({
      descripcion: "",
      categoria: "",
      ubicacion: "",
      requiere_profesional: false,
    });
  };

  const guardarCambios = async () => {
    if (!editandoId) return;

    const { error } = await supabase
      .from("solicitudes")
      .update({
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        ubicacion: formData.ubicacion,
        requiere_profesional: formData.requiere_profesional,
      })
      .eq("id", editandoId);

    if (error) {
      toast.error("No se pudo actualizar.");
    } else {
      toast.success("Solicitud actualizada.");
      cancelarEdicion();
      fetchSolicitudes();
    }
  };
  useEffect(() => {
    const canal = supabase
      .channel("solicitudes_historial")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "solicitudes",
          filter: `cliente_id=eq.${clienteId}`,
        },
        (payload) => {
          fetchSolicitudes(); // Actualiza el historial ante cualquier cambio
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [clienteId]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>📂 Historial de solicitudes</h3>
      {solicitudes.length === 0 ? (
        <p>No has publicado ninguna solicitud todavía.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {solicitudes.map((s) => (
            <li
              key={s.id}
              onClick={() =>
                setSeleccionada(seleccionada === s.id ? null : s.id)
              }
              style={{
                marginBottom: "1rem",
                border: "1px solid #ccc",
                padding: "1rem",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: seleccionada === s.id ? "#f9f9f9" : "#fff",
              }}
            >
              {editandoId === s.id ? (
                <>
                  <input
                    type="text"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    placeholder="Descripción"
                  />
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData({ ...formData, categoria: e.target.value })
                    }
                    placeholder="Categoría"
                  />
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) =>
                      setFormData({ ...formData, ubicacion: e.target.value })
                    }
                    placeholder="Ubicación"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.requiere_profesional}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requiere_profesional: e.target.checked,
                        })
                      }
                    />
                    ¿Requiere título?
                  </label>
                  <br />
                  <button onClick={guardarCambios}>💾 Guardar</button>
                  <button onClick={cancelarEdicion}>❌ Cancelar</button>
                </>
              ) : (
                <>
                  <strong>{s.categoria}</strong> — {s.descripcion}{" "}
                  {s.requiere_profesional && "(requiere título)"}
                  <br />
                  📍 {s.ubicacion} | 🕓{" "}
                  {new Date(s.created_at).toLocaleDateString()}
                  <br />
                  {seleccionada === s.id && (
                    <>
                      <button onClick={() => iniciarEdicion(s)}>
                        ✏️ Editar
                      </button>
                      <button onClick={() => eliminarSolicitud(s.id)}>
                        🗑️ Eliminar
                      </button>
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default HistorialSolicitudes;
