import { supabase } from "../supabaseClient";
import type { Documento } from "../types";

export async function fetchDocumentos(userId: string) {
  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("usuario_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Documento[];
}

export async function uploadDocumento(
  file: File,
  userId: string,
  metadata: { tipo: string; titulo: string }
) {
  const nombre = `${userId}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("documentos")
    .upload(nombre, file);

  if (uploadError) throw uploadError;

  const url = supabase.storage
    .from("documentos")
    .getPublicUrl(nombre).data.publicUrl;

  const { data, error } = await supabase
    .from("documentos")
    .insert([
      {
        usuario_id: userId,
        tipo: metadata.tipo.trim().toLowerCase(),
        titulo: metadata.titulo,
        url,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Documento;
}

export async function updateDocumento(
  id: string,
  updates: Partial<Pick<Documento, "tipo" | "titulo" | "url">>
) {
  const normalized = updates.tipo
    ? { ...updates, tipo: updates.tipo.trim().toLowerCase() }
    : updates;

  const { data, error } = await supabase
    .from("documentos")
    .update(normalized)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Documento;
}

export async function deleteDocumento(id: string, url: string) {
  // Extract storage path from the public URL
  const parts = url.split("/");
  const nombreArchivo = decodeURIComponent(parts.slice(-2).join("/"));

  const { error: storageError } = await supabase.storage
    .from("documentos")
    .remove([nombreArchivo]);

  if (storageError) {
    console.warn("No se pudo eliminar del Storage:", storageError.message);
  }

  const { error } = await supabase
    .from("documentos")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
