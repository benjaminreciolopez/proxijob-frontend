import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";

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
    <div className="min-h-screen bg-gradient-to-br from-grey-50 to-[#e6e6fa] py-6 px-4">
      <Card className="max-w-2xl mx-auto rounded-2xl shadow-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-grey-200 bg-white">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            🔙 Volver al dashboard
          </Button>
          <h2 className="text-base font-bold text-dark ml-2">Chat</h2>
        </div>

        {/* Messages area */}
        <div
          ref={chatContainerRef}
          className="px-5 py-4 max-h-[500px] overflow-y-auto bg-grey-50 space-y-3"
        >
          {mensajes.length === 0 && (
            <p className="text-center text-grey-400 text-sm py-10">
              No hay mensajes aun. Envia el primero.
            </p>
          )}
          {mensajes.map((msg) => {
            const esMio = msg.emisor_id === usuarioActualId;
            return (
              <div
                key={msg.id}
                className={`flex ${esMio ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                    esMio
                      ? "bg-navy text-white rounded-br-sm"
                      : "bg-white text-grey-800 border border-grey-200 rounded-bl-sm"
                  }`}
                >
                  <div
                    className={`text-xs font-semibold mb-1 ${
                      esMio ? "text-primary-light" : "text-indigo"
                    }`}
                  >
                    {esMio ? "Tu" : msg.nombre_emisor || "Usuario"}
                  </div>
                  <div className="text-sm leading-relaxed">{msg.contenido}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-grey-200 bg-white">
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
            className="flex-1 px-4 py-2.5 text-sm border border-grey-300 rounded-xl bg-grey-50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors placeholder:text-grey-400"
          />
          <Button
            variant="primary"
            size="md"
            onClick={enviarMensaje}
            className="bg-navy hover:bg-[#4b48a3] rounded-xl px-5"
          >
            Enviar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
