import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "./supabaseClient";

interface Mensaje {
  id: string;
  emisor_id: string;
  tipo_emisor: "cliente" | "oferente";
  contenido: string;
  created_at: string;
}

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const clienteId = searchParams.get("cliente_id") ?? "";
  const oferenteId = searchParams.get("oferente_id") ?? "";
  const solicitudId = searchParams.get("solicitud_id") ?? "";
  const tipoEmisor: "cliente" | "oferente" = searchParams.get("cliente_id")
    ? "cliente"
    : "oferente";

  const emisorId = tipoEmisor === "cliente" ? clienteId : oferenteId;

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth", // 👈 desplazamiento suave
      });
    }
  }, [mensajes]);

  useEffect(() => {
    if (!solicitudId) return;

    const cargarMensajes = async () => {
      const { data, error } = await supabase
        .from("mensajes")
        .select("*")
        .eq("solicitud_id", solicitudId)
        .order("created_at", { ascending: true });

      if (!error && data) setMensajes(data);
    };

    cargarMensajes();
  }, [solicitudId]);

  useEffect(() => {
    if (!solicitudId) return;

    const canal = supabase
      .channel("chat_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `solicitud_id=eq.${solicitudId}`,
        },
        (payload) => {
          const nuevo = payload.new as Mensaje;

          // ⛔️ Ignora si el mensaje es tuyo
          if (nuevo.emisor_id === emisorId) return;

          setMensajes((prev) => [...prev, nuevo]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [solicitudId, emisorId]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !emisorId || !solicitudId) return;

    const { data, error } = await supabase
      .from("mensajes")
      .insert([
        {
          solicitud_id: solicitudId,
          emisor_id: emisorId,
          tipo_emisor: tipoEmisor,
          contenido: nuevoMensaje,
        },
      ])
      .select()
      .single();

    if (!error) {
      setNuevoMensaje(""); // ✅ Limpiar solo el input
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h3>💬 Chat con el oferente</h3>
      <div
        ref={chatContainerRef}
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {mensajes.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent:
                msg.emisor_id === emisorId ? "flex-end" : "flex-start",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                backgroundColor:
                  msg.emisor_id === emisorId ? "#dcf8c6" : "#f1f0f0",
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                maxWidth: "80%",
              }}
            >
              <div style={{ fontSize: "0.75rem", color: "#555" }}>
                {msg.emisor_id === emisorId
                  ? "Tú"
                  : tipoEmisor === "cliente"
                  ? "Oferente"
                  : "Cliente"}
              </div>
              {msg.contenido}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
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
