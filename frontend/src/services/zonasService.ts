import { supabase } from "../supabaseClient";
import type { ZonaTrabajo } from "../types";

export async function fetchZonas(userId: string) {
  const { data, error } = await supabase
    .from("zonas_trabajo")
    .select("*")
    .eq("usuario_id", userId);

  if (error) throw error;
  return data as ZonaTrabajo[];
}

export async function createZona(zona: {
  usuario_id: string;
  latitud: number;
  longitud: number;
  radio_km: number;
}) {
  const { data, error } = await supabase
    .from("zonas_trabajo")
    .insert([zona])
    .select()
    .single();

  if (error) throw error;
  return data as ZonaTrabajo;
}

export async function deleteZona(id: string) {
  const { error } = await supabase
    .from("zonas_trabajo")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
