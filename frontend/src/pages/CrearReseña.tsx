import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

const CrearReseña: React.FC = () => {
  const [searchParams] = useSearchParams();
  const solicitud_id = searchParams.get("solicitud_id");
  const autor_id = searchParams.get("usuario_id");
  const destinatario_id = searchParams.get("destinatario_id");
  const nombre_destinatario =
    searchParams.get("nombre") || "Usuario desconocido";
  const tipo = searchParams.get("tipo"); // "cliente", "oferente", etc.
  const autor_nombre = searchParams.get("autor_nombre") || ""; // puede venir vacío

  const [puntuacion, setPuntuacion] = useState<number>(0);
  const [comentario, setComentario] = useState("");
  const [enviada, setEnviada] = useState(false);
  const [yaExiste, setYaExiste] = useState(false);
  const navigate = useNavigate();

  // Comprobación: ¿faltan parámetros críticos?
  if (!tipo || !autor_id || !destinatario_id) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "500px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2>Error</h2>
        <p>
          Faltan datos para dejar una reseña. Vuelve a intentarlo desde la
          plataforma.
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: "1rem",
            padding: "0.7rem 1.5rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Volver atrás
        </button>
      </div>
    );
  }

  // ¿Ya existe reseña?
  useEffect(() => {
    if (!tipo || !autor_id || !destinatario_id) return;
    let filtro: any = { autor_id, tipo, destinatario_id };
    if (solicitud_id) filtro.solicitud_id = solicitud_id;
    async function checkExistente() {
      const { data } = await supabase
        .from("reseñas")
        .select("id")
        .match(filtro)
        .maybeSingle();
      setYaExiste(!!data);
    }
    checkExistente();
    // eslint-disable-next-line
  }, [tipo, autor_id, destinatario_id, solicitud_id]);

  const handleEnviar = async () => {
    if (!puntuacion) {
      toast.error("Selecciona una puntuación.");
      return;
    }
    if (puntuacion >= 4 && comentario.trim() === "") {
      toast.error("Por favor, añade un comentario si la puntuación es alta.");
      return;
    }
    if (yaExiste) {
      toast.error("Ya has dejado una reseña.");
      return;
    }

    const nuevaReseña: any = {
      tipo,
      autor_id,
      autor_nombre,
      solicitud_id: solicitud_id || null,
      destinatario_id,
      destinatario_n: nombre_destinatario,
      puntuacion,
      comentario,
    };

    const { error } = await supabase.from("reseñas").insert([nuevaReseña]);
    if (error) {
      toast.error("Error al guardar la reseña.");
      console.error(error);
    } else {
      setEnviada(true);
      toast.success("¡Gracias por tu reseña!");
      setTimeout(() => navigate(-1), 1200);
    }
  };

  if (yaExiste) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "500px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2>Reseña ya enviada</h2>
        <p>Ya has dejado una reseña para {nombre_destinatario}.</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: "1rem",
            padding: "0.7rem 1.5rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Volver atrás
        </button>
      </div>
    );
  }

  if (enviada) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "500px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2>¡Reseña enviada!</h2>
        <p>Gracias por tu valoración.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Deja tu reseña</h2>
      <p>Para: {nombre_destinatario}</p>
      <div style={{ margin: "1rem 0" }}>
        <label>Puntuación:</label>
        <select
          value={puntuacion}
          onChange={(e) => setPuntuacion(parseInt(e.target.value))}
        >
          <option value={0}>Selecciona una puntuación</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} ⭐
            </option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Comentario (obligatorio si das 4 o 5 estrellas)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: "0.5rem" }}
      />
      <button
        onClick={handleEnviar}
        style={{
          marginTop: "1rem",
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
    </div>
  );
};

export default CrearReseña;
