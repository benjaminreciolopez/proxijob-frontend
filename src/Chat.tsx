import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import "./styles/dashboard.css";

interface Mensaje {
  id: string;
  solicitud_id: string;
  emisor_id: string;
  receptor_id: string;
  contenido: string;
  created_at: string;
  nombre_emisor: string;
}

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const usuarioAId = searchParams.get("usuario_a_id") ?? "";
  const usuarioBId = searchParams.get("usuario_b_id") ?? "";
  const solicitudId = searchParams.get("solicitud_id") ?? "";

  const [usuarioActualId, setUsuarioActualId] = useState<string>("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Identificar el usuario autenticado
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUsuarioActualId(user.id);
    });
  }, []);

  // Scroll automático
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [mensajes]);

  // Cargar mensajes de la conversación
  useEffect(() => {
    if (!solicitudId || !usuarioAId || !usuarioBId) return;
    const cargarMensajes = async () => {
      // Trae mensajes donde (usuarioA es emisor y usuarioB receptor) O (usuarioB es emisor y usuarioA receptor)
      const { data, error } = await supabase
        .from("mensajes")
        .select("*")
        .eq("solicitud_id", solicitudId)
        .or(
          `(emisor_id.eq.${usuarioAId},receptor_id.eq.${usuarioBId}),` +
            `(emisor_id.eq.${usuarioBId},receptor_id.eq.${usuarioAId})`
        )
        .order("created_at", { ascending: true });

      if (!error && data) setMensajes(data as Mensaje[]);
      else console.error("❌ Error al cargar mensajes:", error?.message);
    };
    cargarMensajes();
  }, [solicitudId, usuarioAId, usuarioBId]);

  // Realtime: escuchar nuevos mensajes
  useEffect(() => {
    if (!solicitudId || !usuarioAId || !usuarioBId) return;
    const canal = supabase
      .channel("chat_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
        },
        (payload) => {
          const nuevo = payload.new as Mensaje;
          // Asegura que pertenece a esta conversación exacta
          const valido =
            nuevo.solicitud_id === solicitudId &&
            ((nuevo.emisor_id === usuarioAId &&
              nuevo.receptor_id === usuarioBId) ||
              (nuevo.emisor_id === usuarioBId &&
                nuevo.receptor_id === usuarioAId));
          if (!valido) return;

          setMensajes((prev) => {
            const yaExiste = prev.some((m) => m.id === nuevo.id);
            return yaExiste ? prev : [...prev, nuevo];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [solicitudId, usuarioAId, usuarioBId]);

  // Enviar mensaje
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !usuarioActualId || !solicitudId) return;

    // Determina receptor: el otro usuario de la conversación
    const receptorId = usuarioActualId === usuarioAId ? usuarioBId : usuarioAId;
    const perfil = JSON.parse(localStorage.getItem("usuario") || "{}");

    const { data, error } = await supabase
      .from("mensajes")
      .insert([
        {
          solicitud_id: solicitudId,
          emisor_id: usuarioActualId,
          receptor_id: receptorId,
          contenido: nuevoMensaje,
          nombre_emisor: perfil.nombre,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setMensajes((prev) => [...prev, data]);
      setNuevoMensaje("");
    }
  };

  return (
    <div className="dashboard">
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "1rem",
          backgroundColor: "#ccc",
          color: "#000",
          border: "none",
          padding: "0.4rem 1rem",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        🔙 Volver al dashboard
      </button>

      <div
        ref={chatContainerRef}
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {mensajes.map((msg) => {
          const esMio = msg.emisor_id === usuarioActualId;
          return (
            <div
              key={msg.id}
              className={`mensaje-burbuja ${esMio ? "mio" : "otro"}`}
            >
              <div className="mensaje-contenido">
                <div className="mensaje-emisor">
                  {esMio ? "Tú" : msg.nombre_emisor || "Usuario"}
                </div>
                <div>{msg.contenido}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              enviarMensaje();
            }
          }}
          placeholder="Escribe tu mensaje..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={enviarMensaje} style={{ padding: "0.5rem 1rem" }}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
