import { supabase } from "../supabaseClient";

export async function obtenerReseñasPositivas(limit = 3) {
  const { data, error } = await supabase
    .from("reseñas")
    .select("comentario, puntuacion, autor_nombre, destinatario_n")
    .gte("puntuacion", 4)
    .limit(limit);

  if (error) {
    console.error("Error al obtener reseñas:", error.message);
    return [];
  }

  return (data ?? []).map((r) => ({
    comentario: r.comentario,
    puntuacion: r.puntuacion,
    nombre: r.destinatario_n || r.autor_nombre || "Usuario anónimo",
  }));
}
