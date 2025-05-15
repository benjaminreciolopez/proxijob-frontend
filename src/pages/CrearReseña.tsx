// src/pages/CrearReseña.tsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

const CrearReseña: React.FC = () => {
  const [searchParams] = useSearchParams();
  const solicitud_id = searchParams.get("solicitud_id");
  const usuario_id = searchParams.get("usuario_id");
  const nombre = searchParams.get("nombre");

  const [puntuacion, setPuntuacion] = useState<number>(0);
  const [comentario, setComentario] = useState("");
  const navigate = useNavigate();

  const handleEnviar = async () => {
    if (!puntuacion || !usuario_id || !solicitud_id || !nombre) {
      toast.error("Faltan datos para enviar la reseña.");
      return;
    }

    if (puntuacion >= 4 && comentario.trim() === "") {
      toast.error("Por favor, añade un comentario si la puntuación es alta.");
      return;
    }

    // ❗ Consulta si ya existe una reseña para esa solicitud y usuario
    const { data: existente, error: errorExistente } = await supabase
      .from("reseñas")
      .select("*")
      .eq("usuario_id", usuario_id)
      .eq("solicitud_id", solicitud_id)
      .maybeSingle();

    if (errorExistente) {
      toast.error("Error al comprobar reseña existente.");
      console.error(errorExistente);
      return;
    }

    if (existente) {
      toast.error("Ya has dejado una reseña para esta solicitud.");
      return;
    }

    // ✅ Insertar reseña
    const { data, error } = await supabase.from("reseñas").insert([
      {
        usuario_id,
        solicitud_id,
        puntuacion,
        comentario,
        nombre,
      },
    ]);

    if (error) {
      toast.error("Error al guardar la reseña.");
      console.error(error);
    } else {
      toast.success("¡Gracias por tu reseña!");
      navigate(-1); // vuelve a la pantalla anterior
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Deja tu reseña</h2>
      <p>Para: {nombre}</p>

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
