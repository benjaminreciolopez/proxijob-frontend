import { supabase } from "../supabaseClient";
import type { Solicitud } from "../types";

export async function fetchSolicitudesPendientes() {
  const { data, error } = await supabase
    .from("solicitudes")
    .select("*, usuarios(nombre, tratamiento)")
    .eq("estado", "pendiente")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Solicitud[];
}

export async function fetchMisSolicitudes(userId: string) {
  const { data, error } = await supabase
    .from("solicitudes")
    .select("*")
    .eq("usuario_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Solicitud[];
}

export async function createSolicitud(solicitud: {
  usuario_id: string;
  descripcion: string;
  categoria: string | null;
  ubicacion: string;
  requiere_profesional: boolean;
  latitud?: number | null;
  longitud?: number | null;
  radio_km?: number;
}) {
  const { data, error } = await supabase
    .from("solicitudes")
    .insert([solicitud])
    .select()
    .single();

  if (error) throw error;
  return data as Solicitud;
}

export async function updateSolicitud(
  id: string,
  updates: Partial<Pick<Solicitud, "descripcion" | "categoria" | "ubicacion" | "requiere_profesional" | "estado">>
) {
  const { data, error } = await supabase
    .from("solicitudes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Solicitud;
}

export async function deleteSolicitud(id: string) {
  const { error } = await supabase
    .from("solicitudes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
