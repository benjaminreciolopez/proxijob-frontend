import { supabase } from "../supabaseClient";

export async function obtenerReseñasPositivas(limit = 3) {
  const { data, error } = await supabase
    .from("reseñas")
    .select(
      `
      comentario,
      puntuacion,
      cliente:cliente_id (nombre),
      oferente:oferente_id (nombre)
    `
    )
    .gte("puntuacion", 4)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error al obtener reseñas:", error.message);
    return [];
  }

  return (data ?? []).map((r: any) => {
    const cliente = Array.isArray(r.cliente) ? r.cliente[0] : r.cliente;
    const oferente = Array.isArray(r.oferente) ? r.oferente[0] : r.oferente;

    return {
      comentario: r.comentario,
      puntuacion: r.puntuacion,
      nombre: cliente?.nombre || oferente?.nombre || "Usuario anónimo",
    };
  });
}
