import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

interface Documento {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
}

interface Usuario {
  id: string;
  nombre: string;
}

interface Postulacion {
  id: string;
  usuario_id: string;
  mensaje: string;
  created_at: string;
  estado: string;
  solicitud: {
    id: string;
    descripcion: string;
    categoria: string;
    ubicacion: string;
    usuario_id: string;
    usuario: Usuario;
  };
  documentos?: Documento[];
  usuario?: Usuario; // quien postula
}

interface Props {
  usuarioId: string; // usuario que publica las solicitudes
  onData?: (postulaciones: Postulacion[]) => void;
}

const PostulacionesUsuario: React.FC<Props> = ({ usuarioId, onData }) => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [mostrarReseñas, setMostrarReseñas] = useState(false);
  const [postulacionSeleccionada, setPostulacionSeleccionada] =
    useState<Postulacion | null>(null);
  const [solicitudesReseñadas, setSolicitudesReseñadas] = useState<string[]>(
    []
  );
  const [puntuacion, setPuntuacion] = useState<number>(0);
  const [comentario, setComentario] = useState("");

  // FUNC: Trae postulaciones recibidas a solicitudes donde usuarioId es el autor de la solicitud
  useEffect(() => {
    const cargarPostulaciones = async () => {
      const { data, error } = await supabase
        .from("postulaciones")
        .select(
          `
            id,
            usuario_id,
            mensaje,
            estado,
            created_at,
            solicitud:solicitud_id (
              id,
              descripcion,
              categoria,
              ubicacion,
              usuario_id,
              usuario:usuario_id ( id, nombre )
            ),
            usuario:usuario_id ( id, nombre ),
            documentos:documentos_postulacion (
              id, tipo, titulo, url
            )
          `
        )
        .order("created_at", { ascending: false });

      if (error || !data) {
        toast.error("Error al cargar postulaciones.");
        return;
      }

      // Solo postulaciones a solicitudes donde el usuario actual es el autor (usuario_id)
      const filtered = (data as any[]).filter(
        (p) => p.solicitud && p.solicitud.usuario_id === usuarioId
      );
      setPostulaciones(filtered);

      if (onData) onData(filtered);
    };

    cargarPostulaciones();
  }, [usuarioId]);

  // FUNC: Actualiza estado de postulacion
  const actualizarEstado = async (
    postulacionId: string,
    nuevoEstado: string
  ) => {
    const postulacion = postulaciones.find((p) => p.id === postulacionId);
    if (!postulacion) return;

    // Si aceptas, descarta otras postulaciones para esa solicitud
    if (nuevoEstado === "aceptado") {
      const otras = postulaciones.filter(
        (p) =>
          p.solicitud.id === postulacion.solicitud.id &&
          p.id !== postulacionId &&
          p.estado !== "rechazado" &&
          p.estado !== "aceptado"
      );
      for (const otra of otras) {
        await supabase
          .from("postulaciones")
          .update({ estado: "descartado" })
          .eq("id", otra.id);
      }
    }

    const { error } = await supabase
      .from("postulaciones")
      .update({ estado: nuevoEstado })
      .eq("id", postulacionId);

    if (error) {
      toast.error("Error al actualizar estado");
      return;
    }

    if (nuevoEstado === "aceptado") {
      setPostulacionSeleccionada(postulacion);
      setMostrarReseñas(true);
    }

    setPostulaciones((prev) =>
      prev.map((p) => {
        if (p.id === postulacionId) return { ...p, estado: nuevoEstado };
        if (
          nuevoEstado === "aceptado" &&
          p.solicitud.id === postulacion.solicitud.id &&
          p.estado !== "rechazado" &&
          p.estado !== "aceptado"
        ) {
          return { ...p, estado: "descartado" };
        }
        return p;
      })
    );
  };

  // FUNC: Enviar resena al postulante aceptado
  const enviarReseñaDesdeModal = async () => {
    if (!postulacionSeleccionada) return;

    const solicitud_id = postulacionSeleccionada.solicitud.id;
    const autor_id = usuarioId;
    const autor_nombre = postulacionSeleccionada.solicitud.usuario.nombre;
    const destinatario_id = postulacionSeleccionada.usuario_id;
    const destinatario_n =
      postulacionSeleccionada.usuario?.nombre || "Sin nombre";

    if (!puntuacion || !autor_id || !solicitud_id || !destinatario_id) {
      toast.error("Faltan datos para enviar la resena.");
      return;
    }
    if (puntuacion >= 4 && comentario.trim() === "") {
      toast.error("Por favor, anade un comentario si la puntuacion es alta.");
      return;
    }

    const { data: existente, error: errorExistente } = await supabase
      .from("reseñas")
      .select("id")
      .eq("autor_id", autor_id)
      .eq("solicitud_id", solicitud_id)
      .maybeSingle();

    if (errorExistente && errorExistente.code !== "PGRST116") {
      toast.error("Error al comprobar resenas previas.");
      return;
    }
    if (existente) {
      toast.error("Ya has dejado una resena para esta solicitud.");
      setMostrarReseñas(false);
      return;
    }

    const reseñaData = {
      tipo: "usuario",
      autor_id,
      autor_nombre: autor_nombre || "Sin nombre",
      destinatario_id,
      destinatario_n,
      solicitud_id,
      puntuacion,
      comentario,
    };

    const { error } = await supabase.from("reseñas").insert([reseñaData]);
    if (error) {
      toast.error("Error al guardar la resena.");
      console.error(error);
    } else {
      toast.success("Gracias por tu resena!");
      setMostrarReseñas(false);
      setSolicitudesReseñadas((prev) => [...prev, solicitud_id]);
      setPuntuacion(0);
      setComentario("");
      setPostulacionSeleccionada(null);
    }
  };

  const contadores = {
    pendiente: postulaciones.filter((p) => p.estado === "pendiente").length,
    preseleccionado: postulaciones.filter((p) => p.estado === "preseleccionado")
      .length,
    aceptado: postulaciones.filter((p) => p.estado === "aceptado").length,
    rechazado: postulaciones.filter((p) => p.estado === "rechazado").length,
  };

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

  return (
    <>
      <div>
        <h3 className="text-lg font-semibold text-grey-800 mb-4">Postulaciones recibidas</h3>

        {/* Resumen de contadores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-warning">{contadores.pendiente}</p>
            <p className="text-xs text-grey-600">Pendientes</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{contadores.preseleccionado}</p>
            <p className="text-xs text-grey-600">Preseleccionadas</p>
          </div>
          <div className="bg-success/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-success">{contadores.aceptado}</p>
            <p className="text-xs text-grey-600">Aceptadas</p>
          </div>
          <div className="bg-error/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-error">{contadores.rechazado}</p>
            <p className="text-xs text-grey-600">Rechazadas</p>
          </div>
        </div>

        {postulaciones.length === 0 ? (
          <EmptyState
            icon="📨"
            title="Sin postulaciones"
            description="No hay postulaciones aun."
          />
        ) : (
          <div className="space-y-3">
            {postulaciones.map((p) => (
              <Card key={p.id}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-grey-800">{p.solicitud.categoria}</p>
                    <p className="text-sm text-grey-600 mt-0.5">{p.solicitud.descripcion}</p>
                  </div>
                  {estadoBadge(p.estado)}
                </div>

                {/* Details */}
                <div className="mt-3 space-y-1 text-sm text-grey-600">
                  <p>📍 {p.solicitud.ubicacion}</p>
                  <p>Postulante: <span className="font-medium text-grey-800">{p.usuario?.nombre || "Desconocido"}</span></p>
                  <p>Mensaje: {p.mensaje || "Sin mensaje"}</p>
                  <p className="text-xs text-grey-400">🕓 {new Date(p.created_at).toLocaleString()}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-grey-200">
                  {p.estado !== "aceptado" ? (
                    <select
                      value={p.estado}
                      onChange={(e) => actualizarEstado(p.id, e.target.value)}
                      className="rounded-md border border-grey-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="preseleccionado">Preseleccionado</option>
                      <option value="aceptado">Aceptado</option>
                      <option value="rechazado">Rechazado</option>
                    </select>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        type="button"
                        onClick={() => {
                          window.location.href = `/chat?usuario_id=${usuarioId}&postulante_id=${p.usuario_id}&solicitud_id=${p.solicitud.id}`;
                        }}
                      >
                        Iniciar chat con el postulante
                      </Button>
                      {!solicitudesReseñadas.includes(p.solicitud.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setPostulacionSeleccionada(p);
                            setMostrarReseñas(true);
                            setPuntuacion(0);
                            setComentario("");
                          }}
                        >
                          Dejar resena
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Documents */}
                {Array.isArray(p.documentos) && p.documentos.length > 0 && (
                  <details className="mt-4 pt-3 border-t border-grey-200">
                    <summary className="cursor-pointer text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                      Ver documentos adjuntos ({p.documentos.length})
                    </summary>
                    <ul className="mt-3 space-y-3">
                      {p.documentos.map((doc) => {
                        const ext = doc.url.split(".").pop()?.toLowerCase();
                        return (
                          <li key={doc.id}>
                            <p className="text-sm">
                              <span className="font-medium text-grey-800">{doc.tipo}</span>{" "}
                              <span className="text-grey-500">- {doc.titulo}</span>
                            </p>
                            {["jpg", "jpeg", "png", "webp"].includes(
                              ext || ""
                            ) ? (
                              <img
                                src={doc.url}
                                alt={doc.titulo}
                                className="max-w-full max-h-[300px] rounded-md mt-2"
                                loading="lazy"
                              />
                            ) : ext === "pdf" ? (
                              <embed
                                src={doc.url}
                                type="application/pdf"
                                width="100%"
                                height="300px"
                                className="mt-2 rounded-md"
                              />
                            ) : (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block mt-2 text-sm text-primary hover:text-primary-dark underline"
                                role="button"
                                tabIndex={0}
                              >
                                Ver / Descargar archivo
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de resena */}
      {mostrarReseñas && postulacionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-grey-800">
              Deja una resena para{" "}
              {postulacionSeleccionada.usuario?.nombre || "el postulante"}
            </h3>
            <select
              value={puntuacion}
              onChange={(e) => setPuntuacion(Number(e.target.value))}
              className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value={0}>Selecciona una puntuacion</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} estrella{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Comentario (obligatorio si das 4 o 5 estrellas)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-grey-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="success"
                onClick={enviarReseñaDesdeModal}
                disabled={!puntuacion}
                type="button"
              >
                Enviar resena
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setMostrarReseñas(false);
                  setPuntuacion(0);
                  setComentario("");
                  setPostulacionSeleccionada(null);
                }}
                type="button"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostulacionesUsuario;
