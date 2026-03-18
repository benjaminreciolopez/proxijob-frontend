import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

interface Props {
  usuarioId: string;
  actualizar: number;
  onData?: (solicitudes: any[]) => void;
}

interface Solicitud {
  id: string;
  descripcion: string;
  categoria: string;
  ubicacion: string;
  requiere_profesional: boolean;
  created_at: string;
  estado: string;
}

const HistorialSolicitudes: React.FC<Props> = ({
  usuarioId,
  actualizar,
  onData,
}) => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: "",
    categoria: "",
    ubicacion: "",
    requiere_profesional: false,
  });
  const [cargando, setCargando] = useState(false);

  const fetchSolicitudes = async () => {
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar el historial.");
      console.error(error.message);
    } else {
      setSolicitudes(data || []);
      if (onData) onData(data || []);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
    // eslint-disable-next-line
  }, [usuarioId, actualizar]);

  const eliminarSolicitud = async (id: string) => {
    const confirmar = confirm("Seguro que quieres eliminar esta solicitud?");
    if (!confirmar) return;
    setCargando(true);
    const { error } = await supabase.from("solicitudes").delete().eq("id", id);
    setCargando(false);

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
    setCargando(true);

    const solicitudActual = solicitudes.find((s) => s.id === editandoId);
    if (solicitudActual?.estado === "aceptado") {
      toast.error("No puedes editar una solicitud aceptada.");
      setCargando(false);
      cancelarEdicion();
      return;
    }

    const { error } = await supabase
      .from("solicitudes")
      .update({
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        ubicacion: formData.ubicacion,
        requiere_profesional: formData.requiere_profesional,
      })
      .eq("id", editandoId);

    setCargando(false);

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
          filter: `usuario_id=eq.${usuarioId}`,
        },
        () => {
          fetchSolicitudes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [usuarioId]);

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case "aceptado":
        return <Badge variant="success">Aceptado</Badge>;
      case "rechazado":
        return <Badge variant="error">Rechazado</Badge>;
      case "pendiente":
        return <Badge variant="warning">Pendiente</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="mt-8">
      <Button
        variant="outline"
        onClick={() => setMostrarHistorial(!mostrarHistorial)}
        disabled={cargando}
      >
        {mostrarHistorial
          ? "Ocultar historial"
          : `Ver historial de solicitudes (${solicitudes.length})`}
      </Button>

      {mostrarHistorial && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-grey-800 mb-4">Historial de solicitudes</h3>
          {solicitudes.length === 0 ? (
            <EmptyState
              icon="📂"
              title="Sin solicitudes"
              description="No has publicado ninguna solicitud todavia."
            />
          ) : (
            <div className="space-y-3">
              {solicitudes.map((s) => (
                <Card
                  key={s.id}
                  hover
                  onClick={() =>
                    setSeleccionada(seleccionada === s.id ? null : s.id)
                  }
                  className={`transition-all ${
                    cargando && editandoId === s.id ? "opacity-70" : ""
                  } ${seleccionada === s.id ? "ring-2 ring-primary/20" : ""}`}
                >
                  {editandoId === s.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.descripcion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            descripcion: e.target.value,
                          })
                        }
                        placeholder="Descripcion"
                        disabled={cargando}
                        className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                      />
                      <input
                        type="text"
                        value={formData.categoria}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoria: e.target.value,
                          })
                        }
                        placeholder="Categoria"
                        disabled={cargando}
                        className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                      />
                      <input
                        type="text"
                        value={formData.ubicacion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ubicacion: e.target.value,
                          })
                        }
                        placeholder="Ubicacion"
                        disabled={cargando}
                        className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.requiere_profesional}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              requiere_profesional: e.target.checked,
                            })
                          }
                          disabled={cargando}
                          className="rounded border-grey-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-grey-700">Requiere titulo?</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="success" onClick={guardarCambios} disabled={cargando}>
                          Guardar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelarEdicion} disabled={cargando}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-grey-800">
                            {s.categoria}
                            {s.requiere_profesional && (
                              <span className="ml-2 text-xs text-grey-500">(requiere titulo)</span>
                            )}
                          </p>
                          <p className="text-sm text-grey-600 mt-1">{s.descripcion}</p>
                        </div>
                        {estadoBadge(s.estado)}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-grey-500">
                        <span>📍 {s.ubicacion}</span>
                        <span>🕓 {new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                      {seleccionada === s.id && (
                        <div className="mt-3 pt-3 border-t border-grey-200">
                          {s.estado === "aceptado" ? (
                            <p className="text-sm text-success font-medium">
                              Esta solicitud fue aceptada y ya no puede modificarse.
                            </p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => iniciarEdicion(s)}
                                disabled={cargando}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => eliminarSolicitud(s.id)}
                                disabled={cargando}
                              >
                                Eliminar
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistorialSolicitudes;
