import { supabase } from "../supabaseClient";
import type { Reseña } from "../types";

export async function fetchResenasPositivas(limit = 3) {
  const { data, error } = await supabase
    .from("reseñas")
    .select("comentario, puntuacion, autor_nombre, destinatario_n")
    .gte("puntuacion", 4)
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((r) => ({
    comentario: r.comentario,
    puntuacion: r.puntuacion,
    nombre: r.destinatario_n || r.autor_nombre || "Usuario anónimo",
  }));
}

export async function createResena(resena: {
  tipo: string;
  autor_id: string;
  autor_nombre: string;
  destinatario_id: string;
  destinatario_n: string;
  solicitud_id: string | null;
  puntuacion: number;
  comentario: string;
}) {
  const { data, error } = await supabase
    .from("reseñas")
    .insert([resena])
    .select()
    .single();

  if (error) throw error;
  return data as Reseña;
}

export async function checkDuplicateResena(
  solicitudId: string,
  autorId: string,
  destinatarioId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("reseñas")
    .select("id")
    .eq("autor_id", autorId)
    .eq("solicitud_id", solicitudId)
    .eq("destinatario_id", destinatarioId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
}
