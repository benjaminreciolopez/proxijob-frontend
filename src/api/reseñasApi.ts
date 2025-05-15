import { supabase } from "../supabaseClient";

export async function obtenerReseñasPositivas(limit = 3) {
  const { data, error } = await supabase
    .from("reseñas")
    .select("mensaje, puntuacion, usuarios(nombre)") // 👈 asumiendo que tienes relación con `usuarios`
    .gte("puntuacion", 4)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error al obtener reseñas:", error.message);
    return [];
  }

  return data;
}
