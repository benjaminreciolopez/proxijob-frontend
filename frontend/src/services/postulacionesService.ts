import { supabase } from "../supabaseClient";
import type { Postulacion, EstadoPostulacion } from "../types";

export async function fetchPostulacionesRecibidas(userId: string) {
  const { data, error } = await supabase
    .from("postulaciones")
    .select(
      `
      id,
      usuario_id,
      mensaje,
      estado,
      created_at,
      solicitud:solicitud_id (
        id,
        descripcion,
        categoria,
        ubicacion,
        usuario_id,
        usuario:usuario_id ( id, nombre )
      ),
      usuario:usuario_id ( id, nombre ),
      documentos:documentos_postulacion (
        id, tipo, titulo, url
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Filter to only postulaciones for solicitudes owned by userId
  const filtered = (data as any[]).filter(
    (p) => p.solicitud && p.solicitud.usuario_id === userId
  );

  return filtered;
}

export async function fetchMisPostulaciones(userId: string) {
  const { data: posts, error } = await supabase
    .from("postulaciones")
    .select("id, mensaje, estado, created_at, solicitud_id")
    .eq("usuario_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  const solicitudIds = posts
    .map((p: any) => p.solicitud_id)
    .filter((id: string, idx: number, arr: string[]) => id && arr.indexOf(id) === idx);

  const { data: solicitudes, error: error2 } = await supabase
    .from("solicitudes")
    .select("id, descripcion, categoria, ubicacion, requiere_profesional")
    .in("id", solicitudIds);

  if (error2) throw error2;

  const solicitudesMap = new Map(
    (solicitudes ?? []).map((s: any) => [s.id, s])
  );

  return posts
    .map((raw: any) => ({
      id: raw.id,
      mensaje: raw.mensaje,
      estado: raw.estado,
      created_at: raw.created_at,
      solicitud: solicitudesMap.get(raw.solicitud_id),
    }))
    .filter((p: any) => !!p.solicitud);
}

export async function createPostulacion(postulacion: {
  solicitud_id: string;
  usuario_id: string;
  mensaje: string;
  estado?: string;
}) {
  const { data, error } = await supabase
    .from("postulaciones")
    .insert([
      {
        ...postulacion,
        estado: postulacion.estado ?? "pendiente",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Postulacion;
}

export async function updateEstadoPostulacion(
  id: string,
  estado: EstadoPostulacion | "descartado"
) {
  const { data, error } = await supabase
    .from("postulaciones")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Postulacion;
}

export async function checkDuplicatePostulacion(
  solicitudId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("postulaciones")
    .select("id")
    .eq("usuario_id", userId)
    .eq("solicitud_id", solicitudId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
