import { supabase } from "../supabaseClient";
import type { Notificacion } from "../types";

export async function fetchNotificaciones(
  userId: string,
  limit = 20
): Promise<Notificacion[]> {
  const { data, error } = await supabase
    .from("notificaciones")
    .select("*")
    .eq("usuario_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Notificacion[];
}

export async function countUnread(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notificaciones")
    .select("*", { count: "exact", head: true })
    .eq("usuario_id", userId)
    .eq("leida", false);

  if (error) throw error;
  return count ?? 0;
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", id);

  if (error) throw error;
}

export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("usuario_id", userId)
    .eq("leida", false);

  if (error) throw error;
}
