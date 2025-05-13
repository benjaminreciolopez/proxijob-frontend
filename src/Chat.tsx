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

  const [emisorId, setEmisorId] = useState<string>("");
  const [tipoEmisor, setTipoEmisor] = useState<"cliente" | "oferente" | null>(
    null
  );

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ✅ Obtener usuario autenticado
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmisorId(user.id);
        if (user.id === clienteId) {
          setTipoEmisor("cliente");
        } else if (user.id === oferenteId) {
          setTipoEmisor("oferente");
        } else {
          console.warn("⚠️ El usuario no coincide con cliente ni oferente");
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

  // ✅ Realtime: escuchar nuevos mensajes
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

          // ❌ Ignorar si ya existe
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
  }, [solicitudId]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !emisorId || !tipoEmisor || !solicitudId)
      return;

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

    if (!error && data) {
      setMensajes((prev) => [...prev, data]);
      setNuevoMensaje("");
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "auto" }}>
      <h3>💬 Chat</h3>
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
                  : msg.tipo_emisor === "cliente"
                  ? "Cliente"
                  : "Oferente"}
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
