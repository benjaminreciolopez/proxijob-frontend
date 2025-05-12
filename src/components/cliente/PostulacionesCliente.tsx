import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

interface Documento {
  id: string;
  tipo: string;
  titulo: string;
  url: string;
}

interface Postulacion {
  id: string;
  oferente_id: string;
  mensaje: string;
  created_at: string;
  estado: string;
  solicitud: {
    id: string;
    descripcion: string;
    categoria: string;
    ubicacion: string;
    cliente_id: string;
    cliente: {
      id: string;
      nombre: string;
    };
  };
  documentos?: Documento[];
  oferente?: {
    id: string;
    nombre: string;
    especialidad: string;
    descripcion: string;
  };
  cliente?: {
    id: string;
    nombre: string;
  };
}

interface Props {
  clienteId: string;
}

const PostulacionesCliente: React.FC<Props> = ({ clienteId }) => {
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);

  useEffect(() => {
    const cargarPostulaciones = async () => {
      const { data, error } = await supabase
        .from("postulaciones")
        .select(
          `
        id,
        oferente_id,
        mensaje,
        estado,
        created_at,
        solicitud:solicitud_id (
          id,
          descripcion,
          categoria,
          ubicacion,
          cliente_id,
          cliente:cliente_id ( id, nombre )
        ),
        oferente:oferente_id (
          id,
          nombre,
          especialidad,
          descripcion
        ),
        documentos:documentos_postulacion (
          id,
          tipo,
          titulo,
          url
        )
      `
        )
        .order("created_at", { ascending: false });

      if (error || !data) {
        console.error("Error al cargar postulaciones:", error?.message);
        return;
      }

      const normalizadas = data
        .map((raw: any) => {
          const solicitud = Array.isArray(raw.solicitud)
            ? raw.solicitud[0]
            : raw.solicitud;
          const cliente = Array.isArray(solicitud?.cliente)
            ? solicitud.cliente[0]
            : solicitud?.cliente;

          if (!solicitud || !cliente || solicitud.cliente_id !== clienteId)
            return null;

          return {
            id: raw.id,
            oferente_id: raw.oferente_id,
            mensaje: raw.mensaje,
            estado: raw.estado,
            created_at: raw.created_at,
            solicitud: {
              id: solicitud.id,
              descripcion: solicitud.descripcion,
              categoria: solicitud.categoria,
              ubicacion: solicitud.ubicacion,
              cliente_id: solicitud.cliente_id,
              cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
              },
            },
            oferente: Array.isArray(raw.oferente)
              ? raw.oferente[0]
              : raw.oferente,
            documentos: Array.isArray(raw.documentos) ? raw.documentos : [],
          } as Postulacion;
        })
        .filter((p: Postulacion | null): p is Postulacion => p !== null);

      setPostulaciones(normalizadas);
    };

    cargarPostulaciones();
  }, [clienteId]);

  useEffect(() => {
    const canal = supabase
      .channel("postulaciones_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "postulaciones" },
        async (payload) => {
          const tipo = payload.eventType;
          const nueva = payload.new as { id: string } | null;
          const antigua = payload.old as
            | ({ id: string } & { solicitud?: { cliente_id?: string } })
            | null;

          if ((tipo === "INSERT" || tipo === "UPDATE") && nueva?.id) {
            const { data, error } = await supabase
              .from("postulaciones")
              .select(
                `
              id,
              oferente_id,
              mensaje,
              estado,
              created_at,
              solicitud:solicitud_id (
                id,
                descripcion,
                categoria,
                ubicacion,
                cliente_id,
                cliente:cliente_id ( id, nombre )
              ),
              oferente:oferente_id (
                id,
                nombre,
                especialidad,
                descripcion
              ),
              documentos:documentos_postulacion (
                id,
                tipo,
                titulo,
                url
              )
            `
              )
              .eq("id", nueva.id)
              .maybeSingle();

            if (error || !data) return;

            // Normaliza datos anidados
            const solicitud = Array.isArray(data.solicitud)
              ? data.solicitud[0]
              : data.solicitud;

            const cliente = Array.isArray(solicitud?.cliente)
              ? solicitud.cliente[0]
              : solicitud?.cliente;

            if (!solicitud || !cliente) return;
            if (solicitud.cliente_id !== clienteId) return;

            const postulacionNormalizada: Postulacion = {
              id: data.id,
              oferente_id: data.oferente_id,
              mensaje: data.mensaje,
              estado: data.estado,
              created_at: data.created_at,
              solicitud: {
                id: solicitud.id,
                descripcion: solicitud.descripcion,
                categoria: solicitud.categoria,
                ubicacion: solicitud.ubicacion,
                cliente_id: solicitud.cliente_id,
                cliente: {
                  id: cliente.id,
                  nombre: cliente.nombre,
                },
              },
              oferente: Array.isArray(data.oferente)
                ? data.oferente[0]
                : data.oferente,
              documentos: Array.isArray(data.documentos) ? data.documentos : [],
            };

            setPostulaciones((prev) => {
              const sinAntigua = prev.filter(
                (p) => p.id !== postulacionNormalizada.id
              );
              return [postulacionNormalizada, ...sinAntigua];
            });
          }

          if (
            tipo === "DELETE" &&
            antigua?.solicitud?.cliente_id === clienteId
          ) {
            setPostulaciones((prev) => prev.filter((p) => p.id !== antigua.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [clienteId]);

  useEffect(() => {
    const canalDocs = supabase
      .channel("documentos_postulacion_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "documentos_postulacion",
        },
        async (payload) => {
          const { new: nuevo, old } = payload;

          const postulacionId =
            (nuevo as { postulacion_id?: string })?.postulacion_id ||
            (old as { postulacion_id?: string })?.postulacion_id;
          if (!postulacionId) return;

          // Reconsultar la postulación a la que pertenece el documento
          const { data, error } = await supabase
            .from("postulaciones")
            .select(
              `
            id,
            oferente_id,
            mensaje,
            estado,
            created_at,
            solicitud:solicitud_id (
              id,
              descripcion,
              categoria,
              ubicacion,
              cliente_id,
              cliente:cliente_id ( id, nombre )
            ),
            oferente:oferente_id (
              id,
              nombre,
              especialidad,
              descripcion
            ),
            documentos:documentos_postulacion (
              id,
              tipo,
              titulo,
              url
            )
          `
            )
            .eq("id", postulacionId)
            .maybeSingle();

          if (error || !data) return;

          const solicitud = Array.isArray(data.solicitud)
            ? data.solicitud[0]
            : data.solicitud;
          const cliente = Array.isArray(solicitud?.cliente)
            ? solicitud.cliente[0]
            : solicitud?.cliente;

          if (!solicitud || !cliente || solicitud.cliente_id !== clienteId)
            return;

          const postulacionNormalizada: Postulacion = {
            id: data.id,
            oferente_id: data.oferente_id,
            mensaje: data.mensaje,
            estado: data.estado,
            created_at: data.created_at,
            solicitud: {
              id: solicitud.id,
              descripcion: solicitud.descripcion,
              categoria: solicitud.categoria,
              ubicacion: solicitud.ubicacion,
              cliente_id: solicitud.cliente_id,
              cliente: {
                id: cliente.id,
                nombre: cliente.nombre,
              },
            },
            oferente: Array.isArray(data.oferente)
              ? data.oferente[0]
              : data.oferente,
            documentos: Array.isArray(data.documentos) ? data.documentos : [],
          };

          setPostulaciones((prev) => {
            const sinAntigua = prev.filter((p) => p.id !== postulacionId);
            return [postulacionNormalizada, ...sinAntigua];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canalDocs);
    };
  }, [clienteId]);

  const actualizarEstado = async (
    postulacionId: string,
    nuevoEstado: string
  ) => {
    const postulacion = postulaciones.find((p) => p.id === postulacionId);
    if (!postulacion) return;

    // 1. Si es una aceptación, primero descartar las demás
    if (nuevoEstado === "aceptado") {
      // Obtener todas las postulaciones de esa solicitud, excepto la seleccionada
      const otrasPostulaciones = postulaciones.filter(
        (p) =>
          p.solicitud.id === postulacion.solicitud.id &&
          p.id !== postulacionId &&
          p.estado !== "rechazado" &&
          p.estado !== "aceptado"
      );

      // 2. Actualizar el estado de esas a "descartado"
      const updates = otrasPostulaciones.map((p) => ({
        id: p.id,
        estado: "descartado",
      }));

      // 3. Ejecutar actualizaciones en lote
      for (const update of updates) {
        await supabase
          .from("postulaciones")
          .update({ estado: update.estado })
          .eq("id", update.id);
      }
    }

    // 4. Actualizar la postulación actual al nuevo estado
    const { error } = await supabase
      .from("postulaciones")
      .update({ estado: nuevoEstado })
      .eq("id", postulacionId);

    if (error) {
      toast.error("❌ Error al actualizar estado");
      return;
    }

    // 5. Actualizar estado local
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

  // Contadores de estados
  const contadores = {
    pendiente: postulaciones.filter((p) => p.estado === "pendiente").length,
    preseleccionado: postulaciones.filter((p) => p.estado === "preseleccionado")
      .length,
    aceptado: postulaciones.filter((p) => p.estado === "aceptado").length,
    rechazado: postulaciones.filter((p) => p.estado === "rechazado").length,
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>📨 Postulaciones recibidas</h3>

      <div style={{ marginBottom: "1rem" }}>
        <strong>Resumen:</strong>
        <br />
        🕓 Pendientes: {contadores.pendiente} | 👁️‍🗨️ Preseleccionadas:{" "}
        {contadores.preseleccionado} | ✅ Aceptadas: {contadores.aceptado} | ❌
        Rechazadas: {contadores.rechazado}
      </div>

      {postulaciones.length === 0 ? (
        <p>No hay postulaciones aún.</p>
      ) : (
        <ul>
          {postulaciones.map((p) => (
            <li key={p.id} style={{ marginBottom: "1rem" }}>
              <strong>{p.solicitud.categoria}</strong> —{" "}
              {p.solicitud.descripcion}
              <br />
              📍 {p.solicitud.ubicacion}
              <br />
              🧑‍💼 Oferente: {p.oferente?.nombre || p.oferente_id}
              <br />
              👷 Especialidad: {p.oferente?.especialidad || "No especificada"}
              <br />
              📝 Perfil: {p.oferente?.descripcion || "Sin descripción"}
              <br />
              ✉️ Mensaje: {p.mensaje || "Sin mensaje"}
              <br />
              🕓 Fecha: {new Date(p.created_at).toLocaleString()}
              <br />
              {p.estado !== "aceptado" && (
                <label>
                  Estado:
                  <select
                    value={p.estado}
                    onChange={(e) => actualizarEstado(p.id, e.target.value)}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    <option value="pendiente">🕓 Pendiente</option>
                    <option value="preseleccionado">👁️‍🗨️ Preseleccionado</option>
                    <option value="aceptado">✅ Aceptado</option>
                    <option value="rechazado">❌ Rechazado</option>
                  </select>
                </label>
              )}
              {p.estado === "aceptado" && (
                <button
                  onClick={() => {
                    window.location.href = `/chat?cliente_id=${clienteId}&oferente_id=${p.oferente_id}&solicitud_id=${p.solicitud.id}`;
                  }}
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  💬 Iniciar chat con el oferente
                </button>
              )}
              {p.documentos && p.documentos.length > 0 && (
                <details style={{ marginTop: "0.5rem" }}>
                  <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                    📎 Ver documentos adjuntos ({p.documentos.length})
                  </summary>
                  <ul style={{ marginTop: "0.5rem" }}>
                    {p.documentos.map((doc) => {
                      const extension = doc.url.split(".").pop()?.toLowerCase();
                      return (
                        <li key={doc.id} style={{ marginBottom: "1rem" }}>
                          <p>
                            <strong>{doc.tipo}</strong> — {doc.titulo}
                          </p>
                          {["png", "jpg", "jpeg", "webp"].includes(
                            extension || ""
                          ) ? (
                            <img
                              src={doc.url}
                              alt={doc.titulo}
                              style={{ maxWidth: "100%", maxHeight: "300px" }}
                            />
                          ) : extension === "pdf" ? (
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
                              style={{
                                display: "inline-block",
                                padding: "0.5rem 1rem",
                                background: "#007bff",
                                color: "#fff",
                                borderRadius: "4px",
                                textDecoration: "none",
                              }}
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
  );
};

export default PostulacionesCliente;
