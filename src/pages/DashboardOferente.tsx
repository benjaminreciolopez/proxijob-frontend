import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import DocumentosOferente from "../components/oferente/DocumentosOferente";
import ZonasOferente from "../components/oferente/ZonasOferente";
import {
  filtrarSolicitudesPorZonas,
  ZonaTrabajo,
  Solicitud,
} from "../utils/geo";
import toast from "react-hot-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import NotificacionFlotante from "../components/NotificacionFlotante"; // arriba del todo
import { AnimatePresence } from "framer-motion"; // también
import "../styles/dashboard.css";
import CrearReseña from "./CrearReseña";

const DashboardOferente: React.FC = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [zonas, setZonas] = useState<ZonaTrabajo[]>([]);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [mostrarReseña, setMostrarReseña] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [reseñaEnviada, setReseñaEnviada] = useState(false);

  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState<Solicitud[]>(
    []
  );
  const [notificacion, setNotificacion] = useState<string | null>(null);
  const [postulacionesIds, setPostulacionesIds] = useState<Set<string>>(
    new Set()
  );
  const [usuario, setUsuario] = useState<UsuarioExtendido | null>(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true); // 👈 nuevo estado

  async function registrarCategoria(usuarioId: string, nombre: string) {
    const nombreNormalizado = nombre.trim().toLowerCase();

    // Verifica si ya existe la categoría
    const { data: existentes } = await supabase
      .from("categorias")
      .select("id")
      .ilike("nombre", nombreNormalizado)
      .single();

    let categoriaId: string | null = null;

    if (existentes) {
      categoriaId = existentes.id;
    } else {
      const { data: nueva, error: errorInsert } = await supabase
        .from("categorias")
        .insert([{ nombre: nombreNormalizado }])
        .select()
        .single();

      if (errorInsert || !nueva) {
        toast.error("❌ No se ha podido registrar la nueva categoría.");
        return;
      }

      categoriaId = nueva.id;
    }

    // Verifica si ya está asociada (uso de .match() para evitar error 400)
    const { data: yaAsociada, error: errorYaAsociada } = await supabase
      .from("categorias_oferente")
      .select("*")
      .match({
        oferente_id: usuarioId,
        categoria_id: categoriaId,
      })
      .maybeSingle();

    if (!yaAsociada) {
      if (!usuarioId || !categoriaId) {
        console.warn("❌ ID inválido para asociación:", {
          usuarioId,
          categoriaId,
        });
        return;
      }

      const { error: errorInsertRelacion } = await supabase
        .from("categorias_oferente")
        .insert([
          {
            oferente_id: usuarioId,
            categoria_id: categoriaId,
          },
        ]);

      if (errorInsertRelacion) {
        console.error(
          "❌ Error al insertar en categorias_oferente:",
          errorInsertRelacion.message
        );
        toast.error("⚠️ No se ha podido asociar la categoría al oferente.");
      }
    }
  }

  interface UsuarioExtendido {
    id: string;
    email: string;
    nombre: string;
    especialidad: string;
    descripcion: string;
    tratamiento: string;
  }

  const [solicitudAceptada, setSolicitudAceptada] = useState<{
    solicitud_id: string;
    cliente_id: string;
  } | null>(null);

  // ✅ 1. Obtener usuario
  useEffect(() => {
    const obtenerUsuario = async () => {
      // 1. Obtener usuario autenticado
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("No estás autenticado.");
        setUsuario(null);
        setCargandoUsuario(false);
        return;
      }

      // 2. Obtener datos del perfil del usuario
      const { data: datosUsuario, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("nombre, especialidad, tratamiento, descripcion")
        .eq("id", user.id)
        .single();

      if (errorUsuario || !datosUsuario) {
        toast.error("Error al obtener datos del oferente.");
        setUsuario(null);
        setCargandoUsuario(false);
        return;
      }

      const datosExtendidos: UsuarioExtendido = {
        id: user.id,
        email: user.email ?? "",
        nombre: datosUsuario.nombre,
        especialidad: datosUsuario.especialidad,
        descripcion: datosUsuario.descripcion,
        tratamiento: datosUsuario.tratamiento,
      };

      setUsuario(datosExtendidos);

      if (datosUsuario.especialidad) {
        registrarCategoria(user.id, datosUsuario.especialidad);
      }

      // 3. Consultar si tiene alguna postulación aceptada
      const { data: aceptada, error: errorAceptada } = await supabase
        .from("postulaciones")
        .select("solicitud_id")
        .eq("oferente_id", user.id)
        .eq("estado", "aceptado")
        .maybeSingle();

      if (errorAceptada || !aceptada?.solicitud_id) {
        setSolicitudAceptada(null);
        setCargandoUsuario(false);
        return;
      }

      console.warn("⚠️ No hay solicitud aceptada");

      const solicitud_id = aceptada.solicitud_id;

      // 4. Obtener cliente_id relacionado
      const { data: solicitudRelacionada } = await supabase
        .from("solicitudes")
        .select("cliente_id")
        .eq("id", solicitud_id)
        .single();

      const cliente_id = solicitudRelacionada?.cliente_id ?? "";
      setSolicitudAceptada({ solicitud_id, cliente_id });

      // 5. Verificar si ya se dejó reseña
      const { data: yaReseñada } = await supabase
        .from("reseñas")
        .select("id")
        .eq("usuario_id", user.id)
        .eq("solicitud_id", solicitud_id)
        .maybeSingle();

      setReseñaEnviada(!!yaReseñada);
      setCargandoUsuario(false);
    };

    obtenerUsuario();
  }, []);

  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  // ✅ 2. Realtime listener para solicitudes (este era el que causaba el error por estar después del `return`)
  useEffect(() => {
    if (!usuario) return;

    const canal: RealtimeChannel = supabase
      .channel("solicitudes_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "solicitudes" },
        async (payload) => {
          const tipoEvento = payload.eventType;
          const nuevaSolicitud = payload.new as Solicitud | null;
          const solicitudAnterior = payload.old as Solicitud | null;

          console.log(`📡 Evento realtime [${tipoEvento}]`, payload);

          // ✅ INSERT
          if (tipoEvento === "INSERT" && nuevaSolicitud) {
            if (Array.isArray(nuevaSolicitud.cliente)) {
              nuevaSolicitud.cliente = nuevaSolicitud.cliente[0];
            }

            const esCompatible =
              zonas.length > 0 &&
              filtrarSolicitudesPorZonas([nuevaSolicitud], zonas).length > 0;

            const { data: categoriasCompatibles } = await supabase
              .from("categorias_oferente")
              .select("*")
              .eq("oferente_id", usuario.id)
              .eq("categoria_id", nuevaSolicitud.categoria_id);

            if (
              esCompatible &&
              Array.isArray(categoriasCompatibles) &&
              categoriasCompatibles.length > 0
            ) {
              setSolicitudes((prev) => [...prev, nuevaSolicitud]);
              setSolicitudesFiltradas((prev) => [...prev, nuevaSolicitud]);
              setNotificacion("📬 Nueva solicitud disponible en tu zona");
              setTimeout(() => setNotificacion(null), 5000);
            }
          }

          // ✅ DELETE
          if (tipoEvento === "DELETE" && solicitudAnterior) {
            const eliminadaId = solicitudAnterior.id;
            setSolicitudes((prev) => prev.filter((s) => s.id !== eliminadaId));
            setSolicitudesFiltradas((prev) =>
              prev.filter((s) => s.id !== eliminadaId)
            );
          }

          // ✅ UPDATE
          if (tipoEvento === "UPDATE" && nuevaSolicitud) {
            if (Array.isArray(nuevaSolicitud.cliente)) {
              nuevaSolicitud.cliente = nuevaSolicitud.cliente[0];
            }

            setSolicitudes((prev) =>
              prev
                .map((s) => (s.id === nuevaSolicitud.id ? nuevaSolicitud : s))
                .filter((s): s is Solicitud => s !== null)
            );

            const visibles = filtrarSolicitudesPorZonas(
              [nuevaSolicitud],
              zonas
            );

            setSolicitudesFiltradas((prev) =>
              visibles.length > 0
                ? [
                    ...prev.filter((s) => s.id !== nuevaSolicitud.id),
                    nuevaSolicitud,
                  ]
                : prev.filter((s) => s.id !== nuevaSolicitud.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [usuario, zonas]);

  // 🔁 Listener realtime para detectar aceptación en postulaciones
  // 🔁 Listener realtime para detectar aceptación en postulaciones
  useEffect(() => {
    if (!usuario) return;

    const canal = supabase
      .channel("postulaciones_oferente_realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "postulaciones",
        },
        async (payload) => {
          console.log("🔄 Payload realtime recibido:", payload); // <--- Añade esto para depuración

          const actualizada = payload.new as {
            estado: string;
            solicitud_id: string;
            oferente_id: string;
          };

          // 🔍 Validación manual del oferente
          if (
            actualizada.estado === "aceptado" &&
            actualizada.oferente_id === usuario.id
          ) {
            const { data: solicitudRelacionada, error } = await supabase
              .from("solicitudes")
              .select("cliente_id")
              .eq("id", actualizada.solicitud_id)
              .single();

            if (error || !solicitudRelacionada) {
              toast.error("❌ No se pudo obtener el cliente.");
              return;
            }

            setSolicitudAceptada({
              solicitud_id: actualizada.solicitud_id,
              cliente_id: solicitudRelacionada.cliente_id,
            });

            toast.success("🎉 ¡Tu postulación ha sido aceptada!");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [usuario]);

  const postularse = async (solicitudId: string) => {
    if (!usuario?.id || !solicitudId) {
      toast.error("Datos incompletos para postularse.");
      return;
    }

    // ✅ Verificar si ya se ha postulado
    const { data: existentes, error: errorCheck } = await supabase
      .from("postulaciones")
      .select("id")
      .eq("oferente_id", usuario.id)
      .eq("solicitud_id", solicitudId);

    if (errorCheck) {
      toast.error("Error al comprobar postulaciones previas.");
      return;
    }

    if (existentes && existentes.length > 0) {
      toast.error("⚠️ Ya te has postulado a esta solicitud.");
      return;
    }

    // ✅ Crear nueva postulación
    const { data: postuData, error: errorPostulacion } = await supabase
      .from("postulaciones")
      .insert([
        {
          oferente_id: usuario.id,
          solicitud_id: solicitudId,
          mensaje: "", // luego puedes permitir que sea personalizado
        },
      ])
      .select()
      .single();

    if (errorPostulacion) {
      toast.error("⚠️ No se ha postulado a esta solicitud.");
      return;
    }

    // ✅ Adjuntar documentos del oferente a documentos_postulacion
    const { data: docs } = await supabase
      .from("documentos")
      .select("tipo, titulo, url")
      .eq("usuario_id", usuario.id);

    if (docs && docs.length > 0) {
      const docsAInsertar = docs.map((d) => ({
        postulacion_id: postuData.id,
        tipo: d.tipo,
        titulo: d.titulo,
        url: d.url,
      }));

      const { error: errorDocs } = await supabase
        .from("documentos_postulacion")
        .insert(docsAInsertar);

      if (errorDocs) {
        toast.error("⚠️ No se han adjuntado los documentos.");
        return;
      }
    }

    setNotificacion("✅ Postulación enviada con documentos");
    setTimeout(() => setNotificacion(null), 5000);
    setPostulacionesIds((prev) => new Set(prev).add(solicitudId));
    navigate("/dashboard/oferente");
  };

  // ✅ Cargar zonas, categorías y solicitudes cuando hay usuario
  useEffect(() => {
    if (!usuario) return;

    const cargarDatos = async () => {
      // 1. Obtener zonas del oferente
      const { data: zonasData } = await supabase
        .from("zonas_trabajo")
        .select("*")
        .eq("usuario_id", usuario.id);

      if (!zonasData) return;

      // 2. Obtener todas las solicitudes (sin filtrar por categoría)
      const { data: solicitudesTodas, error: errorSolicitudes } = await supabase
        .from("solicitudes")
        .select(
          "*, cliente:cliente_id(nombre), categoria, ubicacion, radio_km, descripcion"
        );

      if (errorSolicitudes) {
        console.error("❌ Error al cargar solicitudes:", errorSolicitudes);
        toast.error("⚠️ No se han podido cargar las solicitudes.");
        return;
      }

      // 3. Filtrar solo por zona
      setZonas(zonasData);
      setSolicitudes(solicitudesTodas || []);
      const visibles = filtrarSolicitudesPorZonas(
        solicitudesTodas || [],
        zonasData
      );
      setSolicitudesFiltradas(visibles);
    };

    cargarDatos();
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;

    const cargarPostulaciones = async () => {
      const { data } = await supabase
        .from("postulaciones")
        .select("solicitud_id")
        .eq("oferente_id", usuario.id);

      if (data) {
        const ids = new Set(data.map((p) => p.solicitud_id));
        setPostulacionesIds(ids);
      }
    };

    cargarPostulaciones();
  }, [usuario]);

  return (
    <div className="dashboard">
      {cargandoUsuario ? (
        <div>Cargando usuario...</div>
      ) : !usuario ? (
        <div style={{ color: "red" }}>
          ❌ No se ha podido cargar tu usuario.
        </div>
      ) : (
        <>
          <h2>🛠️ {usuario.nombre}</h2>
          <p>
            {usuario.tratamiento === "Sra" ? "Bienvenida" : "Bienvenido"}. Desde
            aquí puedes gestionar tu perfil y oportunidades.
          </p>

          <DocumentosOferente usuarioId={usuario.id} />
          <ZonasOferente usuarioId={usuario.id} />

          <div style={{ marginTop: "1.5rem" }}>
            <h4>📄 Sobre mí</h4>
            <p>
              <strong>Especialidad:</strong>{" "}
              {usuario.especialidad || "No especificada"}
            </p>
            <p>
              <strong>Descripción:</strong>{" "}
              {usuario.descripcion || "No has escrito aún tu presentación."}
            </p>
            <button
              onClick={() => navigate("/editar-perfil")}
              style={{
                marginTop: "0.5rem",
                padding: "0.4rem 0.8rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              ✏️ Editar perfil
            </button>
          </div>

          {/* Comunicación activa */}
          <div className="dashboard-section">
            <h3>💬 Solicitudes activas</h3>
            <pre
              style={{
                background: "#eee",
                padding: "0.5rem",
                fontSize: "0.8rem",
              }}
            >
              {JSON.stringify(solicitudAceptada, null, 2)}
            </pre>

            {solicitudAceptada ? (
              <>
                <p>
                  Has sido aceptad{usuario.tratamiento === "Sra" ? "a" : "o"}{" "}
                  para una solicitud. Puedes contactar al cliente:
                </p>
                <button
                  onClick={() =>
                    (window.location.href = `/chat?cliente_id=${solicitudAceptada.cliente_id}&oferente_id=${usuario.id}&solicitud_id=${solicitudAceptada.solicitud_id}`)
                  }
                  style={{
                    padding: "0.6rem 1.2rem",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  💬 Acceder al chat con el cliente
                </button>
                {!reseñaEnviada && (
                  <button
                    onClick={() => {
                      setMostrarReseña(true);
                      setPuntuacion(0);
                      setComentario("");
                    }}
                    style={{
                      marginTop: "1rem",
                      padding: "0.6rem 1.2rem",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    ✍️ Valorar al cliente
                  </button>
                )}
              </>
            ) : (
              <p>No tienes solicitudes activas.</p>
            )}
          </div>

          {/* Botón para mostrar solicitudes disponibles */}
          <div className="dashboard-section">
            <button
              onClick={() => setMostrarTodas((prev) => !prev)}
              style={{
                marginBottom: "1rem",
                padding: "0.6rem 1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {mostrarTodas
                ? "🔽 Ocultar solicitudes disponibles"
                : "🔼 Ver solicitudes disponibles"}
            </button>

            {mostrarTodas && (
              <>
                {solicitudesFiltradas.length === 0 ? (
                  <p>No hay solicitudes cercanas.</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {solicitudesFiltradas.map((s) => (
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
                          backgroundColor:
                            seleccionada === s.id ? "#f1f1f1" : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <strong>{s.categoria}</strong> — {s.descripcion}
                        <br />
                        📍 {s.ubicacion} | {s.radio_km} km
                        <br />
                        👤 Cliente: {s.cliente?.nombre || "Desconocido"}
                        <br />
                        {!postulacionesIds.has(s.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              postularse(s.id);
                            }}
                            style={{
                              marginTop: "0.5rem",
                              padding: "0.4rem 0.8rem",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "1px solid #ccc",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            ✅ Postularme
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Notificación flotante */}
      <AnimatePresence>
        {notificacion && (
          <NotificacionFlotante
            mensaje={notificacion}
            onClose={() => setNotificacion(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal de reseña */}
      {mostrarReseña && solicitudAceptada && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "500px",
            }}
          >
            <h3>✍️ Deja una reseña para el cliente</h3>

            <label>Puntuación:</label>
            <select
              value={puntuacion}
              onChange={(e) => setPuntuacion(parseInt(e.target.value))}
              style={{ marginBottom: "1rem", display: "block", width: "100%" }}
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
              style={{ width: "100%", padding: "0.5rem" }}
            />

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              <button
                onClick={async () => {
                  if (!usuario || !solicitudAceptada) return;
                  if (puntuacion >= 4 && comentario.trim() === "") {
                    toast.error(
                      "Añade un comentario si la puntuación es alta."
                    );
                    return;
                  }

                  const { data: existente } = await supabase
                    .from("reseñas")
                    .select("id")
                    .eq("usuario_id", usuario.id)
                    .eq("solicitud_id", solicitudAceptada.solicitud_id)
                    .maybeSingle();

                  if (existente) {
                    toast.error("Ya has enviado una reseña.");
                    setMostrarReseña(false);
                    return;
                  }

                  const { error } = await supabase.from("reseñas").insert([
                    {
                      usuario_id: usuario.id,
                      solicitud_id: solicitudAceptada.solicitud_id,
                      puntuacion,
                      comentario,
                      nombre: usuario.nombre,
                    },
                  ]);

                  if (error) {
                    toast.error("Error al guardar reseña.");
                  } else {
                    toast.success("✅ ¡Gracias por tu reseña!");
                    setMostrarReseña(false);
                    setReseñaEnviada(true);
                    setPuntuacion(0);
                    setComentario("");
                  }
                }}
                style={{
                  padding: "0.7rem 1.5rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Enviar reseña
              </button>
              <button
                onClick={() => setMostrarReseña(false)}
                style={{
                  padding: "0.7rem 1.5rem",
                  backgroundColor: "#ccc",
                  color: "black",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardOferente;
