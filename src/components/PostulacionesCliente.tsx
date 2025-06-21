import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

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

      // <----- ESTA LÍNEA ES LA CLAVE -----
      if (onData) onData(filtered);
    };

    cargarPostulaciones();
  }, [usuarioId]);
  // FUNC: Actualiza estado de postulación
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
      toast.error("❌ Error al actualizar estado");
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

  // FUNC: Enviar reseña al postulante aceptado
  const enviarReseñaDesdeModal = async () => {
    if (!postulacionSeleccionada) return;

    const solicitud_id = postulacionSeleccionada.solicitud.id;
    const autor_id = usuarioId; // el cliente publica la solicitud
    const autor_nombre = postulacionSeleccionada.solicitud.usuario.nombre;
    const destinatario_id = postulacionSeleccionada.usuario_id; // el postulante
    const destinatario_n =
      postulacionSeleccionada.usuario?.nombre || "Sin nombre";

    if (!puntuacion || !autor_id || !solicitud_id || !destinatario_id) {
      toast.error("Faltan datos para enviar la reseña.");
      return;
    }
    if (puntuacion >= 4 && comentario.trim() === "") {
      toast.error("Por favor, añade un comentario si la puntuación es alta.");
      return;
    }

    const { data: existente, error: errorExistente } = await supabase
      .from("reseñas")
      .select("id")
      .eq("autor_id", autor_id)
      .eq("solicitud_id", solicitud_id)
      .maybeSingle();

    if (errorExistente && errorExistente.code !== "PGRST116") {
      toast.error("Error al comprobar reseñas previas.");
      return;
    }
    if (existente) {
      toast.error("Ya has dejado una reseña para esta solicitud.");
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
      toast.error("Error al guardar la reseña.");
      console.error(error);
    } else {
      toast.success("¡Gracias por tu reseña!");
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

  return (
    <>
      <div className="dashboard-section">
        <h3>📨 Postulaciones recibidas</h3>
        <div style={{ marginBottom: "1rem" }}>
          <strong>Resumen:</strong>
          <br />
          🕓 Pendientes: {contadores.pendiente} | 👁️‍🗨️ Preseleccionadas:{" "}
          {contadores.preseleccionado} | ✅ Aceptadas: {contadores.aceptado} |
          ❌ Rechazadas: {contadores.rechazado}
        </div>
        {postulaciones.length === 0 ? (
          <p>No hay postulaciones aún.</p>
        ) : (
          <ul className="postulaciones-lista">
            {postulaciones.map((p) => (
              <li key={p.id} className="postulacion-card">
                <div className="postulacion-header">
                  <div>
                    <p className="categoria">{p.solicitud.categoria}</p>
                    <p className="descripcion">{p.solicitud.descripcion}</p>
                  </div>
                  <span className={`estado estado-${p.estado}`}>
                    {(() => {
                      switch (p.estado) {
                        case "pendiente":
                          return "🕓 Pendiente";
                        case "preseleccionado":
                          return "👁️‍🗨️ Preseleccionado";
                        case "aceptado":
                          return "✅ Aceptado";
                        case "rechazado":
                          return "❌ Rechazado";
                        case "descartado":
                          return "🚫 Descartado";
                        default:
                          return p.estado;
                      }
                    })()}
                  </span>
                </div>
                <div className="postulacion-detalles">
                  <p>📍 {p.solicitud.ubicacion}</p>
                  <p>🧑‍💼 Postulante: {p.usuario?.nombre || "Desconocido"}</p>
                  <p>✉️ Mensaje: {p.mensaje || "Sin mensaje"}</p>
                  <p>🕓 Fecha: {new Date(p.created_at).toLocaleString()}</p>
                </div>
                <div className="postulacion-acciones">
                  {p.estado !== "aceptado" ? (
                    <select
                      value={p.estado}
                      onChange={(e) => actualizarEstado(p.id, e.target.value)}
                    >
                      <option value="pendiente">🕓 Pendiente</option>
                      <option value="preseleccionado">
                        👁️‍🗨️ Preseleccionado
                      </option>
                      <option value="aceptado">✅ Aceptado</option>
                      <option value="rechazado">❌ Rechazado</option>
                    </select>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `/chat?usuario_id=${usuarioId}&postulante_id=${p.usuario_id}&solicitud_id=${p.solicitud.id}`;
                        }}
                      >
                        💬 Iniciar chat con el postulante
                      </button>
                      {!solicitudesReseñadas.includes(p.solicitud.id) && (
                        <button
                          type="button"
                          onClick={() => {
                            setPostulacionSeleccionada(p);
                            setMostrarReseñas(true);
                            setPuntuacion(0);
                            setComentario("");
                          }}
                        >
                          ✍️ Dejar reseña
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {Array.isArray(p.documentos) && p.documentos.length > 0 && (
                  <details className="postulacion-docs">
                    <summary>
                      📎 Ver documentos adjuntos ({p.documentos.length})
                    </summary>
                    <ul>
                      {p.documentos.map((doc) => {
                        const ext = doc.url.split(".").pop()?.toLowerCase();
                        return (
                          <li key={doc.id} style={{ marginTop: "0.5rem" }}>
                            <p>
                              <strong>{doc.tipo}</strong> — {doc.titulo}
                            </p>
                            {["jpg", "jpeg", "png", "webp"].includes(
                              ext || ""
                            ) ? (
                              <img
                                src={doc.url}
                                alt={doc.titulo}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "300px",
                                }}
                                loading="lazy"
                              />
                            ) : ext === "pdf" ? (
                              <embed
                                src={doc.url}
                                type="application/pdf"
                                width="100%"
                                height="300px"
                              />
                            ) : (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="documento-enlace"
                                role="button"
                                tabIndex={0}
                              >
                                📄 Ver / Descargar archivo
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Modal de reseña FUERA del contenido principal */}
      {mostrarReseñas && postulacionSeleccionada && (
        <div className="modal-reseña-overlay">
          <div className="modal-reseña">
            <h3>
              ✍️ Deja una reseña para{" "}
              {postulacionSeleccionada.usuario?.nombre || "el postulante"}
            </h3>
            <select
              value={puntuacion}
              onChange={(e) => setPuntuacion(Number(e.target.value))}
            >
              <option value={0}>Selecciona una puntuación</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} ⭐
                </option>
              ))}
            </select>
            <textarea
              placeholder="Comentario (obligatorio si das 4 o 5 estrellas)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
            />
            <div className="modal-reseña-buttons">
              <button
                className="enviar"
                onClick={enviarReseñaDesdeModal}
                disabled={!puntuacion}
                type="button"
              >
                Enviar reseña
              </button>
              <button
                className="cancelar"
                onClick={() => {
                  setMostrarReseñas(false);
                  setPuntuacion(0);
                  setComentario("");
                  setPostulacionSeleccionada(null);
                }}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostulacionesUsuario;
