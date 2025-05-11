import React, { useEffect, useState } from "react";
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
  const clienteId = searchParams.get("cliente_id");
  const oferenteId = searchParams.get("oferente_id");
  const solicitudId = searchParams.get("solicitud_id");

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  useEffect(() => {
    if (!solicitudId) return;

    const cargarMensajes = async () => {
      const { data, error } = await supabase
        .from("mensajes")
        .select("*")
        .eq("solicitud_id", solicitudId)
        .order("created_at", { ascending: true });

      if (!error) setMensajes(data || []);
    };

    cargarMensajes();
  }, [solicitudId]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !clienteId || !oferenteId || !solicitudId)
      return;

    const { data, error } = await supabase
      .from("mensajes")
      .insert([
        {
          solicitud_id: solicitudId,
          emisor_id: clienteId,
          tipo_emisor: "cliente",
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
      <h3>💬 Chat con el oferente</h3>
      <div
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
              textAlign: msg.tipo_emisor === "cliente" ? "right" : "left",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                display: "inline-block",
                backgroundColor:
                  msg.tipo_emisor === "cliente" ? "#dcf8c6" : "#f1f0f0",
                padding: "0.5rem 1rem",
                borderRadius: "12px",
                maxWidth: "80%",
              }}
            >
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
