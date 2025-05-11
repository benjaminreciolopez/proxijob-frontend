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

const DashboardOferente: React.FC = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [zonas, setZonas] = useState<ZonaTrabajo[]>([]);
  const [mostrarTodas, setMostrarTodas] = useState(false);

  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState<Solicitud[]>(
    []
  );

  const [usuario, setUsuario] = useState<any>(null);

  async function registrarCategoria(usuarioId: string, nombre: string) {
    const nombreNormalizado = nombre.trim().toLowerCase();

    // Verifica si ya existe la categoría
    const { data: existentes } = await supabase
      .from("categorias")
      .select("id")
      .eq("nombre", nombreNormalizado)
      .single();

    let categoriaId: string | null = null;

    if (existentes) {
      categoriaId = existentes.id;
    } else {
      // Insertar nueva categoría
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

    // Asociar al oferente (si no lo está)
    const { data: yaAsociada } = await supabase
      .from("categorias_oferente")
      .select("id")
      .eq("oferente_id", usuarioId)
      .eq("categoria_id", categoriaId)
      .maybeSingle();

    if (!yaAsociada) {
      await supabase.from("categorias_oferente").insert([
        {
          oferente_id: usuarioId,
          categoria_id: categoriaId,
        },
      ]);
    }
  }

  useEffect(() => {
    const obtenerUsuario = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        toast.error("No estás autenticado.");
        setUsuario(null);
        return;
      }

      // Obtener datos del oferente desde la tabla usuarios
      const { data: datosUsuario, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("nombre, especialidad, descripcion")
        .eq("id", user.id)
        .single();

      if (errorUsuario) {
        toast.error("Error al obtener datos del oferente.");

        setUsuario(user); // fallback mínimo
      } else {
        setUsuario({
          ...user,
          nombre: datosUsuario.nombre,
          especialidad: datosUsuario.especialidad,
          descripcion: datosUsuario.descripcion,
        });
        if (datosUsuario?.especialidad) {
          await registrarCategoria(user.id, datosUsuario.especialidad);
        }
      }

      // Verificar si tiene alguna postulación aceptada
      const { data: aceptada } = await supabase
        .from("postulaciones")
        .select("solicitud_id, solicitud:solicitud_id(cliente_id)")
        .eq("oferente_id", user.id)
        .eq("estado", "aceptado")
        .single();

      if (aceptada) {
        const solicitud = aceptada.solicitud as
          | { cliente_id: string }
          | { cliente_id: string }[];
        const clienteId = Array.isArray(solicitud)
          ? solicitud[0]?.cliente_id
          : solicitud?.cliente_id;

        setSolicitudAceptada({
          solicitud_id: aceptada.solicitud_id,
          cliente_id: clienteId,
        });
      } else {
        setSolicitudAceptada(null);
      }
    };

    obtenerUsuario();
  }, []);

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

    toast.success("✅ Postulación enviada con documentos");
    navigate("/dashboard/oferente");
  };

  const [solicitudAceptada, setSolicitudAceptada] = useState<{
    solicitud_id: string;
    cliente_id: string;
  } | null>(null);

  useEffect(() => {
    if (!usuario) return;

    const cargarDatos = async () => {
      // 1. Obtener zonas del oferente
      const { data: zonasData } = await supabase
        .from("zonas_trabajo")
        .select("*")
        .eq("usuario_id", usuario.id);

      if (!zonasData) return;

      // 2. Obtener solicitudes compatibles por categoría
      // 1. Obtener IDs de categorías del oferente
      const { data: categorias } = await supabase
        .from("categorias_oferente")
        .select("categoria_id")
        .eq("oferente_id", usuario.id);

      if (!categorias || categorias.length === 0) {
        toast.error("No tienes categorías asociadas.");
        return;
      }

      const idsCategoria = categorias.map((c) => c.categoria_id);

      // 2. Obtener solicitudes que tengan esas categorías
      const { data: solicitudesCompatibles, error: errorSolicitudes } =
        await supabase
          .from("solicitudes")
          .select(
            "*, cliente:cliente_id(nombre), categoria_id, ubicacion, radio_km, descripcion"
          )
          .in("categoria_id", idsCategoria);

      if (errorSolicitudes) {
        toast.error("⚠️ No se han podido cargar las solicitudes.");
        return;
      }

      // 3. Filtrar solicitudes por zonas
      setZonas(zonasData);
      setSolicitudes(solicitudesCompatibles);
      const visibles = filtrarSolicitudesPorZonas(
        solicitudesCompatibles,
        zonasData
      );
      setSolicitudesFiltradas(visibles);
    };

    cargarDatos();
  }, [usuario]);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  if (!usuario) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif", color: "red" }}>
        ❌ No se ha podido cargar tu usuario.
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🛠️ {usuario.nombre}</h2>
      <p>Bienvenido. Desde aquí puedes gestionar tu perfil y oportunidades.</p>

      <>
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

        <div style={{ marginTop: "2rem" }}>
          <h3>🔔 Solicitudes disponibles en tu zona</h3>
          {solicitudesFiltradas.length === 0 ? (
            <p>No hay solicitudes cercanas.</p>
          ) : (
            <button
              onClick={() => setMostrarTodas((prev) => !prev)}
              style={{
                marginBottom: "1rem",
                padding: "0.4rem 0.8rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {mostrarTodas ? "🔽 Ver menos" : "🔼 Ver todas"}
            </button>
          )}
          <ul style={{ listStyle: "none", padding: 0 }}>
            {(mostrarTodas ? solicitudes : solicitudesFiltradas).map((s) => (
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
              </li>
            ))}
          </ul>
        </div>

        {solicitudAceptada && (
          <div style={{ marginTop: "2rem" }}>
            <h3>💬 Comunicación activa</h3>
            <p>
              Has sido aceptado para una solicitud. Puedes contactar al cliente:
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
          </div>
        )}
      </>
    </div>
  );
};
export default DashboardOferente;
