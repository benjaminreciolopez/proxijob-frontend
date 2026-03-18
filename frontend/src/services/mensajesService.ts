import { supabase } from "../supabaseClient";
import type { Mensaje } from "../types";

export async function fetchMensajes(
  solicitudId: string,
  usuarioAId: string,
  usuarioBId: string
) {
  const { data, error } = await supabase
    .from("mensajes")
    .select("*")
    .eq("solicitud_id", solicitudId)
    .or(
      `(emisor_id.eq.${usuarioAId},receptor_id.eq.${usuarioBId}),` +
        `(emisor_id.eq.${usuarioBId},receptor_id.eq.${usuarioAId})`
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Mensaje[];
}

export async function sendMensaje(mensaje: {
  solicitud_id: string;
  emisor_id: string;
  receptor_id: string;
  contenido: string;
  nombre_emisor: string;
}) {
  const { data, error } = await supabase
    .from("mensajes")
    .insert([mensaje])
    .select()
    .single();

  if (error) throw error;
  return data as Mensaje;
}
