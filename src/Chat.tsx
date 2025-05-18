import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import "./styles/dashboard.css";

interface Mensaje {
  id: string;
  emisor_id: string;
  tipo_emisor: "cliente" | "oferente";
  contenido: string;
  created_at: string;
  nombre_emisor: string;
}

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clienteId = searchParams.get("cliente_id") ?? "";
  const oferenteId = searchParams.get("oferente_id") ?? "";
  const solicitudId = searchParams.get("solicitud_id") ?? "";

  const [emisorId, setEmisorId] = useState<string>("");
  const [tipoEmisor, setTipoEmisor] = useState<"cliente" | "oferente" | null>(
    null
  );

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ✅ Intentar obtener tipoEmisor desde el usuario autenticado
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmisorId(user.id);

        if (user.id === clienteId) {
          setTipoEmisor("cliente");
        } else if (user.id === oferenteId) {
          setTipoEmisor("oferente");
        } else {
          // ⚠️ Fallback desde localStorage si no coincide
          const rol = localStorage.getItem("rol");
          if (rol === "cliente" || rol === "oferente") {
            setTipoEmisor(rol);
          } else {
            console.warn("⚠️ Rol no identificado");
          }
        }
      }
    });
  }, [clienteId, oferenteId]);

  // ✅ Scroll automático
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [mensajes]);

  // ✅ Cargar mensajes
  useEffect(() => {
    if (!solicitudId || !clienteId || !oferenteId) return;

    const cargarMensajes = async () => {
      const { data, error } = await supabase
        .from("mensajes")
        .select("*")
        .eq("solicitud_id", solicitudId)
        .eq("cliente_id", clienteId)
        .eq("oferente_id", oferenteId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setMensajes(data);
      } else {
        console.error("❌ Error al cargar mensajes:", error?.message);
      }
    };

    cargarMensajes();
  }, [solicitudId, clienteId, oferenteId]);

  // ✅ Realtime: escuchar nuevos mensajes
  useEffect(() => {
    if (!solicitudId || !clienteId || !oferenteId) return;

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
          const nuevo = payload.new as any;

          // Asegurarse de que el mensaje pertenece a esta conversación exacta
          const coincide =
            nuevo.solicitud_id === solicitudId &&
            nuevo.cliente_id === clienteId &&
            nuevo.oferente_id === oferenteId;

          if (!coincide) return;

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
  }, [solicitudId, clienteId, oferenteId]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !emisorId || !tipoEmisor || !solicitudId)
      return;
    const perfil = JSON.parse(localStorage.getItem("usuario") || "{}");

    const { data, error } = await supabase
      .from("mensajes")
      .insert([
        {
          solicitud_id: solicitudId,
          emisor_id: emisorId,
          tipo_emisor: tipoEmisor,
          contenido: nuevoMensaje,
          cliente_id: clienteId,
          oferente_id: oferenteId,
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
        onClick={() =>
          navigate(
            tipoEmisor === "cliente"
              ? "/dashboard/cliente"
              : "/dashboard/oferente"
          )
        }
        disabled={!tipoEmisor}
        style={{
          marginBottom: "1rem",
          backgroundColor: "#ccc",
          color: "#000",
          border: "none",
          padding: "0.4rem 1rem",
          borderRadius: "6px",
          cursor: tipoEmisor ? "pointer" : "not-allowed",
          opacity: tipoEmisor ? 1 : 0.6,
        }}
      >
        {tipoEmisor ? "🔙 Volver al dashboard" : "Cargando..."}
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
          const esMio = msg.emisor_id === emisorId;
          return (
            <div
              key={msg.id}
              className={`mensaje-burbuja ${esMio ? "mio" : "otro"}`}
            >
              <div className="mensaje-contenido">
                <div className="mensaje-emisor">
                  {esMio
                    ? "Tú"
                    : msg.nombre_emisor ||
                      (msg.tipo_emisor === "cliente" ? "Cliente" : "Oferente")}
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
